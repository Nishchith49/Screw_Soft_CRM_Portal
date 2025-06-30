import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';

@Component({
  selector: 'app-upload-cropped-image',
  imports: [CommonModule, ReactiveFormsModule, ImageCropperComponent],
  templateUrl: './upload-cropped-image.component.html',
  styleUrls: ['./upload-cropped-image.component.scss']
})
export class UploadCroppedImageComponent implements OnInit {
  imageChangedEvent: any = '';
  croppedImage: string | undefined;
  fileName: string | undefined;
  base64String: string | undefined;
  byteString: string | undefined;
  blobImg: Blob | undefined;
  fileParameterImg:
    | {
      data: Blob;
      fileName: string | undefined;
    }
    | undefined;

  aspectRatio: number = 1;

  ngOnInit(): void {
    // If you use router or dialog, pass the data from queryParams or input binding
    // this.aspectRatio = passedAspectRatioFromInput;
  }

  onSubmit(): void {
    if (this.croppedImage) {
      alert('Submit successful — now pass result via Output or DialogRef if needed');
      console.log({
        croppedImage: this.croppedImage,
        fileParameterImg: this.fileParameterImg,
        base64String: this.base64String,
        blobImg: this.blobImg
      });
    } else {
      alert('Please choose image file');
    }
  }

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
    this.fileName = event.target.files?.[0]?.name;
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64 ?? '';
    const arr = event.base64?.split(',');
    if (!arr || arr.length < 2) return;

    this.base64String = arr[1];
    this.byteString = arr[0].includes('base64') ? atob(arr[1]) : unescape(arr[1]);

    const mimeString = arr[0].split(':')[1].split(';')[0];
    const ia = new Uint8Array(this.byteString.length);
    for (let i = 0; i < this.byteString.length; i++) {
      ia[i] = this.byteString.charCodeAt(i);
    }

    this.blobImg = new Blob([ia], { type: mimeString });
    this.fileParameterImg = {
      data: this.blobImg,
      fileName: this.fileName
    };
  }
}
