import { Component, OnInit, ViewChild } from '@angular/core';
import { Book } from '../../../interfaces/book';
import { BookService } from '../../../services/book.service';
import { Router } from '@angular/router';
import { ImageBookService } from '../../../services/image-book.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-list-content-book',
  templateUrl: './list-content-book.component.html',
  styleUrl: './list-content-book.component.css'
})
export class ListContentBookComponent implements OnInit {

  bookForm!: FormGroup;

  books: Book[] = [];
  bookSearch: string = '';
  totalBooks: number = 0;

  visible: boolean = false;
  
  imageBookId: string | null = null;
  
  selectedBook: Book | null = null;
  selectedFile: File | null = null;
  
  imageBook: any = [];
  
  @ViewChild('fileUploadRef') fileUpload: any;

  constructor(private router: Router,
    private bookService: BookService,
    private imageBookService: ImageBookService,
    private fb: FormBuilder,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.initForms();
    this.loadBooks();
  }

  loadBooks(): void {
    this.bookService.getBookList().subscribe(
      (data: Book[]) => {
        this.books = data;
        this.totalBooks = data.length;

        // carga la imagen de cada libro
        this.books.forEach(book => {
          if (book.img) {
            this.loadImageForBook(book)
          }
        });
      },
      error => console.error('Error loading books:', error)
    );
  }

  initForms(): void {
    this.bookForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      author: ['', [Validators.required, Validators.minLength(3)]],
      star: [0, [Validators.required, Validators.min(1), Validators.max(5)]]
    });
  }

  showDialog() {
    this.visible = true;
    this.selectedFile = null;
    this.imageBook = null;
  }

  createBook(): void {
    if (this.bookForm.invalid) return;

    this.uploadImage().subscribe({
      next: (image) => {
        const newBook: Book = {
          ...this.bookForm.value,
          img: image.id,
          contents: []
        };

        this.bookService.createBook(newBook).subscribe({
          next: (book) => {
            this.books.push(book);
            this.totalBooks = this.books.length;
            this.resetForm();
            this.visible = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Book created successfully',
            });
          },
          error: (error) => console.error('Error creating book:', error),
        });
      },
      error: (error) => console.error('Error uploading image:', error),
    });

  }

    uploadImage(): Observable<any> {
      if (!this.selectedFile) throw new Error('No file selected');
  
      const formData = new FormData();
      formData.append('image', this.selectedFile);
      return this.imageBookService.createImageBook(formData);
    }

  viewContentBook(id: String): void {
    console.log('view content book:');

    this.router.navigate(['manage/content-book/list', id]);
  }

  searchBookTitle(): void {
    if (this.bookSearch) {
      this.bookService.getBookByTitle(this.bookSearch).subscribe({
        next: (result) => {
          this.books = result;
          this.totalBooks = result.length
        },
        error: (error) => {
          console.log("Error", error)
        }
      })
    }
  }

  loadImageForBook(book: Book) {
    this.imageBookService.getByIdImageBook(book.img).subscribe({
      next: (imageData) => {
        book.img = imageData.routeFile;
      },
      error: (error) => {
        console.error(`Error loading image for book ${book.id}:`, error);
        book.img = 'assets/default-book.jpg'; // Imagen por defecto en caso de error
      }
    })
  }

  onFileSelected(event: any, fileUploadRef: any) {
    const file = event.files[0]; // Obtener el archivo seleccionado

    if (!file) return;

    this.selectedFile = file;
    this.imageBook = {
      routeFile: URL.createObjectURL(file), // Previsualización de imagen
      nameFile: file.name,
      size: file.size
    };

    // 🔄 Resetear el file input para permitir seleccionar el mismo archivo nuevamente
    setTimeout(() => fileUploadRef.clear(), 0);
  }

  onBasicUploadAuto() {

    console.log("onBasicUploadAuto")

    if (!this.selectedFile) {
      console.error("No hay archivo seleccionado");
      return;
    }

    const formData = new FormData();
    formData.append("image", this.selectedFile);

    this.imageBookService.createImageBook(formData).subscribe({
      next: (data) => {
        console.log("Register ImageBook", data);
        this.imageBook = data;
        this.imageBookId = data.id; // Guarda el ID de la imagen subida
      },
      error: (error) => {
        console.error("Error register ImageBook", error);
      }
    });
  }

  deleteImage() {
    this.selectedFile = null; 
    this.imageBook = null;
  }

  resetForm():void {
    this.bookForm.reset();
    this.selectedFile = null;
    this.imageBook = null;
    this.fileUpload.clear();
  }
}
