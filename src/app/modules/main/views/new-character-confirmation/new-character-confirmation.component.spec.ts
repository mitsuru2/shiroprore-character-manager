import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewCharacterConfirmationComponent } from './new-character-confirmation.component';

describe('NewCharacterConfirmationComponent', () => {
  let component: NewCharacterConfirmationComponent;
  let fixture: ComponentFixture<NewCharacterConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewCharacterConfirmationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewCharacterConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
