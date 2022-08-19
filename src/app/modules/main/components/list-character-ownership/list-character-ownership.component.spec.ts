import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListCharacterOwnershipComponent } from './list-character-ownership.component';

describe('ListCharacterOwnershipComponent', () => {
  let component: ListCharacterOwnershipComponent;
  let fixture: ComponentFixture<ListCharacterOwnershipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListCharacterOwnershipComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListCharacterOwnershipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
