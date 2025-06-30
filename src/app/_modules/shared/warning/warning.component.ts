import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-warning',
  imports: [CommonModule],
  templateUrl: './warning.component.html',
  styleUrls: ['./warning.component.scss']
})
export class WarningComponent {
  title: string;
  content: string;

  constructor(
    private dialogRef: MatDialogRef<boolean>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string, content: string }
  ) {
    this.title = data.title;
    this.content = data.content;
  }

  close(confirm: boolean): void {
    this.dialogRef.close(confirm);
  }
}
