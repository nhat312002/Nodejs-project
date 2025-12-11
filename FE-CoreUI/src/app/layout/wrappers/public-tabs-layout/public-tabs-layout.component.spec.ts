import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicTabsLayoutComponent } from './public-tabs-layout.component';

describe('PublicTabsLayoutComponent', () => {
  let component: PublicTabsLayoutComponent;
  let fixture: ComponentFixture<PublicTabsLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicTabsLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicTabsLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
