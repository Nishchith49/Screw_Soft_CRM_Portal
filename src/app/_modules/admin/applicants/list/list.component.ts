import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApplicantModel, ApplicantModelListPagedResponse, GetAllApplicantsQuery, ApplicantsService, DropDownModel, JobDropDownModel, DropDownService, UpdateApplicantStatusCommand, APIResponse } from '../../../../../../dotnet/openapi';
import { debounceTime } from 'rxjs';
import { AuthenticationService } from '../../../../_services/authentication.service';
import { LoadingPageComponent } from '../../../shared/loading-page/loading-page.component';
import { ErrorPageComponent } from '../../../shared/error-page/error-page.component';

@Component({
  selector: 'app-list.component',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingPageComponent, ReactiveFormsModule, ErrorPageComponent],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit {
  paginatorForm = new FormGroup({
    pageNumber: new FormControl(0),
    pageSize: new FormControl(10)
  });

  filterForm = new FormGroup({
    searchString: new FormControl(null),
    clientCompanyId: new FormControl(null),
    jobId: new FormControl(null)
  });

  applicantStatusList = [
    { id: 1, name: 'Applied' },
    { id: 2, name: 'Shortlisted' },
    { id: 3, name: 'Rejected' },
    { id: 4, name: 'Hired' }
  ];

  isLoading = false;
  isLoadingData = true;
  isError = false;
  errorData: any;
  totalRecords = 0;

  applicants: ApplicantModel[] = [];
  clientCompanyDropDown: DropDownModel[] = [];
  jobDropDown: JobDropDownModel[] = [];

  constructor(
    private _applicantsService: ApplicantsService,
    private _authService: AuthenticationService,
    private _dropDownService: DropDownService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this._route.queryParams.subscribe(params => {
      const jobIdFromParam = params['jobId'];
      if (jobIdFromParam) {
        this.filterForm.patchValue({
          jobId: jobIdFromParam
        });
      }

      this.getApplicantsData();
    });

    // this.getApplicantsData();
    this.getClientCompanyDropDown();
    this.getJobDropDown();
    this.paginatorForm.valueChanges.pipe(debounceTime(500)).subscribe(val => {
      this.isLoadingData = true;
      this.getApplicantsData();
    });
    this.filterForm.valueChanges.pipe(debounceTime(500)).subscribe(val => {
      this.isLoadingData = true;
      this.getApplicantsData();
    });
  }

  getClientCompanyDropDown() {
    this._dropDownService.apiDropDownGetClientCompanyDropdownGet().subscribe({
      next: (res: DropDownModel[]) => {
        this.clientCompanyDropDown = res;
        this._cdr.detectChanges();
      }
    });
  }

  getJobDropDown() {
    this._dropDownService.apiDropDownGetJobDropDownGet().subscribe({
      next: (res: JobDropDownModel[]) => {
        this.jobDropDown = res;
        this._cdr.detectChanges();
      }
    });
  }


  get pageNumber(): number {
    return this.paginatorForm.get('pageNumber')?.value ?? 0;
  }

  get pageSize(): number {
    return this.paginatorForm.get('pageSize')?.value ?? 10;
  }

  get totalPages(): number {
    return Math.ceil(this.totalRecords / this.pageSize);
  }

  getEndItemIndex(): number {
    const end = (this.pageNumber + 1) * this.pageSize;
    return end > this.totalRecords ? this.totalRecords : end;
  }

  goToFirstPage(): void {
    this.paginatorForm.patchValue({ pageNumber: 0 });
  }

  goToPreviousPage(): void {
    if (this.pageNumber > 0) {
      this.paginatorForm.patchValue({ pageNumber: this.pageNumber - 1 });
    }
  }

  goToNextPage(): void {
    if (this.pageNumber + 1 < this.totalPages) {
      this.paginatorForm.patchValue({ pageNumber: this.pageNumber + 1 });
    }
  }

  goToLastPage(): void {
    this.paginatorForm.patchValue({ pageNumber: this.totalPages - 1 });
  }

  onPageSizeChange(event: any): void {
    const newSize = parseInt(event.target.value, 10);
    this.paginatorForm.patchValue({ pageSize: newSize, pageNumber: 0 });
  }

  getApplicantsData(): void {
    const getAllApplicantsQuery: GetAllApplicantsQuery = {
      pageIndex: this.pageNumber,
      pageSize: this.pageSize,
      searchString: this.filterForm.value.searchString || "",
      clientCompanyId: this.filterForm.value.clientCompanyId || null,
      jobId: this.filterForm.value.jobId || null,
    };

    this.isError = false;
    this.errorData = null;
    this.isLoadingData = true;
    this._applicantsService.apiAdminApplicantsGetApplicantsPost(getAllApplicantsQuery).subscribe({
      next: (res: ApplicantModelListPagedResponse) => {
        this.isLoadingData = false;
        if (res.statusCode === 200 && res.data) {
          this.applicants = res.data;
          this.totalRecords = res.totalRecords ?? 0;
          this._cdr.detectChanges();
        } else {
          this.isError = true;
          this.isError = true;
          this.errorData = {
            imgSrc: 'empty-box.png',
            errorTitleMessage: 'No Data available',
            errorSubTitleMessage: 'Please try to add Applicants!'
          };
        }

        this._cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.isLoadingData = false;
        this.applicants = [];

        if (!navigator.onLine) {
          this.errorData = {
            imgSrc: 'no-signal.png',
            errorTitleMessage: 'Internet connection lost',
            errorSubTitleMessage: 'Please check your connection.'
          };
        } else if (err.status === 401) {
          this._authService.logout();
        } else {
          this.setGenericError();
        }

        this.isError = true;
        this._cdr.detectChanges();
      }
    });
  }

  setGenericError(): void {
    this.errorData = {
      imgSrc: 'error.png',
      errorTitleMessage: 'Something went wrong',
      errorSubTitleMessage: 'Please try again later'
    };
  }

  resetToSearch(): void {
    this.filterForm.controls.searchString.reset();
  }

  updateApplicantStatus(applicantId: string, status: number): void {
    const updateApplicantStatusCommand: UpdateApplicantStatusCommand = {
      id: applicantId,
      status: status
    };
    this.isLoadingData = true;
    this._applicantsService.apiAdminApplicantsUpdateApplicantStatusPut(updateApplicantStatusCommand).subscribe({
      next: (res: APIResponse) => {
        this.isLoadingData = false;
        if (res.statusCode === 200) {
          this.getApplicantsData();
        } else {
          this.setGenericError();
        }

        this._cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.isLoadingData = false;
        this.applicants = [];

        if (!navigator.onLine) {
          this.errorData = {
            imgSrc: 'no-signal.png',
            errorTitleMessage: 'Internet connection lost',
            errorSubTitleMessage: 'Please check your connection.'
          };
        } else if (err.status === 401) {
          this._authService.logout();
        } else {
          this.setGenericError();
        }

        this.isError = true;
        this._cdr.detectChanges();
      }
    });
  }

  editApplicantDetails(applicantId: any): void {
    this._router.navigate(['/admin/applicants/edit'], {
      queryParams: { applicantId }
    });
  }
}
