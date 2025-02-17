import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.prod';
import { ContentBook } from '../interfaces/contentBook';

@Injectable({
  providedIn: 'root'
})
export class ContentBookService {

  constructor(private http: HttpClient) { }

  getContentBookById(id:string){
    return this.http.get<ContentBook>(`${environment.apiUrl}/api/content-book/${id}`);
  }

  createContentBook(contentBook: any): Observable<any>{
    return this.http.post(`${environment.apiUrl}/api/content-book`, contentBook)
  }

  updateContentBook(newContentBook: any): Observable<any>{
    return this.http.put(`${environment.apiUrl}/api/content-book/${newContentBook.id}`, newContentBook);
  }

  deleteContentBook(id:String){

  }
}
