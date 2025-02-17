import { Component, OnInit } from '@angular/core';
import { BookService } from '../../services/book.service';
import { Book } from '../../interfaces/book';
import { ImageBookService } from '../../services/image-book.service';

@Component({
  selector: 'app-list-book',
  templateUrl: './list-book.component.html',
  styleUrl: './list-book.component.css'
})
export class ListBookComponent implements OnInit {

  books: Book[] = [];

  constructor(private bookService: BookService,
              private imageBookService: ImageBookService
  ) { }


  ngOnInit(): void {
    
    this.bookService.getBookList().subscribe(
       (data: Book[]) => {
        this.books = data;
        this.books.forEach( book =>{
          if(book.img){
            this.loadImageForBook(book);
          }
        })
      },
      error => console.error('Error loading books: ', error)
    );
  }

  loadImageForBook(book: Book){
    this.imageBookService.getByIdImageBook(book.img).subscribe({
      next: (imageData) =>{
        book.img = imageData.routeFile;
      },
      error: (error) => console.error("Error getting image book", error)
    })
  }

  getStarsArray(star: number): number[] {
    return Array(star).fill(0);
  }

}
