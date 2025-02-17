import { Component } from '@angular/core';

@Component({
  selector: 'app-menu-manage',
  templateUrl: './menu-manage.component.html',
  styleUrl: './menu-manage.component.css'
})
export class MenuManageComponent {
  menuVisible: boolean = false;

  toggleMenu(): void {
    this.menuVisible = !this.menuVisible;
  }
}
