import { Inject, Injectable } from '@angular/core';
import { BROWSER_STORAGE } from '../storage';
import { User } from '../models/user';
import { AuthResponse } from '../models/auth-response';
import { TripDataService } from '../services/trip-data.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  authResp: AuthResponse = new AuthResponse();

  constructor(
    @Inject(BROWSER_STORAGE) private storage: Storage,
    private tripDataService: TripDataService
  ) {}

  // Retrieve the stored token, or an empty string.
  public getToken(): string {
    return this.storage.getItem('travlr-token') ?? '';
  }

  // Save the authentication token.
  public saveToken(token: string): void {
    this.storage.setItem('travlr-token', token);
  }

  // Remove the token when logging out.
  public logout(): void {
    this.storage.removeItem('travlr-token');
  }

  // Decode the JWT payload safely.
  private getPayload(): {
    email: string;
    name: string;
    exp: number;
  } | null {
    const token = this.getToken();

    if (!token) {
      return null;
    }

    try {
      const parts = token.split('.');

      if (parts.length !== 3) {
        return null;
      }

      // JWT uses Base64URL encoding.
      const base64 = parts[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      const padded = base64.padEnd(
        Math.ceil(base64.length / 4) * 4,
        '='
      );

      const bytes = Uint8Array.from(
        atob(padded),
        character => character.charCodeAt(0)
      );

      const payload = JSON.parse(new TextDecoder().decode(bytes));

      if (
        !payload ||
        typeof payload.email !== 'string' ||
        typeof payload.name !== 'string' ||
        typeof payload.exp !== 'number'
      ) {
        return null;
      }

      return payload;
    } catch {
      return null;
    }
  }

  // Check whether the token exists and has not expired.
  public isLoggedIn(): boolean {
    const payload = this.getPayload();

    return payload !== null && payload.exp > Date.now() / 1000;
  }

  // Call this only after checking isLoggedIn().
  public getCurrentUser(): User {
    const payload = this.getPayload();

    if (!payload || payload.exp <= Date.now() / 1000) {
      throw new Error('No valid logged-in user.');
    }

    return {
      email: payload.email,
      name: payload.name
    } as User;
  }

public login(user: User, passwd: string): Observable<AuthResponse> {
  return this.tripDataService.login(user, passwd).pipe(
    tap((response: AuthResponse) => {
      if (!response?.token) {
        throw new Error('Login response did not contain a token.');
      }

      this.authResp = response;
      this.saveToken(response.token);
    })
  );
}

  public register(user: User, passwd: string): void {
    this.tripDataService.register(user, passwd).subscribe({
      next: (value: AuthResponse) => {
        if (value?.token) {
          this.authResp = value;
          this.saveToken(value.token);
        }
      },
      error: (error: unknown) => {
        console.error('Registration failed:', error);
      }
    });
  }
}