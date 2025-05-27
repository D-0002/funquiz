import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HardPage } from './hard.page';

describe('HardPage', () => {
  let component: HardPage;
  let fixture: ComponentFixture<HardPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
