import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { APIResponse, CreateJobCommand, JobModelServiceResponse, UpdateJobCommand, JobsService, DropDownModel, DropDownService } from '../../../../../../dotnet/openapi';
import { AuthenticationService } from '../../../../_services/authentication.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Editor, NgxEditorModule, Toolbar } from 'ngx-editor';

@Component({
  selector: 'app-add-or-edit.component',
  imports: [ReactiveFormsModule, CommonModule, RouterModule, NgxEditorModule],
  templateUrl: './add-or-edit.component.html',
  styleUrl: './add-or-edit.component.scss'
})
export class AddOrEditComponent implements OnInit {
  html = '';
  editor!: Editor;
  toolbar: Toolbar = [
    ['bold', 'italic', 'underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link', 'image'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
  ];

  addOrEditJobForm = new FormGroup({
    title: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
    location: new FormControl('', Validators.required),
    skillsRequired: new FormControl('', Validators.required),
    experienceRequired: new FormControl(0, [Validators.required, Validators.min(0)]),
    jobType: new FormControl('', Validators.required),
    salary: new FormControl(0, [Validators.required, Validators.min(0)]),
    expiryDate: new FormControl('', [
      Validators.required,
      control => {
        const inputDate = new Date(control.value);
        return inputDate >= new Date() ? null : { pastDate: true };
      }
    ]),
    clientCompanyId: new FormControl('', Validators.required)
  });
  clientCompanies: DropDownModel[] | null | undefined;

  get f() {
    return this.addOrEditJobForm
  }

  isLoading = false;
  jobId: string | null | undefined
  isLoadingData = false;
  isError = false;
  errorData: any;

  constructor(
    private _jobsService: JobsService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _authenticationService: AuthenticationService,
    private _snackBar: MatSnackBar,
    private _dropDownService: DropDownService,
    private _cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.isLoadingData = true
    this._dropDownService.apiDropDownGetClientCompanyDropdownGet().subscribe({
      next: (res: DropDownModel[]) => {
        this.isLoading = false;
        this.clientCompanies = res;
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

    this.editor = new Editor();

    this.jobId = this._route.snapshot.queryParamMap.get('jobId')
    if (this.jobId) {
      this.isLoadingData = true;
      this._jobsService.apiAdminJobsGetJobGet(this.jobId).subscribe({
        next: (res: JobModelServiceResponse) => {
          this.isLoadingData = false;
          if (res.statusCode === 200 && res.data) {
            const jobData = res.data;

            if (jobData.expiryDate) {
              const expiry = new Date(jobData.expiryDate);
              const formattedExpiryDate = expiry.toISOString().split('T')[0]; // yyyy-MM-dd
              jobData.expiryDate = formattedExpiryDate;
            }

            this.addOrEditJobForm.patchValue(jobData);
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

  ngOnDestroy() {
    this.editor.destroy();
  }

  onSubmit(): void {
    if (!this.jobId) {
      if (this.addOrEditJobForm.valid) {
        const createJobCommand: CreateJobCommand = {
          title: this.f.get('title')?.value ?? '',
          description: this.f.get('description')?.value ?? '',
          location: this.f.get('location')?.value ?? '',
          skillsRequired: this.f.get('skillsRequired')?.value ?? '',
          experienceRequired: this.f.get('experienceRequired')?.value ?? 0,
          jobType: this.f.get('jobType')?.value ?? '',
          salary: this.f.get('salary')?.value ?? 0,
          expiryDate: this.f.get('expiryDate')?.value ?? '',
          clientCompanyId: this.f.get('clientCompanyId')?.value ?? ''
        }
        this.isLoading = true;
        this.addOrEditJobForm.disable()
        this._jobsService.apiAdminJobsAddJobPost(createJobCommand).subscribe({
          next: (res: APIResponse) => {
            this.isLoading = false;
            this.addOrEditJobForm.enable();
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
            this.addOrEditJobForm.enable();
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
        this._snackBar.open('Please enter job details', 'Close', {
          duration: 3000,
          panelClass: ['snack-error']
        });
        this.addOrEditJobForm.markAllAsTouched();
        return;
      }
    }
    else {
      if (this.addOrEditJobForm.valid) {
        const updateJobCommand: UpdateJobCommand = {
          title: this.f.get('title')?.value ?? '',
          description: this.f.get('description')?.value ?? '',
          location: this.f.get('location')?.value ?? '',
          skillsRequired: this.f.get('skillsRequired')?.value ?? '',
          experienceRequired: this.f.get('experienceRequired')?.value ?? 0,
          jobType: this.f.get('jobType')?.value ?? '',
          salary: this.f.get('salary')?.value ?? 0,
          expiryDate: this.f.get('expiryDate')?.value ?? '',
          clientCompanyId: this.f.get('clientCompanyId')?.value ?? '',
          id: this.jobId ?? ''
        }
        this.isLoading = true;
        this.addOrEditJobForm.disable();
        this._jobsService.apiAdminJobsUpdateJobPut(updateJobCommand).subscribe({
          next: (res: APIResponse) => {
            this.isLoading = false;
            this.addOrEditJobForm.enable();
            localStorage.removeItem('userData');
            if (res.statusCode === 200) {
              this._router.navigateByUrl('/admin/jobs/list');
              this._snackBar.open(res.message ?? 'Job updated successfully', 'Close', {
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
            this.addOrEditJobForm.enable();
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
        this._snackBar.open('Please enter job details', 'Close', {
          duration: 3000,
          panelClass: ['snack-error']
        });
        this.addOrEditJobForm.markAllAsTouched();
        return;
      }
    }
  }
}

