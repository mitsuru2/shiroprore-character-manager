import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CharacterFilterSettingsFormComponent } from './character-filter-settings-form.component';

describe('CharacterFilterSettingsFormComponent', () => {
  let component: CharacterFilterSettingsFormComponent;
  let fixture: ComponentFixture<CharacterFilterSettingsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CharacterFilterSettingsFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CharacterFilterSettingsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
