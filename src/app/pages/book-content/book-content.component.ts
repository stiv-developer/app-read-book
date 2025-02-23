import { Component, OnInit, ElementRef, Renderer2, AfterViewInit, AfterViewChecked } from '@angular/core';
import { TranslationService } from '../../services/translation.service';
import { BookService } from '../../services/book.service';
import { Book } from '../../interfaces/book';
import { ActivatedRoute } from '@angular/router';
import { ImageBookService } from '../../services/image-book.service';

@Component({
  selector: 'app-book-content',
  templateUrl: './book-content.component.html',
  styleUrl: './book-content.component.css'
})
export class BookContentComponent implements OnInit, AfterViewChecked {

  book: Book | null = null;
  imageBook: any | null = null;

  inputWord: string = '';
  translationText: string = 'Traducción no disponible';
  translation: { [key: string]: string } = {};
  activeContentIndex: number = 0;
  contentPrepared: boolean = false;

  currentGroupIndex: number = 0;
  // groupIds: string[] = [
  //   'group-first',
  //   'group-second',
  //   'group-third',
  //   'group-fourth',
  //   'group-fifth',
  //   'group-sixth',
  //   'group-seventh'
  // ];
  groupIds: string[] = [
    'group-1',
    'group-2',
    'group-3',
    'group-4',
    'group-5',
    'group-6',
    'group-7'
  ];

  constructor(private translationService: TranslationService,
    private bookService: BookService,
    private imageBookService: ImageBookService,
    private route: ActivatedRoute
  ) { }


  ngOnInit(): void {

    let bookId: string = this.route.snapshot.paramMap.get('id') ?? '';

    // Obtener el contenido del libro
    this.bookService.getBookContent(bookId).subscribe(
      (data: Book) => {
        this.book = data;
        this.contentPrepared = false;
        this.getImageBook(data.img);
      },
      error => console.error('Error loading book content:', error)
    );

    // Cargar las traducciones al iniciar el componente
    this.translationService.getTranslations().subscribe(
      data => (this.translation = data),
      error => console.error('Error loading translations:', error)
    );



    // Cargar voces al inicializar el componente
    this.playVoice();
  }

  getImageBook(id:string) {
    this.imageBookService.getByIdImageBook(id).subscribe({
      next: (data) => {
        this.imageBook = data;
        console.log(this.imageBook)
      },
      error: error => console.log("Error get image book", error)
    });
  }

  ngAfterViewChecked(): void {
    // Preparar el texto después de que la vista se haya verificado
    if (this.book && !this.contentPrepared) {
      this.prepareText();
      this.contentPrepared = true; // Marcar que el contenido ya ha sido preparado
    }
  }

  prepareText(): void {
    const containers = document.querySelectorAll('.text-container');
    const tooltip = document.getElementById("tooltip");
    const translationSpan = document.getElementById("translated-word");
    const originalWord = document.getElementById("original-word");

    containers.forEach(containerElement => {
      containerElement.querySelectorAll('p').forEach(paragraph => {

        if (paragraph.querySelector('img')) {
          return; // Si hay una imagen, salir y no modificarlo
        }

        const words = paragraph.textContent?.split(/\s+/) || []; // Devide las palabras
        paragraph.innerHTML = ''; // Limpiar el contenido original
        words.forEach((word, index) => {
          const cleanWord = word.replace(/[^\w\s]/g, "").toLowerCase(); // Limpia signos de puntuación
          const span = document.createElement("span");
          span.textContent = word;
          span.className = "word";

          span.addEventListener("click", (event) => {
            const rect = span.getBoundingClientRect();
            const containerRect = containerElement.getBoundingClientRect();

            const translationText = this.translation[cleanWord] || "Traducción no disponible"; // Usar 'translation' aquí
            if (translationSpan) {
              translationSpan.textContent = translationText;
            }
            if (originalWord) {
              originalWord.textContent = cleanWord;
              console.log(originalWord.textContent)
            }

            if (tooltip) {
              tooltip.style.top = `${rect.bottom - containerRect.top + containerElement.scrollTop + 90}px`;
              tooltip.style.left = `${rect.left - containerRect.left + containerElement.scrollLeft}px`;
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


    });

  }

  // Método para leer la palabra en inglés

  private loadVoices() {
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

  toggleContent(event: Event, groupId: string): void {
    const target = event.target as HTMLElement;
    const allGroups = document.querySelectorAll('.content-group');
    const allItems = document.querySelectorAll('li');

    // Remover la clase 'active-content' de todos los elementos <li>
    allItems.forEach(item => item.classList.remove('active-content'));

    // Agregar la clase 'active-content' al elemento <li> clicado
    target.classList.add('active-content');

    // Ocultar todos los grupos
    allGroups.forEach(group => {
      (group as HTMLElement).style.display = 'none';
    });

    // Mostrar el grupo seleccionado
    const selectedGroup = document.getElementById(groupId);
    if (selectedGroup) {
      selectedGroup.style.display = 'block';
    }

    // Actualizar el índice del contenido activo
    if (selectedGroup) {
      this.activeContentIndex = Array.from(allGroups).indexOf(selectedGroup);
    }

    // this.prepareText();
  }

  showGroup(index: number): void {
    const allGroups = document.querySelectorAll('.content-group');
    const allItems = document.querySelectorAll('li');

    // Ocultar todos los grupos
    allGroups.forEach(group => {
      (group as HTMLElement).style.display = 'none';
    });

    // Remover la clase 'active-content' de todos los elementos <li>
    allItems.forEach(item => item.classList.remove('active-content'));

    // Mostrar el grupo seleccionado
    const selectedGroup = document.getElementById(this.groupIds[index]);
    if (selectedGroup) {
      selectedGroup.style.display = 'block';
    }

    // Agregar la clase 'active-content' al elemento <li> clicado
    const selectedItem = allItems[index];
    if (selectedItem) {
      selectedItem.classList.add('active-content');
    }
  }

  nextGroup(): void {
    if (this.currentGroupIndex < this.groupIds.length - 1) {
      this.currentGroupIndex++;
      this.showGroup(this.currentGroupIndex);
    }
  }

  previousGroup(): void {
    if (this.currentGroupIndex > 0) {
      this.currentGroupIndex--;
      this.showGroup(this.currentGroupIndex);
    }
  }


}
