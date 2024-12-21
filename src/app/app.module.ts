import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MenuComponent } from './pages/menu/menu.component';
import { ListBookComponent } from './pages/list-book/list-book.component';
import { BookContentComponent } from './pages/book-content/book-content.component';

@NgModule({
  declarations: [
    AppComponent,
    MenuComponent,
    ListBookComponent,
    BookContentComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
