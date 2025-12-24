import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalConfirmDialogComponent } from './global-confirm-dialog.component';

describe('GlobalConfirmDialogComponent', () => {
  let component: GlobalConfirmDialogComponent;
  let fixture: ComponentFixture<GlobalConfirmDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalConfirmDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlobalConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
