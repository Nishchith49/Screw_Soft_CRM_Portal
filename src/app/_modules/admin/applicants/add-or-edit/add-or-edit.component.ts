import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApplicantModelServiceResponse, CreateApplicantCommand, UpdateApplicantCommand, ApplicantsService, APIResponse, DropDownModel, DropDownService, JobDropDownModel } from '../../../../../../dotnet/openapi';
import { AuthenticationService } from '../../../../_services/authentication.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-or-edit.component',
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './add-or-edit.component.html',
  styleUrl: './add-or-edit.component.scss'
})
export class AddOrEditComponent implements OnInit {
  addOrEditApplicantForm = new FormGroup({
    fullName: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]),
    resumeUrl: new FormControl('', Validators.required),
    skills: new FormControl('', Validators.required),
    experience: new FormControl(0, [Validators.required, Validators.min(0)]),
    jobId: new FormControl('', Validators.required)
  });

  jobs: JobDropDownModel[] = []

  get f() {
    return this.addOrEditApplicantForm
  }

  isLoading = false;
  applicantId: string | null | undefined
  isLoadingData = false;
  isError = false;
  errorData: any;

  constructor(
    private _applicantsService: ApplicantsService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _authenticationService: AuthenticationService,
    private _dropDownService: DropDownService,
    private _cdr: ChangeDetectorRef,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.isLoadingData = true
    this._dropDownService.apiDropDownGetJobDropDownGet().subscribe({
      next: (res: JobDropDownModel[]) => {
        this.isLoadingData = false
        this.jobs = res;
        this._cdr.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
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

    this.applicantId = this._route.snapshot.queryParamMap.get('applicantId')
    if (this.applicantId) {
      this.isLoadingData = true;
      this._applicantsService.apiAdminApplicantsGetApplicantGet(this.applicantId).subscribe({
        next: (res: ApplicantModelServiceResponse) => {
          this.isLoadingData = false;
          if (res.statusCode === 200 && res.data) {
            this.addOrEditApplicantForm.patchValue(res.data);
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
    if (!this.applicantId) {
      if (this.addOrEditApplicantForm.valid) {
        const createApplicantCommand: CreateApplicantCommand = {
          fullName: this.f.get('fullName')?.value ?? '',
          email: this.f.get('email')?.value ?? '',
          phone: this.f.get('phone')?.value ?? '',
          resumeUrl: this.f.get('resumeUrl')?.value ?? '',
          skills: this.f.get('skills')?.value ?? '',
          experience: this.f.get('experience')?.value ?? 0,
          jobId: this.f.get('jobId')?.value ?? ''
        }
        this.isLoading = true;
        this.addOrEditApplicantForm.disable()
        this._applicantsService.apiAdminApplicantsAddApplicantPost(createApplicantCommand).subscribe({
          next: (res: APIResponse) => {
            this.isLoading = false;
            this.addOrEditApplicantForm.enable();
            localStorage.removeItem('userData')
            if (res.statusCode === 200) {
              this._router.navigateByUrl('/admin/applicants/list');
              this._snackBar.open(res.message ?? 'Applicant created successfully', 'Close', {
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
            this.addOrEditApplicantForm.enable();
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
        this._snackBar.open('Please enter applicant details', 'Close', {
          duration: 3000,
          panelClass: ['snack-error']
        });
        this.addOrEditApplicantForm.markAllAsTouched();
        return;
      }
    }
    else {
      if (this.addOrEditApplicantForm.valid) {
        const updateApplicantCommand: UpdateApplicantCommand = {
          fullName: this.f.get('fullName')?.value ?? '',
          email: this.f.get('email')?.value ?? '',
          phone: this.f.get('phone')?.value ?? '',
          resumeUrl: this.f.get('resumeUrl')?.value ?? '',
          skills: this.f.get('skills')?.value ?? '',
          experience: this.f.get('experience')?.value ?? 0,
          jobId: this.f.get('jobId')?.value ?? '',
          id: this.applicantId ?? ''
        }
        this.isLoading = true;
        this.addOrEditApplicantForm.disable();
        this._applicantsService.apiAdminApplicantsUpdateApplicantPut(updateApplicantCommand).subscribe({
          next: (res: APIResponse) => {
            this.isLoading = false;
            this.addOrEditApplicantForm.enable();
            localStorage.removeItem('userData');
            if (res.statusCode === 200) {
              this._router.navigateByUrl('/admin/applicants/list');
              this._snackBar.open(res.message ?? 'Applicant updated successfully', 'Close', {
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
            this.addOrEditApplicantForm.enable();
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
        this._snackBar.open('Please enter applicant details', 'Close', {
          duration: 3000,
          panelClass: ['snack-error']
        });
        this.addOrEditApplicantForm.markAllAsTouched();
        return;
      }
    }
  }
}

