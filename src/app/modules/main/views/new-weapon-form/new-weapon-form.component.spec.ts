import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewWeaponFormComponent } from './new-weapon-form.component';

describe('NewWeaponFormComponent', () => {
  let component: NewWeaponFormComponent;
  let fixture: ComponentFixture<NewWeaponFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewWeaponFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewWeaponFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
