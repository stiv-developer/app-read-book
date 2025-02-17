import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContentChapterComponent } from './components/content-chapter/content-chapter.component';
import { BookComponent } from './components/book/book.component';
import { MenuComponent } from './pages/menu/menu.component';
import { MenuManageComponent } from './pages/menu-manage/menu-manage.component';
import { ContentBookComponent } from './components/content-book/content-book.component';
import { ListContentBookComponent } from './components/content-book/list-content-book/list-content-book.component';
import { ListContentComponent } from './components/content-book/list-content/list-content.component';
import { ListBookComponent } from './pages/list-book/list-book.component';
import { BookContentComponent } from './pages/book-content/book-content.component';

const routes: Routes = [
    {
      path: 'menu',
      component: MenuComponent,
      children: [
        {
          path: '',
          component: ListBookComponent
        },
        {
          path: 'content/:id',
          component: BookContentComponent
        }
      ]
    },
    {
      path: 'manage',
      component: MenuManageComponent,
      children: [
        {
          path: '',
          component: BookComponent
        },
        {
          path: 'book',
          component: BookComponent
        },
        {
          path: 'content-book',
          component: ContentBookComponent,
          children:[
            {
              path: '',
              component: ListContentBookComponent
            },
            {
              path: 'list/:id',
              component: ListContentComponent
            },
            {
              path: 'content-chapter/:id',
              component: ContentChapterComponent
            }
          ]
        }
      ]
    },
  // {
  //   path: '',
  //   component: ListBookComponent,
  // },
  // {
  //   path: 'content',
  //   component: BookContentComponent,
  // },
  // {
  //   path: 'book-management',
  //   component: BookComponent
  // },
  // { 
  //   path: 'content-chapter-management',
  //   component: ContentChapterComponent,
  //   children: [
  //     {
  //       path: '',
  //       component: ContentChapterListComponent
  //     },
  //     {
  //       path:'add',
  //       component: ContentChapterFormComponent
  //     },
  //     {
  //       path: 'edit/:id',
  //       component: ContentChapterFormComponent
  //     },
  //     {
  //       path: 'delete/:id',
  //       component: ContentChapterDetailComponent
  //     }
  //   ]
  // },
  {
    path: '**',
    redirectTo:'/menu',
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
