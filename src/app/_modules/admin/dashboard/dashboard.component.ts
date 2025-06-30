import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, linkedSignal, OnInit } from '@angular/core';
import {
  ApplicantModelListPagedResponse,
  ApplicantsService,
  ClientCompaniesService,
  ClientCompanyModelListPagedResponse,
  CourseModelListPagedResponse,
  CoursesService,
  EnquiriesService,
  JobModelListPagedResponse,
  JobsService
} from '../../../../../dotnet/openapi';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  dashboard: { name: string, count: number, icon: string, link: string }[] = [
    { name: 'client Companies', count: 0, icon: 'business', link: '/admin/client-companies' },
    { name: 'jobs', count: 0, icon: 'work_outline', link: '/admin/jobs' },
    { name: 'applicants', count: 0, icon: 'person_search', link: '/admin/applicants' },
    { name: 'courses', count: 0, icon: 'school', link: '/admin/courses' },
    { name: 'open enquiries', count: 0, icon: 'contact_support', link: '/admin/enquiries' }
  ];

  constructor(
    private _clientCompaniesService: ClientCompaniesService,
    private _jobsService: JobsService,
    private _applicantsService: ApplicantsService,
    private _coursesService: CoursesService,
    private _enquiriesService: EnquiriesService,
    private _cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this._clientCompaniesService.apiAdminClientCompaniesGetClientCompaniesPost({})
      .subscribe(res => {
        this.setDashboardCount('client Companies', res.totalRecords ?? 0);
        this._cdr.detectChanges();
      });

    this._jobsService.apiAdminJobsGetJobsPost({})
      .subscribe(res => {
        this.setDashboardCount('jobs', res.totalRecords ?? 0);
        this._cdr.detectChanges();
      });

    this._applicantsService.apiAdminApplicantsGetApplicantsPost({})
      .subscribe(res => {
        this.setDashboardCount('applicants', res.totalRecords ?? 0);
        this._cdr.detectChanges();
      });

    this._coursesService.apiAdminCoursesGetCoursesPost({})
      .subscribe(res => {
        this.setDashboardCount('courses', res.totalRecords ?? 0);
        this._cdr.detectChanges();
      });

    this._enquiriesService.apiAdminEnquiriesGetEnquiriesPost({})
      .subscribe(res => {
        const openEnquiries = res.data?.filter(e => e.isResolved) ?? []
        this.setDashboardCount('open enquiries', openEnquiries.length);
        this._cdr.detectChanges();
      });
  }

  private setDashboardCount(name: string, count: number): void {
    const item = this.dashboard.find(x => x.name === name);
    if (item) item.count = count;
  }
}
