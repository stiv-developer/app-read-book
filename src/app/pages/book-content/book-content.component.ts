import { Component, OnInit, ElementRef, Renderer2 } from '@angular/core';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-book-content',
  templateUrl: './book-content.component.html',
  styleUrl: './book-content.component.css'
})
export class BookContentComponent implements OnInit {

  inputWord: string = '';
  translationText: string = 'Traducción no disponible';
  translation: { [key: string]: string } = {};

  constructor(private translationService: TranslationService) { }

  ngOnInit(): void {
    this.prepareText();

    // Cargar las traducciones al iniciar el componente
    this.translationService.getTranslations().subscribe(
      data => (this.translation = data),
      error => console.error('Error loading translations:', error)
    );

    // Cargar voces al inicializar el componente
    this.playVoice();

  }

  prepareText(): void {
    const container = document.getElementById('text-container');
    const tooltip = document.getElementById("tooltip");
    const translationSpan = document.getElementById("translated-word");
    const originalWord = document.getElementById("original-word");

    container?.querySelectorAll("p").forEach(paragraph => {
      const words = paragraph.textContent?.split(/\s+/) || []; // Devide las palabras
      paragraph.innerHTML = ''; // Limpiar el contenido original

      words.forEach((word, index) => {
        const cleanWord = word.replace(/[^\w\s]/g, "").toLowerCase(); // Limpia signos de puntuación
        const span = document.createElement("span");
        span.textContent = word;
        span.className = "word";

        span.addEventListener("click", (event) => {
          const rect = span.getBoundingClientRect();

          const translationText = this.translation[cleanWord] || "Traducción no disponible"; // Usar 'translation' aquí
          if (translationSpan) {
            translationSpan.textContent = translationText;
          }
          if (originalWord) {
            originalWord.textContent = cleanWord;
          }

          // Espacio disponible
          const spaceAbove = rect.top; // Espacio arriba del elemento
          const spaceBelow = window.innerHeight - rect.bottom; // Espacio debajo del elemento

          // Decide si posicionar arriba o abajo
          if (tooltip) {
            if (spaceBelow >= tooltip.offsetHeight + 10) {
              // Mostrar abajo si hay espacio suficiente
              tooltip.style.top = `${rect.bottom + window.scrollY + 10}px`;
            } else if (spaceAbove >= tooltip.offsetHeight + 10) {
              // Mostrar arriba si hay espacio suficiente
              tooltip.style.top = `${rect.top + window.scrollY - tooltip.offsetHeight - 10}px`;
            } else {
              // Por defecto, mostrar abajo si no cabe completamente arriba o abajo
              tooltip.style.top = `${rect.bottom + window.scrollY + 10}px`;
            }
          }

          // Ajuste horizontal
          if (tooltip) {
            tooltip.style.left = `${rect.left + window.scrollX}px`;
          }

          // Mostrar tooltip
          if (tooltip) {
            tooltip.style.display = "block";
          }

          event.stopPropagation(); // Evita que el clic se propague
        });
        paragraph.appendChild(span);

        // Agregar espacio entre palabras (excepto la última)
        if (index < words.length - 1) {
          paragraph.appendChild(document.createTextNode(" "));
        }
      });
    });

    // Evita que el tooltip se cierre al hacer clic sobre él
    tooltip?.addEventListener("click", (event) => {
      event.stopPropagation();
    });

    // Ocultar el tooltip si se hace clic fuera de una palabra
    document.addEventListener("click", (event) => {
      if (event.target && !(event.target as HTMLElement).classList.contains("word")) {
        if (tooltip) {
          tooltip.style.display = "none";
        }
      }
    });
  }

  // Método para leer la palabra en inglés

  private loadVoices()  {
    const voices = window.speechSynthesis.getVoices();

    return voices.find(voice => voice.lang.startsWith('en-'));
  }

  playVoice(): void {

    const audioIcon = document.querySelector('.bi-volume-up-fill');

    audioIcon!.addEventListener("click", () => {
      console.log("playVoice");

      const textToSpeak = document.getElementById('original-word')?.textContent;

      if (!textToSpeak) {
        console.warn('No hay texto para reproducir.');
        return;
      }

      const utterance = new SpeechSynthesisUtterance(textToSpeak);

      const englishVoice = this.loadVoices();

      if (englishVoice !== null) {
        utterance.voice = englishVoice!;
        utterance.lang = "en-US";
      } else {
        console.warn("No se encontró una voz en inglés. Usando la voz predeterminada.");
        utterance.lang = "en-US"; // Forzar el idioma
      }

      window.speechSynthesis.speak(utterance);
    });


  }


}
