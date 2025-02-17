import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListContentBookComponent } from './list-content-book.component';

describe('ListContentBookComponent', () => {
  let component: ListContentBookComponent;
  let fixture: ComponentFixture<ListContentBookComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListContentBookComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListContentBookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
