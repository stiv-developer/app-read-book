import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

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
}
