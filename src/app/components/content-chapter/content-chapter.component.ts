import { Component, OnInit } from '@angular/core';
import { ContentChapterService } from '../../services/content-chapter.service';
import { ContentChapter } from '../../interfaces/contentChapter';
import { ActivatedRoute } from '@angular/router';
import { ContentBook } from '../../interfaces/contentBook';
import { ContentBookService } from '../../services/content-book.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ImageBookService } from '../../services/image-book.service';
import { environment } from '../../../environments/environment.prod';
import { Book } from '../../interfaces/book';
import { BookService } from '../../services/book.service';
@Component({
  selector: 'app-content-chapter',
  templateUrl: './content-chapter.component.html',
  styleUrl: './content-chapter.component.css'
})
export class ContentChapterComponent implements OnInit {

  book: Book | null = null;

  contentChapterForm!: FormGroup;
  contentChapterUpdateForm!: FormGroup;

  contentBook: ContentBook | null = null;

  contentChapter: ContentChapter[] = [];
  selectedContentBook: any = [];

  isUpdating: boolean = false;

  editorInstance: any; // Guardamos la instancia del editor


  constructor(
    private bookService: BookService,
    private contentChapterService: ContentChapterService,
    private contentBookservice: ContentBookService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private imageBookService: ImageBookService
  ) { }

  ngOnInit(): void {
    this.initForms();
    this.loadContentBook();
  }

