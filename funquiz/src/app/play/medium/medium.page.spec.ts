import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MediumPage } from './medium.page';

describe('MediumPage', () => {
  let component: MediumPage;
  let fixture: ComponentFixture<MediumPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MediumPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
