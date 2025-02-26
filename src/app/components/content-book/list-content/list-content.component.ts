import { Component, OnInit } from '@angular/core';
import { Book } from '../../../interfaces/book';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { BookService } from '../../../services/book.service';
import { ContentBookService } from '../../../services/content-book.service';
import { ContentBook } from '../../../interfaces/contentBook';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-list-content',
  templateUrl: './list-content.component.html',
  styleUrl: './list-content.component.css'
})
export class ListContentComponent implements OnInit {

  book: Book | null = null;

  visible: boolean = false;
  visibleUpdate: boolean = false;

  contentBook: ContentBook[] = [];
  contentBookForm!: FormGroup;
  contentBookUpdateForm!: FormGroup;

  totalChapters?: number = 0;

  selectedContentBook: any = {};

  constructor(private router: Router,
    private bookService: BookService,
    private route: ActivatedRoute,
    private contentBookService: ContentBookService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.initForms();
    this.loadContentBooks();
  }

  loadContentBooks(): void {
    const bookId = this.route.snapshot.paramMap.get('id');
    if (bookId) {
      this.bookService.getBookContent(bookId).subscribe(
        (data: Book) => {
          this.book = data;
          this.book.contents.sort((a: any, b: any) => a.position - b.position);
          this.totalChapters = data.contents.length;
        },
        error => console.error('Error loading books:', error)
      )
    } else {
      console.error("ID no encontrado")
    }
  }

  initForms(): void {
    this.contentBookForm = this.fb.group({
      chapterName: ['', [Validators.required, Validators.minLength(3)]],
      position: ['', [Validators.required, Validators.min(1), Validators.max(100)]],
    });

    this.contentBookUpdateForm = this.fb.group({
      chapterName: ['', [Validators.required, Validators.minLength(3)]],
      position: ['', [Validators.required, Validators.min(1), Validators.max(100)]],
    })
  }

  showDialog() {
    this.visible = true;
  }

  showUpdateDialog(contentBook: ContentBook) {
    this.selectedContentBook = { ...contentBook };
    this.contentBookUpdateForm.patchValue({
      chapterName: contentBook.chapterName,
      position: contentBook.position
    })

    this.visibleUpdate = true;
  }

  navigateToContentChapter(id: string): void {
    this.router.navigate(['manage/content-book/content-chapter', id]);
  }

  createContentBook() {

    let bookId: string = this.route.snapshot.paramMap.get('id') ?? '';

    const newContentBook = {
      chapterName: this.contentBookForm.value.chapterName,
      position: this.contentBookForm.value.position,
      chapters: [],
      bookId: bookId
    }

    this.contentBookService.createContentBook(newContentBook).subscribe({
      next: (data) => {
        // 🔹 Si book y book.contents existen, agregamos el nuevo contenido
        if (this.book) {
          this.book = {
            ...this.book,
            contents: [...this.book.contents, data] // ✅ Agregar nuevo contenido y forzar actualización

          };
        }
        this.refresContentBooks();
        this.totalChapters = this.book?.contents.length;
        this.visible = false;
      },
      error: (err) => {
        console.error("Error al crear ContentBook:", err);
      }
    });
    // this.sendFormData(newContentBook);
  }

  updateContentBook() {

    if (this.contentBookUpdateForm.invalid || !this.selectedContentBook) return;

    const updateContentBook: ContentBook = {
      ...this.selectedContentBook,
      ...this.contentBookUpdateForm.value,
    }

    this.contentBookService.updateContentBook(updateContentBook).subscribe({
      next: () => {
        this.visibleUpdate = false;
        this.refresContentBooks();
      },
      error: (error) => {
        console.log("Error Update content book");
      }
    })
  }

  refresContentBooks() {
    const bookId = this.route.snapshot.paramMap.get('id');
    if (bookId) {
      this.bookService.getBookContent(bookId).subscribe(
        (data: Book) => {
          this.book = data;
          this.totalChapters = data.contents.length;
        },
        error => console.error('Error loading books:', error)
      )
    } else {
      console.error("ID no encontrado")
    }
  }

}
