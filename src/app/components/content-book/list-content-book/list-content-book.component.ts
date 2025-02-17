import { Component, OnInit } from '@angular/core';
import { Book } from '../../../interfaces/book';
import { BookService } from '../../../services/book.service';
import { Router } from '@angular/router';
import { ImageBookService } from '../../../services/image-book.service';

@Component({
  selector: 'app-list-content-book',
  templateUrl: './list-content-book.component.html',
  styleUrl: './list-content-book.component.css'
})
export class ListContentBookComponent implements OnInit {

  books: Book[] = [];
  bookSearch: string = '';
  visible: boolean = false;


  totalBooks: number = 0;

  title: string = '';
  author: string = '';
  star: number = 0;

  constructor(private router: Router,
    private bookService: BookService,
    private imageBookService: ImageBookService
    ) { }

  ngOnInit(): void {

    this.bookService.getBookList().subscribe(
      (data: Book[]) => {
        this.books = data;
        this.totalBooks = data.length;

        //carga la imagen de cada libro
        this.books.forEach(book => {
          if(book.img){
            this.loadImageForBook(book)
          }
        })
      },
      error => console.error('Error loading books:', error)
    );
  }

  showDialog() {
    console.log('show dialog');
    this.visible = true;
  }

  createBook(): void {
    const newBook = {
      title: this.title,
      author: this.author,
      star: this.star,
      img: 'https://via.placeholder.com/150',
      contents: []
    };

    this.sendFormData(newBook);
  }

  clearForm(): void {
    this.title = '';
    this.author = '';
    this.star = 0;
  }

  sendFormData(newBook: any) {
    this.bookService.createBook(newBook).subscribe({
      next: (data) => {
        console.log('data:', data);
        this.books.push(data);
        this.visible = false;
        this.totalBooks = this.books.length;
        this.clearForm();
      },
      error: (error) => {
        console.log('error:', error);
      }
    })
  };

  viewContentBook(id: String): void {
    console.log('view content book:');

    this.router.navigate(['manage/content-book/list', id]);
  }

  searchBookTitle(): void{
    if(this.bookSearch){
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

  loadImageForBook( book: Book){
    this.imageBookService.getByIdImageBook(book.img).subscribe({
      next: (imageData)=> {
        book.img = imageData.routeFile;
      },
      error: (error) => {
        console.error(`Error loading image for book ${book.id}:`, error);
        book.img = 'assets/default-book.jpg'; // Imagen por defecto en caso de error
      }
    })
  }
}
