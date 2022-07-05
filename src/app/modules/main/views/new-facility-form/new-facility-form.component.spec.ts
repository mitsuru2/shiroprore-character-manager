import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewFacilityFormComponent } from './new-facility-form.component';

describe('NewFacilityFormComponent', () => {
  let component: NewFacilityFormComponent;
  let fixture: ComponentFixture<NewFacilityFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewFacilityFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewFacilityFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
