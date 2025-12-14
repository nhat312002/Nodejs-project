import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';

// CoreUI & Icons
import { AvatarModule, ButtonDirective, SpinnerModule } from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';

// App Imports
import { PostService } from '../../../core/services/post.service';
import { CommentService } from '../../../core/services/comment.service';
import { Post } from '../../../core/models/post.model';
import { Comment } from '../../../core/models/comment.model';
import { ImgUrlPipe } from '../../../shared/pipes/img-url.pipe';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [
    CommonModule, RouterLink, DatePipe,
    AvatarModule, ButtonDirective, SpinnerModule, IconDirective,
    ImgUrlPipe
  ],
  templateUrl: './post-detail.component.html',
  styleUrl: './post-detail.component.scss'
})
export class PostDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private postService = inject(PostService);
  private commentService = inject(CommentService);
  private titleService = inject(Title);

  post = signal<Post | null>(null);
  comments = signal<Comment[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadData(id);
      }
    });
  }

  loadData(id: string) {
    this.isLoading.set(true);

    // Fetch Post
    this.postService.getPostDetail(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.post.set(res.data.post);
          this.titleService.setTitle(res.data.post.title); // Update Tab Title

          // After post loads, fetch comments
          this.loadComments(id);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  loadComments(postId: string) {
    this.commentService.getCommentsByPost(postId).subscribe(res => {
      if (res.success) {
        this.comments.set(res.data.comments);
      }
    });
  }
}
