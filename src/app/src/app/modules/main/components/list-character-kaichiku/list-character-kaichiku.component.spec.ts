import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListCharacterKaichikuComponent } from './list-character-kaichiku.component';

describe('ListCharacterKaichikuComponent', () => {
  let component: ListCharacterKaichikuComponent;
  let fixture: ComponentFixture<ListCharacterKaichikuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListCharacterKaichikuComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListCharacterKaichikuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
