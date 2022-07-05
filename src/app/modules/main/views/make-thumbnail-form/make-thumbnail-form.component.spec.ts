import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MakeThumbnailFormComponent } from './make-thumbnail-form.component';

describe('MakeThumbnailFormComponent', () => {
  let component: MakeThumbnailFormComponent;
  let fixture: ComponentFixture<MakeThumbnailFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MakeThumbnailFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MakeThumbnailFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
