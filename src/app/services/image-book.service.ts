import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class ImageBookService {

  constructor(
    private http: HttpClient
  ) { }


  createImageBook(ImageBook: any): Observable<any>{
    return this.http.post(`${environment.apiUrl}/api/image-book`, ImageBook);
  }

  deleteImageBook(id: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/api/image-book/${id}`);
  }

  getByIdImageBook(id: string): Observable<any>{
    return this.http.get(`${environment.apiUrl}/api/image-book/${id}`);
  }

  getAllImageBooks(): Observable<any[]>{
    return this.http.get<[]>(`${environment.apiUrl}/api/image-book/`);
  }
}
