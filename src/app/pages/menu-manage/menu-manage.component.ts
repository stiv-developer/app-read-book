import { Component, HostListener } from '@angular/core';

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

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event){
    const menu = document.querySelector('.menu-right');
    const burger = document.querySelector('.burger-menu');

    if( menu && !menu.contains(event.target as Node) && burger && !burger.contains(event.target as Node)){
      this.menuVisible = false;
    }
  }
}
