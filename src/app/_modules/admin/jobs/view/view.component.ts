import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import {
  JobsService,
  JobModel,
  JobModelServiceResponse
} from '../../../../../../dotnet/openapi';
import { AuthenticationService } from '../../../../_services/authentication.service';
import { CommonModule } from '@angular/common';
import { LoadingPageComponent } from '../../../shared/loading-page/loading-page.component';

@Component({
  selector: 'app-view',
  imports: [CommonModule, LoadingPageComponent, RouterModule],
  templateUrl: './view.component.html',
  styleUrl: './view.component.scss'
})
export class ViewComponent implements OnInit {
  isLoadingData = true;
  isError = false;
  errorData: any;
  jobId: string | null = null;
  job: JobModel | undefined;

  constructor(
    private _jobsService: JobsService,
    private _route: ActivatedRoute,
    private _authenticationService: AuthenticationService,
    private _cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.jobId = this._route.snapshot.queryParamMap.get('jobId');

    if (this.jobId) {
      this._jobsService.apiAdminJobsGetJobGet(this.jobId).subscribe({
        next: (res: JobModelServiceResponse) => {
          this.isLoadingData = false;
          if (res.statusCode === 200 && res.data) {
            this.job = res.data;
          } else {
            this.setGenericError();
          }

          this._cdr.detectChanges();
        },
        error: (error: HttpErrorResponse) => {
          this.isLoadingData = false;
          this.isError = true;

          if (!navigator.onLine) {
            this.errorData = {
              imgSrc: "../../../../../assets/images/icons/no-signal.png",
              errorTitleMessage: "Internet connection lost",
              errorSubTitleMessage: "Please check your internet connection!"
            };
          } else if (error.status === 401) {
            this._authenticationService.logout();
          } else {
            this.setGenericError();
          }
        }
      });
    } else {
      this.isLoadingData = false;
      this.setGenericError("Invalid Job ID provided.");
    }
  }

  private setGenericError(message: string = "Please try after sometime!") {
    this.isError = true;
    this.errorData = {
      imgSrc: "../../../../../assets/images/icons/error.png",
      errorTitleMessage: "Something went wrong",
      errorSubTitleMessage: message
    };
  }
}
