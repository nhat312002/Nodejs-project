import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogPostDetail } from './blog-post-detail';

describe('BlogPostDetail', () => {
  let component: BlogPostDetail;
  let fixture: ComponentFixture<BlogPostDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogPostDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogPostDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
