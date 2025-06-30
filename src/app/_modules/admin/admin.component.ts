import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { BreakpointObserver, Breakpoints, LayoutModule } from '@angular/cdk/layout';
import { map, shareReplay } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { HeaderComponent } from './layout/header/header.component';
import { SideNavComponent } from './layout/side-nav/side-nav.component';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, RouterOutlet, LayoutModule, HeaderComponent, SideNavComponent],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  miniMode = false;
  showMobileSidebar = false;
  isHandset$!: Observable<boolean>;

  constructor(private breakpointObserver: BreakpointObserver) {}

  ngOnInit(): void {
    this.isHandset$ = this.breakpointObserver
      .observe([Breakpoints.Handset, Breakpoints.Small])
      .pipe(
        map(result => result.matches),
        shareReplay()
      );
  }

  toggleSidebar(): void {
    this.showMobileSidebar = !this.showMobileSidebar;
  }

  toggleMiniMode(): void {
    this.miniMode = !this.miniMode;
  }
}
