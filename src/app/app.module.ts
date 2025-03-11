import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { MenuComponent } from './pages/menu/menu.component';
import { ListBookComponent } from './pages/list-book/list-book.component';
import { BookContentComponent } from './pages/book-content/book-content.component';
import { CommonModule } from '@angular/common';
// PRIME NG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ContentChapterComponent } from './components/content-chapter/content-chapter.component';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { BookComponent } from './components/book/book.component';
import { DialogModule } from 'primeng/dialog';
import { MenuManageComponent } from './pages/menu-manage/menu-manage.component';
import { ContentBookComponent } from './components/content-book/content-book.component';
import { ListContentBookComponent } from './components/content-book/list-content-book/list-content-book.component';
import { ListContentComponent } from './components/content-book/list-content/list-content.component';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { FileUploadModule } from 'primeng/fileupload';
import { MessageService } from 'primeng/api';
import { EditorModule } from 'primeng/editor';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';

// REACTIVE FORM
import { ReactiveFormsModule } from '@angular/forms';
import { TranslationComponent } from './pages/translation/translation.component';
@NgModule({
  declarations: [
    AppComponent,
    MenuComponent,
    ListBookComponent,
    BookContentComponent,
    ContentChapterComponent,
    BookComponent,
    MenuManageComponent,
    ContentBookComponent,
    ListContentBookComponent,
    ListContentComponent,
    TranslationComponent
  ],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    FormsModule,
    DialogModule,
    ReactiveFormsModule,
    InputTextareaModule,
    FileUploadModule,
    EditorModule,
    IconFieldModule,
    InputIconModule,
    TagModule
  ],
  providers: [MessageService],
  bootstrap: [AppComponent]
})
export class AppModule { }
