import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { APIResponse, CourseModelServiceResponse, CreateCourseCommand, UpdateCourseCommand, CoursesService } from '../../../../../../dotnet/openapi';
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

  addOrEditCourseForm = new FormGroup({
    title: new FormControl('', Validators.required),
    description: new FormControl('', [Validators.required]),
    durationInWeeks: new FormControl(0, [Validators.required, Validators.min(0)]),
  });

  get f() {
    return this.addOrEditCourseForm
  }

  isLoading = false;
  courseId: string | null | undefined
  isLoadingData = false;
  isError = false;
  errorData: any;

  constructor(
    private _coursesService: CoursesService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _authenticationService: AuthenticationService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.editor = new Editor();

    this.courseId = this._route.snapshot.queryParamMap.get('courseId')
    if (this.courseId) {
      this.isLoadingData = true;
      this._coursesService.apiAdminCoursesGetCourseGet(this.courseId).subscribe({
        next: (res: CourseModelServiceResponse) => {
          this.isLoadingData = false;
          if (res.statusCode === 200 && res.data) {
            this.addOrEditCourseForm.patchValue(res.data);
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
    this.courseId = this._route.snapshot.queryParamMap.get('courseId')
    if (!this.courseId) {
      if (this.addOrEditCourseForm.valid) {
        const createCourseCommand: CreateCourseCommand = {
          title: this.f.get('title')?.value ?? '',
          description: this.f.get('description')?.value ?? '',
          durationInWeeks: Number(this.f.get('durationInWeeks')?.value) ?? 0,
        }
        this._coursesService.apiAdminCoursesAddCoursePost(createCourseCommand).subscribe({
          next: (res: APIResponse) => {
            this.isLoading = false;
            this.addOrEditCourseForm.enable();
            localStorage.removeItem('userData')
            if (res.statusCode === 200) {
              this._router.navigateByUrl('/admin/courses/list');
              this._snackBar.open(res.message ?? 'course created successfully', 'Close', {
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
            this.addOrEditCourseForm.enable();
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
        this._snackBar.open('Please enter course details', 'Close', {
          duration: 3000,
          panelClass: ['snack-error']
        });
        this.addOrEditCourseForm.markAllAsTouched();
        return;
      }
    }
    else {
      if (this.addOrEditCourseForm.valid) {
        const updateCourseCommand: UpdateCourseCommand = {
          title: this.f.get('title')?.value ?? '',
          description: this.f.get('description')?.value ?? '',
          durationInWeeks: Number(this.f.get('durationInWeeks')?.value) ?? 0,
          id: this.courseId ?? ''
        }
        this.isLoading = true;
        this.addOrEditCourseForm.disable();
        this._coursesService.apiAdminCoursesUpdateCoursePut(updateCourseCommand).subscribe({
          next: (res: APIResponse) => {
            this.isLoading = false;
            this.addOrEditCourseForm.enable();
            localStorage.removeItem('userData');
            if (res.statusCode === 200) {
              this._router.navigateByUrl('/admin/courses/list');
              this._snackBar.open(res.message ?? 'Course updated successfully', 'Close', {
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
            this.addOrEditCourseForm.enable();
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
        this._snackBar.open('Please enter course details', 'Close', {
          duration: 3000,
          panelClass: ['snack-error']
        });
        this.addOrEditCourseForm.markAllAsTouched();
        return;
      }
    }
  }
}

