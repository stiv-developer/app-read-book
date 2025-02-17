import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.prod';
import { Book } from '../interfaces/book';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookService {

  constructor(private http:HttpClient) { }

  getBookContent(id: string){
    return this.http.get<Book>(`${environment.apiUrl}/api/book/${id}/content`);
  }

  getBookByTitle(title: string){
    return this.http.get<Book[]>(`${environment.apiUrl}/api/book/title/search?title=${encodeURIComponent(title)}`);
  }

  getBookList(){
    return this.http.get<Book[]>(`${environment.apiUrl}/api/book`);
  }

  createBook(newBook: any): Observable<any>{
    return this.http.post(`${environment.apiUrl}/api/book`, newBook);
  }

  updateBook(newBook: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/api/book/${newBook.id}`, newBook);
}

}
