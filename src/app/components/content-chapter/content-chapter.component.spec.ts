import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentChapterComponent } from './content-chapter.component';

describe('ContentChapterComponent', () => {
  let component: ContentChapterComponent;
  let fixture: ComponentFixture<ContentChapterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContentChapterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContentChapterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
