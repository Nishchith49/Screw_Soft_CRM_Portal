import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthenticationService } from '../../../../_services/authentication.service';
import { WarningComponent } from '../../../shared/warning/warning.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Output() toggle = new EventEmitter<void>();
  @Output() miniModeActivate = new EventEmitter<void>();

  miniMode = false;
  showMenu = false;
  screenWidth = window.innerWidth;

  constructor(private authService: AuthenticationService, private el: ElementRef, private _dialog:MatDialog) {}

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenWidth = event.target.innerWidth;
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    if (this.showMenu && !this.el.nativeElement.contains(event.target)) {
      this.showMenu = false;
    }
  }

  handleSidebarToggle() {
    if (this.screenWidth < 960) {
      this.toggle.emit(); // Mobile
    } else {
      this.toggleMiniMode(); // Desktop
    }
  }

  toggleMiniMode() {
    this.miniMode = !this.miniMode;
    this.miniModeActivate.emit();
  }

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  logout() {
    const dialogRef = this._dialog.open(WarningComponent, {
      width: '400px',
      data: { title: "Confirm", content: 'Are you sure, Do you want to logout?' }
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res == true) {
        this.authService.logout();
      }
    });
  }
}