  initForms(): void {
    this.contentChapterForm = this.fb.group({
      position: ['', [Validators.required, Validators.min(1), Validators.max(100)]],
      description: ['', [Validators.required, Validators.minLength(3)]]
    });

    this.contentChapterUpdateForm = this.fb.group({
      position: ['', [Validators.required, Validators.min(1), Validators.max(100)]],
      description: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  loadContentBook(): void {
    const bookId = this.route.snapshot.paramMap.get('id');
    if (bookId) {
      this.contentBookservice.getContentBookById(bookId).subscribe(
        (data: ContentBook) => {
          this.contentBook = data;
          this.contentBook.chapters.forEach(chapter => {
            if (chapter.description) {
              chapter.description = chapter.description.replace(/&nbsp;/g, ' ');
            }
          });
          this.contentBook.chapters.sort((a, b) => a.position - b.position);
        },
        error => console.error('Error loading books:', error)
      )
    } else {
      console.error("ID no encontrado")
    }
  }

  async createContentChapter() {

    if (this.contentChapterForm.invalid) {
      console.log("Form invalid!")
      return;
    }

    let contentBookId: string = this.route.snapshot.paramMap.get('id') ?? '';

    const cleanedDescription = await this.cleanBase64Images(this.contentChapterForm.value.description);

    const newContentChapter = {
      position: this.contentChapterForm.value.position,
      description: cleanedDescription,
      contentBookId: contentBookId
    }

    console.log("Contenido a guardar: ", newContentChapter);

    this.sendFormData(newContentChapter);
  }

  sendFormData(newContentChapter: any) {
    this.contentChapterService.addContentChapter(newContentChapter).subscribe({
      next: (data) => {

        if (this.contentBook) {
          this.contentBook = {
            ...this.contentBook,
            chapters: [...this.contentBook.chapters, data] // ✅ Agregar nuevo contenido y forzar actualización
          };
        }

      },
      error: (err) => {
        console.error("Error al crear ContentChapter:", err);
      }
    })

  }

  changeForm(content: any) {
    this.selectedContentBook = { ...content };
    this.contentChapterUpdateForm.patchValue(content);
    console.log(this.contentChapterUpdateForm.value)
    this.isUpdating = true;
  }

  resetForm() {
    this.isUpdating = false;
  }

  async updateContentChapter() {
    if (!this.selectedContentBook || !this.contentChapterUpdateForm) return;

    // Limpiar las imágenes de la descripción
  const cleanedDescription = await this.cleanBase64Images(this.contentChapterUpdateForm.value.description);

    const updatedContentChapter = {
      ...this.selectedContentBook,
      ...this.contentChapterUpdateForm.value,
      description: cleanedDescription
    }

    console.log("Contenido a actualizar: ", updatedContentChapter);

    this.contentChapterService.updateContentChapter(updatedContentChapter).subscribe({
      next: () => {
        this.refresContentChapters();
        this.resetForm();
      },
      error: (error) => {
        console.error("Error update", error)
      }
    })
  }

  refresContentChapters() {
    const bookId = this.route.snapshot.paramMap.get('id');
    if (bookId) {
      this.contentBookservice.getContentBookById(bookId).subscribe(
        (data: ContentBook) => {
          this.contentBook = data;
        },
        error => console.error('Error loading books:', error)
      )
    } else {
      console.error("ID no encontrado")
    }
  }

  deleteContentChapter(id: string) {
    // console.log("id: ", id)
    this.contentChapterService.deleteContentChapter(id).subscribe({
      next: () => {
        console.log("Eliminado id: ", id)
        this.refresContentChapters();
        this.resetForm();
      },
      error: (error) => {
        console.error("Error delete", error)
      }
    })
  }

  onImageUpload(event: any) {
    const file = event.files[0];
    console.log("Subiendo imagen...", event.files[0]);
    const formData = new FormData();
    formData.append('image', file);

    this.imageBookService.createImageBook(formData).subscribe(
      (response) => {
        // Asegúrate de que `response.routeFile` sea la ruta correcta
        const imageUrl = `${environment.apiUrl}/uploads/${response.routeFile}`;

        console.log("url:", imageUrl)

        // Verifica si `event.editor` está disponible
        if (event.editor) {
          const range = event.editor.getSelection();
          event.editor.insertEmbed(range.index, 'image', imageUrl);
        } else {
          console.error('Editor no disponible');
        }
      },
      (error) => {
        console.error('Error al subir la imagen', error);
        // Puedes mostrar un mensaje de error al usuario aquí
      }
    );
  }

  onEditorCreated(editor: any) {
    this.editorInstance = editor;
    this.configureImageUpload(editor);
  }

  configureImageUpload(editor: any) {
    editor.getModule('toolbar').addHandler('image', () => {
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', 'image/*');
      input.click();

      input.onchange = async () => {
        const file = input.files?.[0];
        if (file) {
          const url = await this.uploadImage(file); // Subir imagen y obtener URL
          const range = editor.getSelection();
          editor.insertEmbed(range.index, 'image', url);
        }
      };
    });
  }

  /** Sube la imagen al backend y obtiene la URL */
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await this.imageBookService.createImageBook(formData).toPromise();
      return `${environment.apiUrl}/uploads/${response.routeFile}`;
    } catch (error) {
      console.error('Error al subir imagen', error);
      return '';
    }
  }

  async cleanBase64Images(htmlContent: string): Promise<string> {
    if (!htmlContent) return "";

    const doc = new DOMParser().parseFromString(htmlContent, "text/html");
    const imgElements = Array.from(doc.querySelectorAll("img")); // ✅ Convertir a array

    for (const img of imgElements) {
      if (img.src.startsWith("data:image")) {
        try {
          const url = await this.uploadImageFromBase64(img.src);
          img.src = url; // 🔹 Reemplaza la imagen en base64 con la URL del servidor
        } catch (error) {
          console.error("Error al subir imagen:", error);
        }
      }
    }

    return doc.body.innerHTML.trim() || "<p></p>"; // ✅ Retorna el HTML modificado
  }


  async uploadImageFromBase64(base64: string): Promise<string> {
    const formData = new FormData();
    formData.append("image", this.base64ToBlob(base64)); // Convierte Base64 a Blob

    try {
      const response = await this.imageBookService.createImageBook(formData).toPromise();

      // Verificar si la respuesta ya tiene la URL completa
      const imageUrl = response.routeFile.startsWith("http")
        ? response.routeFile // Si ya es una URL, úsala directamente
        : `${environment.apiUrl}/uploads/${response.routeFile}`;

      return imageUrl;
    } catch (error) {
      console.error("Error al subir imagen:", error);
      return "";
    }
  }

  base64ToBlob(base64: string): Blob {
    const byteString = atob(base64.split(",")[1]);
    const mimeType = base64.match(/data:(.*?);base64/)?.[1] || "image/png";
    const arrayBuffer = new Uint8Array(byteString.length);

    for (let i = 0; i < byteString.length; i++) {
      arrayBuffer[i] = byteString.charCodeAt(i);
    }

    return new Blob([arrayBuffer], { type: mimeType });
  }

  private descriptionUpdateTimeout: any;

  updateDescription(event: any) {
    const newValue = event.htmlValue;
    const currentValue = this.contentChapterForm.get('description')?.value;

    // Evita reasignaciones innecesarias
    if (newValue === currentValue) {
      return;
    }

    // Retrasa la actualización para evitar múltiples renders seguidos
    clearTimeout(this.descriptionUpdateTimeout);
    this.descriptionUpdateTimeout = setTimeout(() => {
      this.contentChapterForm.patchValue({ description: newValue }, { emitEvent: false });
    }, 100000); // Ajusta el tiempo según sea necesario

    // console.log("Valor del editor:", newValue);
    // console.log("Valor del editor:", event.htmlValue);
    // this.contentChapterForm.patchValue({ description: event.htmlValue }, { emitEvent: false });
    // console.log("Descripción actualizada:", event.htmlValue);
  }
}
