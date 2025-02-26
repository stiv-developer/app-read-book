import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment.prod';
import { Translation } from '../interfaces/translation';
@Injectable({
  providedIn: 'root'
})
export class TranslationService {

  private dataUrl = 'assets/data/data.json'; // Ruta al archivo JSON

  constructor(private http: HttpClient) {}

  // Método para obtener todas las traducciones
  getTranslations(): Observable<{ [key: string]: string }> {
    return this.http.get<any>(this.dataUrl).pipe(
      map(data => {
        // Convertir el array de palabras en un objeto clave-valor
        const translations: { [key: string]: string } = {};
        data.words.forEach((item: { word: string; word_translation: string }) => {
          translations[item.word] = item.word_translation;
        });
        return translations;
      })
    );
  }

  getAllTranslation(): Observable<any>{
    return this.http.get<any[]>(`${environment.apiUrl}/api/translation/`);
  }

  getTranslationById(id: string): Observable<Translation>{
    return this.http.get<Translation>(`${environment.apiUrl}/api/translation/${id}`);
  }

  getTranslationByWord(word: string): Observable<Translation>{
    return this.http.get<Translation>(`${environment.apiUrl}/api/translation/word/search?word=${word}`);
  }

  getTranslationAllByWord(word: string): Observable<Translation[]>{
    return this.http.get<Translation[]>(`${environment.apiUrl}/api/translation/words/search?word=${word}`);
  }

  createTranslation(newForm: any):Observable<any>{
    return this.http.post(`${environment.apiUrl}/api/translation`,newForm);
  }

  updateTranslation(updateForm: any): Observable<any>{
    return this.http.put(`${environment.apiUrl}/api/translation/${updateForm.id}`,updateForm);
  }

  deleteTranslation(id: string) {
    return this.http.delete(`${environment.apiUrl}/api/translation/${id}`).pipe(
      catchError( error => {
        console.error('Error fetching translations', error);
        return of([]) // Retorna un array vacio en caso de error
      })
    );
  }
}
