import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.prod';
import { ContentChapter } from '../interfaces/contentChapter';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContentChapterService {

  constructor(private http:HttpClient) { }

  getAllContentChapters(){
    return this.http.get<ContentChapter[]>(`${environment.apiUrl}/api/content-chapter/`);
  }

  getContentChapterById(id:string){
    return this.http.get<ContentChapter>(`${environment.apiUrl}/api/content-chapter/${id}`);
  }

  addContentChapter(contentChapter: any): Observable<any>{
    return this.http.post(`${environment.apiUrl}/api/content-chapter`, contentChapter);
  }

  updateContentChapter(contentChapter: any){
    return this.http.put(`${environment.apiUrl}/api/content-chapter/${contentChapter.id}`,contentChapter);
  }

  deleteContentChapter(id:string){
    return this.http.delete(`${environment.apiUrl}/api/content-chapter/${id}`);
  }
}
