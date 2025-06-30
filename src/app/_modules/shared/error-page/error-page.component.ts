import { Component, Input, OnInit } from '@angular/core';

export interface ErrorMessageModel {
  imgSrc: string;
  errorTitleMessage: string;
  errorSubTitleMessage: string;
}

@Component({
  selector: 'app-error-page',
  templateUrl: './error-page.component.html',
  styleUrls: ['./error-page.component.scss']
})
export class ErrorPageComponent implements OnInit {
  @Input() errorData?: ErrorMessageModel;
  isLoading: boolean = true;

  ngOnInit(): void {
    // Simulate slight delay or check if data is present
    setTimeout(() => {
      this.isLoading = !this.errorData;
    }, 100);
  }
}
