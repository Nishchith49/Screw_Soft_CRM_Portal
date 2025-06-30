import { Routes } from '@angular/router';
import { ErrorPageComponent } from './error-page/error-page.component';
import { LoadingPageComponent } from './loading-page/loading-page.component';
import { UploadCroppedImageComponent } from './upload-cropped-image/upload-cropped-image.component';
import { WarningComponent } from './warning/warning.component';

export const sharedRoutes: Routes = [
  { path: 'error', component: ErrorPageComponent },
  { path: 'loading', component: LoadingPageComponent },
  { path: 'upload-image', component: UploadCroppedImageComponent },
  { path: 'warning', component: WarningComponent }
];