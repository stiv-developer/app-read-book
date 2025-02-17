import { Component, OnInit } from '@angular/core';
import { ContentChapterService } from '../../services/content-chapter.service';
import { ContentChapter } from '../../interfaces/contentChapter';
import { ActivatedRoute } from '@angular/router';
import { ContentBook } from '../../interfaces/contentBook';
import { ContentBookService } from '../../services/content-book.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

interface Type {
  name: string;
  code: string;
}


@Component({
  selector: 'app-content-chapter',
  templateUrl: './content-chapter.component.html',
  styleUrl: './content-chapter.component.css'
})
export class ContentChapterComponent implements OnInit {

  contentChapterForm!: FormGroup;

  contentBook: ContentBook | null = null;

  contentChapter: ContentChapter[] = [];
  selectedContentBook: any = [];

  isUpdating: boolean = false;

  types:Type[] | undefined;


  constructor(private contentChapterService: ContentChapterService,
    private contentBookservice: ContentBookService,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.types = [
      {name: 'h1',code:'h1'},
      {name: 'h2',code:'h2'},
      {name: 'h3',code:'h3'},
      {name: 'h4',code:'h4'},
      {name: 'h5',code:'h5'},
      {name: 'p',code:'p'},
      {name: 'list',code:'list'},
      {name: 'image',code:'image'},
    ];

    //Form
    this.contentChapterForm = this.fb.group({
      type: ['', [Validators.required]],
      position: ['', [Validators.required, Validators.min(1), Validators.max(100)]],
      description: ['', [Validators.required, Validators.minLength(3)]]
    })

    // Obtener ID de la URL
    const bookId = this.route.snapshot.paramMap.get('id');
    if (bookId) {
      this.contentBookservice.getContentBookById(bookId).subscribe(
        (data: ContentBook) => {
          this.contentBook = data;
          this.contentBook.chapters.sort((a, b) => a.position - b.position);
        },
        error => console.error('Error loading books:', error)
      )
    } else {
      console.error("ID no encontrado")
    }

  }

  createContentChapter() {

    let contentBookId: string = this.route.snapshot.paramMap.get('id') ?? '';

    const selectedType = this.contentChapterForm.get('type')?.value?.code;

    if (this.contentChapterForm.invalid) {
      console.log("Form invalid!")
      return;
    }

    const newContentChapter = {
      type: selectedType,
      position: this.contentChapterForm.value.position,
      description: this.contentChapterForm.value.description,
      contentBookId: contentBookId
    }

    console.log(newContentChapter);

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
    this.isUpdating = true;
  }

  resetForm() {
    this.isUpdating = false;
  }

  updateContentChapter() {
    if (!this.selectedContentBook) return;

    this.contentChapterService.updateContentChapter(this.selectedContentBook).subscribe({
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
}
