import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagePostListComponent } from './manage-post-list.component';

describe('ManagePostListComponent', () => {
  let component: ManagePostListComponent;
  let fixture: ComponentFixture<ManagePostListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagePostListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagePostListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
