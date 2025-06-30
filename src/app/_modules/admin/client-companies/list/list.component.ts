import { ChangeDetectorRef, Component, OnInit, ViewChild, viewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ClientCompanyModel, ClientCompaniesService, GetAllClientCompaniesQuery, ClientCompanyModelListPagedResponse } from '../../../../../../dotnet/openapi';
import { debounceTime } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthenticationService } from '../../../../_services/authentication.service';
import { LoadingPageComponent } from '../../../shared/loading-page/loading-page.component';
import { ErrorPageComponent } from '../../../shared/error-page/error-page.component';

@Component({
  selector: 'app-list.component',
  imports: [RouterModule, CommonModule, LoadingPageComponent, ReactiveFormsModule, ErrorPageComponent],
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
  });

  isLoading = false;
  isLoadingData = true;
  isError = false;
  errorData: any;
  totalRecords = 0;

  clientCompanies: ClientCompanyModel[] = [];

  constructor(
    private _clientCompaniesService: ClientCompaniesService,
    private _authService: AuthenticationService,
    private _router: Router,
    private _cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.getClientCompaniesData();

    this.paginatorForm.valueChanges.pipe(debounceTime(500)).subscribe(val => {
      this.isLoadingData = true;
      this.getClientCompaniesData()
    });
    this.filterForm.valueChanges.pipe(debounceTime(500)).subscribe(val => {
      this.isLoadingData = true;
      this.getClientCompaniesData();
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

  getClientCompaniesData(): void {
    const getAllClientCompaniesQuery: GetAllClientCompaniesQuery = {
      pageIndex: this.pageNumber,
      pageSize: this.pageSize,
      searchString: this.filterForm.value.searchString || "",
    };

    this.isError = false;
    this.errorData = null;
    this.isLoadingData = true;
    this._clientCompaniesService.apiAdminClientCompaniesGetClientCompaniesPost(getAllClientCompaniesQuery).subscribe({
      next: (res: ClientCompanyModelListPagedResponse) => {
        this.isLoadingData = false;

        if (res.statusCode === 200 && res.data) {
          this.clientCompanies = res.data;
          console.log('company', this.clientCompanies)
          this.totalRecords = res.totalRecords ?? 0;
          this._cdr.detectChanges();
        } else {
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
        this.clientCompanies = [];

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

  editClientCompanyDetails(clientCompanyId: any): void {
    this._router.navigate(['/admin/client-companies/edit'], {
      queryParams: { clientCompanyId }
    });
  }

  enableOrDisableClientCompany(company: ClientCompanyModel): void {
    this._clientCompaniesService.apiAdminClientCompaniesEnableOrDisableClientCompanyPut({
      id: company.id
    }).subscribe();
    this._cdr.detectChanges();
  }

  viewJobs(clientCompanyId: string): void {
    this._router.navigate(['/admin/jobs/list'], {
      queryParams: { clientCompanyId }
    });
  }
}
