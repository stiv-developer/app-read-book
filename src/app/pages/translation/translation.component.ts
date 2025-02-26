import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TranslationService } from '../../services/translation.service';
import { Translation } from '../../interfaces/translation';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface Language {
  name: string,
  code: string
}

@Component({
  selector: 'app-translation',
  templateUrl: './translation.component.html',
  styleUrl: './translation.component.css'
})
export class TranslationComponent implements OnInit {

  translations: Translation[] = [];
  totalTranslation: number | undefined;
  translateForm!: FormGroup;
  translateUpdateForm!: FormGroup;

  visibleForm: boolean = false;
  visibleUpdateForm: boolean = false;

  language: Language[] = [{ name: 'Spanish', code: 'es' }];

  selectedLanguage: Language | undefined;
  selectedTranslation: Translation | null = null;

  translatedWords: string[] = [];
  newTranslationWord: string = '';

  translateSearch: string = '';

  constructor(
    private translationService: TranslationService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.initForm();
    this.loadTranslations();

    this.language = [
      { name: 'Spanish', code: 'es' }
    ]

  }

  initForm() {
    this.translateForm = this.fb.group({
      word: ['', [Validators.required]],
      newTranslationWord: [''],
      selectedLanguage: [null, Validators.required],
      audio: [''],
      translatedWords: [[]]
    });

    this.translateUpdateForm = this.fb.group({
      word: ['', [Validators.required]],
      audio: [''],
      selectedLanguage: [null, Validators.required], // Ahora es obligatorio
      newTranslationWord: [''],
      translatedWords: [[]] // Inicializa como array vacío
    });
  }

  loadTranslations(): void {
    this.translationService.getAllTranslation().subscribe({
      next: (data) => {
        // console.log(data);
        this.translations = data;
        this.totalTranslation = data.length;
      }
    });
  }

  getTranslationKeys(translations: { [key: string]: any }): string[] {
    return Object.keys(translations);
  }

  showDialog() {
    this.visibleForm = true;
  }

  showDialogUpdate(translation: Translation) {
    this.selectedTranslation = { ...translation };

    const languageKey = Object.keys(translation.translations)[0] || null;
    const translatedWords = languageKey ? translation.translations[languageKey].words : [];
    const audio = languageKey ? translation.translations[languageKey].audio : '';

    // Encontrar el objeto de idioma completo en la lista
    const selectedLanguageObj = this.language.find(lang => lang.code === languageKey) || null;

    this.translateUpdateForm.patchValue({
      word: translation.word,
      audio: audio,
      selectedLanguage: selectedLanguageObj, // Asignar objeto completo
    });

    this.translateUpdateForm.get('translatedWords')?.setValue(translatedWords);

    console.log("Formulario después de patchValue:", this.translateUpdateForm.value);

    this.visibleUpdateForm = true;

    // Forzar actualización de la vista
    this.cdr.detectChanges();

  }

  addTranslationWord(form: FormGroup) {
    const newWord = form.get('newTranslationWord')?.value?.trim();
    if (!newWord) return;

    const currentWords = form.get('translatedWords')?.value || [];
    form.get('translatedWords')?.setValue([...currentWords, newWord]); // Clonamos el array para detectar cambios

    form.get('newTranslationWord')?.setValue(''); // Limpiar el input
  }

  removeTranslationWord(word: string, form: FormGroup) {
    const currentWords = form.get('translatedWords')?.value || [];
    form.get('translatedWords')?.setValue(currentWords.filter((w: string) => w !== word));
    this.cdr.detectChanges();
  }

  createTranslation() {
    if (this.translateForm.invalid) return;

    const { word, selectedLanguage, audio, translatedWords } = this.translateForm.value;

    const translationData: Translation = {
      id: '',
      word,
      audio,
      translations: {
        [selectedLanguage.code]: {
          words: [...translatedWords],
          audio
        }
      }
    };

    console.log("Enviando datos a la API:", translationData);

    this.translationService.createTranslation(translationData).subscribe({
      next: () => {
        this.loadTranslations();
        this.visibleForm = false;
        this.translateForm.reset();
      },
      error: (err: any) => console.error('Error creating translation:', err)
    });
  }

  updateTranslation() {
    if (this.translateUpdateForm.invalid) return;

    const { word, selectedLanguage, audio, translatedWords } = this.translateUpdateForm.value;

    const updateTranslate: Translation = {
      ...this.selectedTranslation,
      id: this.selectedTranslation?.id || '',
      word,
      audio,
      translations: {
        [selectedLanguage.code]: {
          words: [...translatedWords], // ⚠️ Asegurar que no sea referencia directa
          audio
        }
      }
    };

    console.log("Datos enviados a la API para actualizar:", updateTranslate);

    this.translationService.updateTranslation(updateTranslate).subscribe({
      next: () => {
        this.loadTranslations();
        this.visibleUpdateForm = false;
        console.log("Se actualizó correctamente");
      },
      error: (error) => {
        console.log("Error en la actualización:", error);
      }
    });
  }

  searchTranslateWord(): void {

    const searchTerm = this.translateSearch || '';
    this.translationService.getTranslationAllByWord(searchTerm).subscribe({
      next: (data) => {
        this.translations = data;
        this.totalTranslation = data.length;
      },
      error: (error) => {
        console.log("Error en searchTranslateWord", error)
      }
    })
  }
}
