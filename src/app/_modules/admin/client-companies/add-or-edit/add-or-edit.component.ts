import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ClientCompaniesService, APIResponse, ClientCompanyModelServiceResponse, CreateClientCompanyCommand, UpdateClientCompanyCommand } from '../../../../../../dotnet/openapi'
import { HttpErrorResponse } from '@angular/common/http';
import { AuthenticationService } from '../../../../_services/authentication.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-or-edit.component',
  imports: [RouterModule, ReactiveFormsModule, CommonModule],
  templateUrl: './add-or-edit.component.html',
  styleUrl: './add-or-edit.component.scss'
})
export class AddOrEditComponent implements OnInit {
  addOrEditClientCompanyForm = new FormGroup({
    companyName: new FormControl('', Validators.required),
    contactPersonName: new FormControl('', Validators.required),
    contactEmail: new FormControl('', [Validators.required, Validators.email]),
    contactPhone: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]),
    designation: new FormControl('', Validators.required),
    companyWebsite: new FormControl('', Validators.required),
    linkedInProfile: new FormControl(''),
    location: new FormControl(''),
    notes: new FormControl('')
  });

  get f() {
    return this.addOrEditClientCompanyForm
  }

  isFieldRequired(fieldName: string): boolean {
    const control = this.f.get(fieldName);
    if (control?.validator) {
      const validator = control.validator({} as any);
      return validator && validator['required'];
    }
    return false;
  }

  isLoading = false;
  clientCompanyId: string | null | undefined
  isLoadingData = false;
  isError = false;
  errorData: any;

  constructor(
    private _clientCompaniesService: ClientCompaniesService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _authenticationService: AuthenticationService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.clientCompanyId = this._route.snapshot.queryParamMap.get('clientCompanyId')
    if (this.clientCompanyId) {
      this.isLoadingData = true;
      this._clientCompaniesService.apiAdminClientCompaniesGetClientCompanyGet(this.clientCompanyId).subscribe({
        next: (res: ClientCompanyModelServiceResponse) => {
          this.isLoadingData = false;
          if (res.statusCode === 200 && res.data) {
            this.addOrEditClientCompanyForm.patchValue(res.data);
          }
          else {
            this.isError = true;
            this.errorData = {
              imgSrc: "../../../../../assets/images/icons/error.png",
              errorTitleMessage: "Something went wrong",
              errorSubTitleMessage: "Please try after sometime!",
            }
          }
        }, error: (error: HttpErrorResponse) => {
          this.isLoadingData = false;
          this.isError = true;
          if (!navigator.onLine) {
            this.errorData = {
              imgSrc: "../../../../../assets/images/icons/no-signal.png",
              errorTitleMessage: "Internet connection lost",
              errorSubTitleMessage: "Please check your internet connection!",
            }
          }
          else if (error.status == 401) {
            this._authenticationService.logout();
          }
          else {
            this.errorData = {
              imgSrc: "../../../../../assets/images/icons/error.png",
              errorTitleMessage: "Something went wrong",
              errorSubTitleMessage: "Please try after sometime!",
            }
          }
        },
      });
    }
  }

  onSubmit(): void {
    if (!this.clientCompanyId) {
      if (this.addOrEditClientCompanyForm.valid) {
        const createClientCompanyCommand: CreateClientCompanyCommand = {
          companyName: this.f.get('companyName')?.value ?? '',
          contactPersonName: this.f.get('contactPersonName')?.value ?? '',
          contactEmail: this.f.get('contactEmail')?.value ?? '',
          contactPhone: this.f.get('contactPhone')?.value ?? '',
          designation: this.f.get('designation')?.value ?? '',
          companyWebsite: this.f.get('companyWebsite')?.value ?? '',
          linkedInProfile: this.f.get('linkedInProfile')?.value ?? '',
          location: this.f.get('location')?.value ?? '',
          notes: this.f.get('notes')?.value ?? ''
        }
        this.isLoading = true;
        this.addOrEditClientCompanyForm.disable()
        this._clientCompaniesService.apiAdminClientCompaniesAddClientCompanyPost(createClientCompanyCommand).subscribe({
          next: (res: APIResponse) => {
            this.isLoading = false;
            this.addOrEditClientCompanyForm.enable();
            localStorage.removeItem('userData')
            if (res.statusCode === 200) {
              this._router.navigateByUrl('/admin/clientCompanies/list');
              this._snackBar.open(res.message ?? 'Client Company created successfully', 'Close', {
                duration: 3000,
                panelClass: ['snack-success']
              });
            }
            else {
              this._snackBar.open(res.message ?? 'Something went wrong, Please try after sometime', 'Close', {
                duration: 3000,
                panelClass: ['snack-error']
              });
            }
          },
          error: (error: HttpErrorResponse) => {
            this.isLoading = false;
            this.addOrEditClientCompanyForm.enable();
            if (navigator.onLine) {
              this._snackBar.open('Something went wrong, Please try after sometime', 'Close', {
                duration: 3000,
                panelClass: ['snack-error']
              });
            }
            else if (error.status == 401) {
              this._authenticationService.logout();
            }
            else {
              this._snackBar.open('Internet Connection Lost, Please check your connectivity', 'Close', {
                duration: 3000,
                panelClass: ['snack-error']
              });
            }
          }
        })
      }
      else {
        this._snackBar.open('Please enter client company details', 'Close', {
          duration: 3000,
          panelClass: ['snack-error']
        });
        this.addOrEditClientCompanyForm.markAllAsTouched();
        return;
      }
    }
    else {
      if (this.addOrEditClientCompanyForm.valid) {
        const updateClientCompanyCommand: UpdateClientCompanyCommand = {
          companyName: this.f.get('companyName')?.value ?? '',
          contactPersonName: this.f.get('contactPersonName')?.value ?? '',
          contactEmail: this.f.get('contactEmail')?.value ?? '',
          contactPhone: this.f.get('contactPhone')?.value ?? '',
          designation: this.f.get('designation')?.value ?? '',
          companyWebsite: this.f.get('companyWebsite')?.value ?? '',
          linkedInProfile: this.f.get('linkedInProfile')?.value ?? '',
          location: this.f.get('location')?.value ?? '',
          notes: this.f.get('notes')?.value ?? '',
          id: this.clientCompanyId ?? ''
        }
        this.isLoading = true;
        this.addOrEditClientCompanyForm.disable();
        this._clientCompaniesService.apiAdminClientCompaniesUpdateClientCompanyPut(updateClientCompanyCommand).subscribe({
          next: (res: APIResponse) => {
            this.isLoading = false;
            this.addOrEditClientCompanyForm.enable();
            localStorage.removeItem('userData');
            if (res.statusCode === 200) {
              this._router.navigateByUrl('/admin/client-companies/list');
              this._snackBar.open(res.message ?? 'Client Company updated successfully', 'Close', {
                duration: 3000,
                panelClass: ['snack-success']
              });
            }
            else {
              this._snackBar.open(res.message ?? 'Something went wrong, Please try after sometime', 'Close', {
                duration: 3000,
                panelClass: ['snack-error']
              });
            }
          },
          error: (error: HttpErrorResponse) => {
            this.isLoading = false;
            this.addOrEditClientCompanyForm.enable();
            if (navigator.onLine) {
              this._snackBar.open('Something went wrong, Please try after sometime', 'Close', {
                duration: 3000,
                panelClass: ['snack-error']
              });
            }
            else if (error.status == 401) {
              this._authenticationService.logout();
            }
            else {
              this._snackBar.open('Internet Connection Lost, Please check your connectivity', 'Close', {
                duration: 3000,
                panelClass: ['snack-error']
              });
            }
          }
        })
      }
      else {
        this._snackBar.open('Please enter client company', 'Close', {
          duration: 3000,
          panelClass: ['snack-error']
        });
        this.addOrEditClientCompanyForm.markAllAsTouched();
        return;
      }
    }
  }
}
