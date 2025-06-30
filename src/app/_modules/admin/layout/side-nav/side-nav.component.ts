import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface MenuItem {
  icon?: string;
  title?: string;
  link?: string;
  items?: MenuItem[];
  isExpandable?: boolean;
  expanded?: boolean; // <-- NEW
}

@Component({
  selector: 'app-side-nav',
  imports: [CommonModule, RouterModule],
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss']
})
export class SideNavComponent {
  @Input() miniMode: boolean = false;
  @Output() SideNavClosed = new EventEmitter();

  innerWidth?: number;

  menuItems: MenuItem[] = [
    { icon: 'space_dashboard', title: 'Dashboard', link: '/admin/dashboard', isExpandable: false },
    { icon: 'business', title: 'Client Companies', link: '/admin/client-companies', isExpandable: false },
    { icon: 'work_outline', title: 'Jobs', link: '/admin/jobs', isExpandable: false },
    { icon: 'person_search', title: 'Applicants', link: '/admin/applicants', isExpandable: false },
    { icon: 'school', title: 'Courses', link: '/admin/courses', isExpandable: false },
    { icon: 'contact_support', title: 'Enquiries', link: '/admin/enquiries', isExpandable: false }
  ];

  toggleExpand(item: MenuItem): void {
    if (item.isExpandable) {
      item.expanded = !item.expanded;
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    this.innerWidth = window.innerWidth;
  }

  closeSideNav(): void {
    if (this.innerWidth && this.innerWidth < 992) {
      this.SideNavClosed.emit();
    }
  }
}
