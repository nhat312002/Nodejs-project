import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogPostList } from './blog-post-list';

describe('BlogPostList', () => {
  let component: BlogPostList;
  let fixture: ComponentFixture<BlogPostList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogPostList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogPostList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
