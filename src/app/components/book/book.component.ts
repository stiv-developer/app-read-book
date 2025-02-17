import { Component, OnInit, ViewChild } from '@angular/core';
import { Book } from '../../interfaces/book';
import { BookService } from '../../services/book.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ImageBookService } from '../../services/image-book.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrl: './book.component.css'
})
export class BookComponent implements OnInit {

  bookForm!: FormGroup;
  updateForm!: FormGroup;

  books: Book[] = [];
  bookSearch: string = '';
  totalBooks: number = 0;

  visible: boolean = false;
  visibleUpdate: boolean = false;

  imageBookId: string | null = null;

  selectedBook: Book | null = null;
  selectedFile: File | null = null;
  imageBook: any = null;

  @ViewChild('fileUploadRef') fileUpload: any;


  constructor(private bookService: BookService,
    private fb: FormBuilder,
    private imageBookService: ImageBookService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {

    this.initForms();
    this.loadBooks();

  }

  initForms(): void {
    this.bookForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      author: ['', [Validators.required, Validators.minLength(3)]],
      star: [0, [Validators.required, Validators.min(1), Validators.max(5)]]
    });

    this.updateForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      author: ['', [Validators.required, Validators.minLength(3)]],
      star: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
    });
  }

  loadBooks(): void {
    this.bookService.getBookList().subscribe(
      (data) => {
        this.books = data;
        this.totalBooks = data.length;
      },
      error => console.error('Error loading books:', error)
    );
  }

  showDialog() {
    console.log('show dialog');
    this.visible = true;
    this.selectedFile = null;
    this.imageBook = null;
  }

  showUpdateDialog(book: Book): void {

    this.selectedBook = { ...book }; // Clona el libro seleccionado
    this.updateForm.patchValue({
      title: book.title,
      author: book.author,
      star: book.star,
    }); 
    // Actualiza los valores del formulario
    // console.log(book.img)
    // this.imageBook = book.img ? { routeFile: book.img } : null; 
    // console.log(this.imageBook)

    if (book.img) {
      console.log("Cargando imagen del libro:", book.img);
      this.loadImageBook(book.img); // Cargar datos completos de la imagen
    }
    
    this.visibleUpdate = true; // Muestra el diálogo
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

  uploadImage(): Observable<any> {
    if (!this.selectedFile) throw new Error('No file selected');

    const formData = new FormData();
    formData.append('image', this.selectedFile);
    return this.imageBookService.createImageBook(formData);
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

  updateBook(): void {

    if (this.updateForm.invalid || !this.selectedBook) return;

    const updatedBook: Book = {
      ...this.selectedBook,
      ...this.updateForm.value, // Usa los valores del formulario
    };

    if (this.selectedFile) {
      this.uploadImage().subscribe({
        next: (image) => {
          updatedBook.img = image.id; // Asigna la nueva imagen
          this.saveUpdatedBook(updatedBook); // Guarda el libro actualizado
        },
        error: (error) => console.error('Error uploading image:', error),
      });
    } else {
      this.saveUpdatedBook(updatedBook); // Guarda el libro sin cambiar la imagen
    }
  }

  getStarsArray(star: number): number[] {
    return Array(star).fill(0);
  }

  searchBookTitle(): void {
    if (this.bookSearch) {
      this.bookService.getBookByTitle(this.bookSearch).subscribe({
        next: (result) => {
          this.books = result;
          this.totalBooks = result.length;
        },
        error: (error) => {
          console.log("Error en searchBookTitle", error)
        }
      })
    }
  }

  saveUpdatedBook(book: Book): void {
    this.bookService.updateBook(book).subscribe({
      next: () => {
        this.loadBooks(); // Recarga la lista de libros
        this.visibleUpdate = false; // Cierra el diálogo
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Book updated successfully',
        });
      },
      error: (error) => console.error('Error updating book:', error),
    });
  }

  refreshBooks() {
    this.bookService.getBookList().subscribe({
      next: (books) => this.books = books,
      error: (error) => console.error("Error fetching books", error)
    });
  }

  onFileSelectedUpdate(event: any, fileUploadRef: any) {
    const file = event.files[0];
    if (!file) return;

    this.selectedFile = file;
    this.imageBook = {
      routeFile: URL.createObjectURL(file), // Previsualización de la imagen
      nameFile: file.name,
      size: file.size
    };

    // 🔄 Resetear el input para permitir seleccionar el mismo archivo otra vez
    setTimeout(() => fileUploadRef.clear(), 0);
  }

  deleteImage() {
    this.selectedFile = null; 
    this.imageBook = null;
  }

  loadImageBook(imageId: string) {
    this.imageBookService.getByIdImageBook(imageId).subscribe({
      next: (data) => {
        this.imageBook = data;
        console.log("Imagen cargada: ", this.imageBook)
      },
      error: (error) => {
        console.error("Error imagen", error);
      }
    })
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

  resetForm():void {
    this.bookForm.reset();
    this.selectedFile = null;
    // this.imageBookId = null;
    this.imageBook = null;
    // this.visible = false
    this.fileUpload.clear();
  }
}
