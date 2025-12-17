import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

// CoreUI & Icons
import {
  AvatarModule, ButtonDirective, SpinnerModule, FormModule, DropdownModule,
  BadgeComponent
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';

// App Imports
import { AuthService } from '../../../core/services/auth.service';
import { PostService } from '../../../core/services/post.service';
import { CommentService } from '../../../core/services/comment.service';
import { Post } from '../../../core/models/post.model'; // Ensure this model exists
import { Comment } from '../../../core/models/comment.model';
import { ImgUrlPipe } from '../../../shared/pipes/img-url.pipe';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [
    CommonModule, RouterLink, DatePipe, FormsModule,
    AvatarModule, ButtonDirective, SpinnerModule, IconDirective, FormModule, DropdownModule,
    ImgUrlPipe, BadgeComponent
  ],
  templateUrl: './post-detail.component.html',
  styleUrl: './post-detail.component.scss'
})
export class PostDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private postService = inject(PostService);
  private commentService = inject(CommentService);
  private titleService = inject(Title);
  public router = inject(Router);
  public authService = inject(AuthService);

  // Data Signals
  post = signal<Post | null>(null);
  comments = signal<Comment[]>([]);
  isLoading = signal(true);

  // --- STATE FOR ACTIONS ---
  newCommentText = signal('');
  isSubmitting = signal(false);

  // Edit State (Track which comment is being edited)
  editingCommentId = signal<number | null>(null);
  editCommentText = signal('');

  // Reply State (Track which comment is being replied to)
  replyingToId = signal<number | null>(null);
  replyText = signal('');
  isReplySubmitting = signal(false);

  mode = signal<'public' | 'owner' | 'admin'>('public');
  isProcessing = signal(false); // For delete/approve buttons

  ngOnInit() {
    // 1. Determine Mode
    const routeDataMode = this.route.snapshot.data['mode'];
    this.mode.set(routeDataMode || 'public');

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) this.loadData(id);
    });
  }

  loadData(id: string) {
    this.isLoading.set(true);

    let request$;
    switch (this.mode()) {
      case 'owner':
        request$ = this.postService.getOwnPostDetail(id);
        break;
      case 'admin':
        request$ = this.postService.getAdminPostDetail(id);
        break;
      case 'public':
      default:
        request$ = this.postService.getPostDetail(id);
        break;
    }

    request$.subscribe({
      next: (res) => {
        if (res.success) {
          this.post.set(res.data.post);
          this.titleService.setTitle(res.data.post.title);
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

  // --- HELPER FOR POSTING ---
  private performCreateComment(content: string, parentId: number | null, onSuccess: () => void) {
    if (!content.trim()) return;
    const post = this.post();
    if (!post) return;

    this.isSubmitting.set(true);

    this.commentService.createComment(post.id, content, parentId).subscribe({
      next: () => {
        this.loadComments(String(post.id));
        this.isSubmitting.set(false);
        onSuccess();
      },
      error: () => {
        alert('Failed to post comment');
        this.isSubmitting.set(false);
      }
    });
  }

  // 1. Submit Main Comment
  submitMainComment() {
    this.performCreateComment(
      this.newCommentText(),
      null,
      () => this.newCommentText.set('')
    );
  }

  // 2. Submit Reply
  submitReply(targetComment: Comment) {
    const parentId = targetComment.id; // Or targetComment.parentId if implementing deep nesting logic

    // Use specific loading state for reply button if desired, or share global isSubmitting
    this.isReplySubmitting.set(true);

    this.commentService.createComment(this.post()!.id, this.replyText(), parentId).subscribe({
      next: () => {
        this.replyText.set('');
        this.replyingToId.set(null);
        this.loadComments(String(this.post()!.id));
        this.isReplySubmitting.set(false);
      },
      error: () => {
        alert('Failed to reply');
        this.isReplySubmitting.set(false);
      }
    });
  }

  // --- ACTIONS (REPLY) ---
  startReply(comment: Comment) {
    if (!this.authService.currentUser()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url }});
      return;
    }
    this.editingCommentId.set(null); // Cancel any edit
    this.replyingToId.set(comment.id);
    this.replyText.set('');
  }

  cancelReply() {
    this.replyingToId.set(null);
    this.replyText.set('');
  }

  // --- ACTIONS (EDIT) ---
  startEdit(comment: Comment) {
    this.replyingToId.set(null); // Cancel any reply
    this.editingCommentId.set(comment.id);
    this.editCommentText.set(comment.content);
  }

  cancelEdit() {
    this.editingCommentId.set(null);
    this.editCommentText.set('');
  }

  saveEdit(commentId: number) {
    if (!this.editCommentText().trim()) return;

    this.isSubmitting.set(true);
    this.commentService.updateComment(commentId, this.editCommentText()).subscribe({
      next: () => {
        this.editingCommentId.set(null);
        this.loadComments(String(this.post()?.id));
        this.isSubmitting.set(false);
      },
      error: () => this.isSubmitting.set(false)
    });
  }

  // --- ACTIONS (DELETE) ---
  deleteComment(commentId: number) {
    if(!confirm('Delete this comment?')) return;

    this.commentService.deleteComment(commentId).subscribe({
      next: () => {
        // Optimistic update
        this.loadComments(String(this.post()?.id));
      }
    });
  }

  deletePost() {
    if (!confirm('Are you sure you want to delete this post? This cannot be undone.')) return;
    this.isProcessing.set(true);

    this.postService.delete(this.post()!.id).subscribe({
      next: () => {
        alert('Post deleted.');
        this.router.navigate(['/profile/posts']);
      },
      error: () => {
        alert('Failed to delete.');
        this.isProcessing.set(false);
      }
    });
  }
}
