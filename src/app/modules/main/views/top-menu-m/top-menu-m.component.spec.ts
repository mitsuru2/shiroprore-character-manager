import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopMenuMComponent } from './top-menu-m.component';

describe('TopMenuMComponent', () => {
  let component: TopMenuMComponent;
  let fixture: ComponentFixture<TopMenuMComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TopMenuMComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TopMenuMComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
