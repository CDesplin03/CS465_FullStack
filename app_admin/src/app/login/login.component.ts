import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from "@angular/forms";
import { Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { User } from '../models/user';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  public formError: string = '';
  submitted = false;

  credentials = {
    name: '',
    email: '',
    password: ''
  }

constructor(
  private router: Router,
  private authenticationService: AuthenticationService
  ) { }
  ngOnInit(): void {
}
public onLoginSubmit(): void {
  this.formError = '';
  this.submitted = true;

  this.credentials.email = this.credentials.email.trim();

  if (!this.credentials.email || !this.credentials.password) {
    this.formError = 'Email and password are required, please try again';
    return;
  }

  this.doLogin();
}

private doLogin(): void {
  let newUser = {
    name: this.credentials.name,
    email: this.credentials.email
  } as User;

  this.authenticationService
    .login(newUser, this.credentials.password)
    .subscribe({
      next: () => {
        // The service saves the token before this callback runs.
        if (this.authenticationService.isLoggedIn()) {
          this.router.navigate(['']);
        } else {
          this.formError =
            'Login returned a token, but it is invalid or expired.';
        }
      },
      error: (error) => {
        if (error.status === 401) {
          this.formError = 'Email or password is incorrect.';
        } else if (error.status === 0) {
          this.formError =
            'Unable to connect to the login server. Check the server and CORS configuration.';
        } else {
          this.formError =
            'Login failed. Check the login request in the Network tab.';
        }
      }
    });
}

}
