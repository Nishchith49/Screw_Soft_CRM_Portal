import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthenticationService } from '../../../_services/authentication.service';
import { LoginCommand, LoginResponse, LoginResponseServiceResponse, AccountsService } from '../../../../../dotnet/openapi';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {

  signInForm = new FormGroup({
    emailId: new FormControl<string | null>(null, [Validators.required, Validators.email]),
    password: new FormControl<string | null>(null, [Validators.required])
  });

  isLoading = false;
  userDate?: LoginResponse;
  returnUrl?: string;

  constructor(
    private _route: ActivatedRoute,
    private _authenticationService: AuthenticationService,
    private _router: Router,
    private _accountsService: AccountsService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    const url = this._route.snapshot.queryParams['returnUrl'];
    if (url) {
      this.returnUrl = window.atob(url);
    }

    this._authenticationService._loginListener.subscribe(res => {
      if (res && this._authenticationService.isSuperAdminLogin) {
        this._router.navigateByUrl(this.returnUrl || '/admin/dashboard');
      }
    });

    this._authenticationService.handleUserAuthentication();
  }

  onSubmit(): void {
    if (this.signInForm.invalid) {
      this.signInForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.signInForm.disable();

    const loginModel: LoginCommand = {
      email: this.signInForm.controls.emailId.value?.trim(),
      password: this.signInForm.controls.password.value?.trim()
    };

    this._accountsService.apiAccountsLoginPost(loginModel).subscribe({
      next: (res: LoginResponseServiceResponse) => {
        this.isLoading = false;
        this.signInForm.enable();

        if (res.statusCode === 200) {
          if (res.data?.accessToken) {
            localStorage.setItem('token', res.data.accessToken);
          }
          localStorage.removeItem('userData');

          this._snackBar.open(res.message ?? 'Logged in successfully', 'Close', {
            duration: 3000,
            panelClass: ['snack-success']
          });

          this._router.navigate(['/admin/dashboard']);
        } else {
          this._snackBar.open(res.message ?? 'Login failed', 'Close', {
            duration: 3000,
            panelClass: ['snack-error']
          });
        }
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.signInForm.enable();

        const message = !navigator.onLine
          ? 'Internet Connection Lost. Please check your connectivity.'
          : 'Something went wrong. Please try again later.';

        this._snackBar.open(message, 'Close', {
          duration: 4000,
          panelClass: ['snack-error']
        });
      }
    });
  }
}
