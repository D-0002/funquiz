import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExtremePage } from './extreme.page';

describe('ExtremePage', () => {
  let component: ExtremePage;
  let fixture: ComponentFixture<ExtremePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtremePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
