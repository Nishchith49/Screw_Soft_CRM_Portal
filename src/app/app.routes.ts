import { Routes } from '@angular/router';
import { SignInComponent } from './_modules/accounts/sign-in/sign-in.component';
import { ErrorPageComponent } from './_modules/shared/error-page/error-page.component';
import { LoadingPageComponent } from './_modules/shared/loading-page/loading-page.component';
import { UploadCroppedImageComponent } from './_modules/shared/upload-cropped-image/upload-cropped-image.component';
import { WarningComponent } from './_modules/shared/warning/warning.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'sign-in',
        pathMatch: 'full'
    },
    {
        path: 'sign-in',
        component: SignInComponent
    },
    {
        path: 'admin',
        loadChildren: () =>
            import('./_modules/admin/admin.routes').then(m => m.AdminRoutes)
    },
    {
        path: 'error',
        component: ErrorPageComponent
    },
    {
        path: 'loading',
        component: LoadingPageComponent
    },
    {
        path: 'upload-image',
        component: UploadCroppedImageComponent
    },
    {
        path: 'warning',
        component: WarningComponent
    },
    {
        path: '**',
        redirectTo: 'sign-in'
    }
];
