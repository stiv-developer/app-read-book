import { Component, OnInit, ViewChild } from '@angular/core';
import { Book } from '../../interfaces/book';
import { BookService } from '../../services/book.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ImageBookService } from '../../services/image-book.service';
import { Observable } from 'rxjs';
import { Category } from '../../interfaces/category';
import { CategoryService } from '../../services/category.service';
import { transition } from '@angular/animations';

interface Status {
  name: string;
  code: string;
}

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

  categories: Category[] = [];
  selectedCategory:  Category | undefined;
  states: Status[] = [];
  selectedStatus: Status | undefined;

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
    private messageService: MessageService,
    private categoryService: CategoryService
  ) { }

  ngOnInit(): void {

    this.states = [
      { name: 'completed',code:'01'},
      { name: 'process',code:'01'},
      { name: 'earring',code:'01'},
    ]

    this.initForms();
    this.loadBooks();
    this.loadCategories();

  }

  loadBooks(): void {
    this.bookService.getBookList().subscribe(
      (data) => {
        this.books = data;
        this.totalBooks = data.length;

        //Cargar la imagen de cada libro
        this.books.forEach(book => {
          if (book.img) {
            book.imageId = book.img;
            this.loadImageForBook(book)
          }
        });
      },
      error => console.error('Error loading books:', error)
    );
  }

  loadCategories(): void{
    this.categoryService.getAllCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: error => console.error('Error load categories',error)
    })
  }

  initForms(): void {
    this.bookForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      author: ['', [Validators.required, Validators.minLength(3)]],
      star: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      selectedCategory:[null, Validators.required]
    });

    this.updateForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      author: ['', [Validators.required, Validators.minLength(3)]],
      star: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      selectedCategory:[null, Validators.required],
      selectedStatus:[null, Validators.required]
    });
  }

  showDialog() {
    console.log('show dialog');
    this.visible = true;
    this.selectedFile = null;
    this.imageBook = null;
  }

  showUpdateDialog(book: Book): void {

    this.selectedBook = { ...book };

    // Buscar la categoría y el estado en las listas
    const selectedCategory = this.categories.find(category => category.id === book.category);
    const selectedStatus = this.states.find(state => state.name === book.status);

    this.updateForm.patchValue({
      title: book.title,
      author: book.author,
      star: book.star,
      selectedCategory:selectedCategory || null,
      selectedStatus: selectedStatus || null
    }); 
    // console.log()
    if (book.imageId) {
      this.loadImageBook(book.imageId); 
    }

    this.visibleUpdate = true; 
  }

  onFileSelected(event: any, fileUploadRef: any) {
    const file = event.files[0]; 

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

        const { selectedCategory, ...formValues } = this.bookForm.value;

        const newBook: Book = {
          // ...this.bookForm.value,
          ...formValues,
          img: image.id,
          category: selectedCategory?.id,
          status: "earring",
          contents: []
        };
        console.log(newBook)

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

    const { selectedCategory, selectedStatus, imageId, ...formValues } = this.updateForm.value;

    const updatedBook: Book = {
      ...this.selectedBook,
      ...formValues,
      category: selectedCategory?.id, // Solo el ID de la categoría
      status: selectedStatus?.name,   // Solo el nombre del estado
      img: this.selectedBook.imageId// Asignamos imageId a img
    };

    // delete (updatedBook as any).imageId;

    console.log("updatedBook: ",updatedBook);

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
    // console.log('loadImageBook')
    this.imageBookService.getByIdImageBook(imageId).subscribe({
      next: (data) => {
        this.imageBook = data;
        // console.log("Imagen cargada: ", this.imageBook)
      },
      error: (error) => {
        console.error("Error imagen", error);
      }
    })
  }

  loadImageForBook(book: Book) {
    if (!book.imageId) return;
    this.imageBookService.getByIdImageBook(book.imageId).subscribe({
      next: (imageData) => {
        book.img = imageData.routeFile;
      },
      error: (error) => {
        console.error(`Error loading image for book ${book.id}:`, error);
        book.img = 'assets/default-book.jpg'; // Imagen por defecto en caso de error
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

  resetForm(): void {
    this.bookForm.reset();
    this.selectedFile = null;
    this.imageBook = null;
    this.fileUpload.clear();
  }

  getSeverity(status: string): "success" | "secondary" | "info" | undefined {
    switch (status) {
      case 'completed':
        return 'success';
      case 'process':
        return 'secondary';
      default:
        return undefined; // Handles unexpected values
    }
  }
}
