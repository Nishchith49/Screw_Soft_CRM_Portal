import { Routes } from '@angular/router';
import { AdminComponent } from '../admin.component'; // Update with actual path

export const LayoutRoutes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard', 
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('../dashboard/dashboard.routes').then(m => m.dashboardRoutes),
      },
      {
        path: 'client-companies',
        loadChildren: () =>
          import('../client-companies/client-companies.routes').then(m => m.ClientCompaniesRoutes),
      },
      {
        path: 'jobs',
        loadChildren: () =>
          import('../jobs/jobs.routes').then(m => m.JobsRoutes)
      },
      {
        path: 'applicants',
        loadChildren: () =>
          import('../applicants/applicants.routes').then(m => m.ApplicantsRoutes)
      },
      {
        path: 'enquiries',
        loadChildren: () =>
          import('../enquiries/enquiries.routes').then(m => m.EnquiriesRoutes)
      },
       {
        path: 'courses',
        loadChildren: () =>
          import('../courses/courses.routes').then(m => m.CoursesRoutes)
      }
    ],
  },
];
