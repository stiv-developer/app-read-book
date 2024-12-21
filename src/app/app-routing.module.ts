import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MenuComponent } from './pages/menu/menu.component';
import { ListBookComponent } from './pages/list-book/list-book.component';
import { BookContentComponent } from './pages/book-content/book-content.component';

const routes: Routes = [
  {
    path: '',
    component: ListBookComponent,
  },
  {
    path: 'content',
    component: BookContentComponent,
  },
  {
    path: '**',redirectTo:'/menu',
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
