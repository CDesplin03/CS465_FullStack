import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';

import { Router } from '@angular/router';
import { TripDataService } from '../services/trip-data.service';
import { Trip } from '../models/trip';

@Component({
  selector: 'app-edit-trip',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-trip.component.html',
  styleUrl: './edit-trip.component.css'
})

export class EditTripComponent implements OnInit {

  public editForm!: FormGroup;
  trip!: Trip;
  submitted = false;
  message: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private tripDataService: TripDataService
  ) {}

  ngOnInit(): void {

    // Retrieve the stored trip code
    const tripCode = localStorage.getItem('tripCode');

    if (!tripCode) {
      alert("Something wrong, couldn't find where I stashed tripCode!");
      this.router.navigate(['']);
      return;
    }

    console.log('EditTripComponent::ngOnInit');
    console.log('tripCode: ' + tripCode);

    // Initialize the form
    this.editForm = this.formBuilder.group({
      _id: [],
      code: [tripCode, Validators.required],
      name: ['', Validators.required],
      length: ['', Validators.required],
      start: ['', Validators.required],
      resort: ['', Validators.required],
      perPerson: ['', Validators.required],
      image: ['', Validators.required],
      description: ['', Validators.required]
    });

    // Retrieve trip information from the API
    this.tripDataService.getTrip(tripCode)
      .subscribe({
        next: (value: Trip[]) => {

          if (!value || value.length === 0) {
            this.message = 'No Trip Retrieved!';
            console.log(this.message);
            return;
          }

          // Store the retrieved trip
          this.trip = value[0];

          // Populate the form with existing trip data
          this.editForm.patchValue({
            ...this.trip,
            start: this.trip.start
              ? String(this.trip.start).substring(0, 10)
              : ''
          });

          this.message = 'Trip: ' + tripCode + ' retrieved';
          console.log(this.message);
        },

        error: (error) => {
          console.error('Error retrieving trip:', error);
          this.message = 'Error retrieving trip';
        }
      });
  }

  // Getter for form controls used in the HTML
  get f() {
    return this.editForm.controls;
  }

  // Submit updated trip information
  public onSubmit(): void {

    this.submitted = true;

    // Stop submission if form is invalid
    if (this.editForm.invalid) {
      return;
    }

    this.tripDataService.updateTrip(this.editForm.value)
      .subscribe({
        next: (value: Trip) => {
          console.log('Trip updated successfully:', value);

          // Return to the home page
          this.router.navigate(['']);
        },

        error: (error) => {
          console.error('Error updating trip:', error);
          this.message = 'Error updating trip';
        }
      });
  }
}
