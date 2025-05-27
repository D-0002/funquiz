import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HowToPlayPage } from './how-to-play.page';

describe('HowToPlayPage', () => {
  let component: HowToPlayPage;
  let fixture: ComponentFixture<HowToPlayPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HowToPlayPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
