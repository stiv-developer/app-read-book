import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Category } from '../interfaces/category';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(
    private http: HttpClient
  ) { }

  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${environment.apiUrl}/api/category`);
  }

  getCategoryById(id:string): Observable<Category>{
    return this.http.get<Category>(`${environment.apiUrl}/api/category/${id}`);
  }

  createCategory(form: any): Observable<any>{
    return this.http.post(`${environment.apiUrl}/api/category`, form);
  }

  updateCategory(updateForm: any): Observable<any>{
    return this.http.put(`${environment.apiUrl}/api/category/${updateForm.id}`,updateForm)
  }

  // deleteCategory(id: string): Observable<any>{
  //   return this.http.delete
  // }
}
