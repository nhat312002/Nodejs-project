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
import { UserProfileService } from '../../../core/services/user-profile.service';
import { ConfirmService } from 'src/app/core/services/confirm.service';

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
  private confirmService = inject(ConfirmService);
  public router = inject(Router);
  public authService = inject(AuthService);
  public userProfileService = inject(UserProfileService);

  // Data Signals
  post = signal<Post | null>(null);
  comments = signal<Comment[]>([]);
  isLoading = signal(true);

  // --- CURSOR PAGINATION STATE ---
  nextCursor = signal<number | null>(null); // The ID to fetch after
  hasMore = signal(false); // Should we show "Load More"?
  isLoadingComments = signal(false); // Spinner for the button

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

  _loadComments(postId: string) {
    this.commentService.getCommentsByPost(postId).subscribe(res => {
      if (res.success) {
        this.comments.set(res.data.comments);
      }
    });
  }

  // 1. UPDATED LOAD COMMENTS (Cursor Logic)
  loadComments(postId: string, isLoadMore: boolean = false) {
    this.isLoadingComments.set(true);

    // If initial load, send null cursor
    const cursorToSend = isLoadMore ? this.nextCursor() : null;

    this.commentService.getCommentsByPost(postId, cursorToSend).subscribe({
      next: (res) => {
        if (res.success) {
          const newComments = res.data.comments;

          // Update Meta
          this.nextCursor.set(res.data.meta.nextCursor);
          this.hasMore.set(res.data.meta.hasMore);

          if (isLoadMore) {
            // Append
            this.comments.update(current => [...current, ...newComments]);
          } else {
            // Replace (Fresh Load)
            this.comments.set(newComments);
          }
        }
        this.isLoadingComments.set(false);
      },
      error: () => this.isLoadingComments.set(false)
    });
  }

  // 2. ACTION: Load More Button
  onLoadMore() {
    if (this.hasMore() && this.nextCursor()) {
      this.loadComments(String(this.post()?.id), true);
    }
  }

  // --- HELPER FOR POSTING ---
  private performCreateComment(content: string, parentId: number | null, onSuccess: () => void) {
    if (!content.trim()) return;
    const post = this.post();
    if (!post) return;

    this.isSubmitting.set(true);

    this.commentService.createComment(post.id, content, parentId).subscribe({
      next: () => {
        this.loadComments(String(post.id), false);
        this.isSubmitting.set(false);
        onSuccess();
      },
      error: (err) => {
        this.confirmService.alert({
          title: 'Error',
          message: err.error?.message || 'Failed to post comment',
          color: 'danger'
        });
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
        this.confirmService.alert({
          title: 'Error',
          message: 'Failed to reply',
          color: 'danger'
        });
        this.isReplySubmitting.set(false);
      }
    });
  }

  // --- ACTIONS (REPLY) ---
  startReply(comment: Comment) {
    if (!this.authService.currentUser()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
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
      error: (err) => {
        this.confirmService.alert({
          title: 'Error',
          message: 'Failed to update comment',
          color: 'danger'
        });
        this.isSubmitting.set(false);
      }
    });
  }

  // --- ACTIONS (DELETE) ---
  async deleteComment(commentId: number) {
    const confirmed = await this.confirmService.ask({
      title: 'Delete Comment?',
      message: 'Are you sure you want to delete this comment?',
      confirmText: 'Delete',
      color: 'danger'
    });

    if (!confirmed) return;

    this.commentService.deleteComment(commentId).subscribe({
      next: () => {
        // Optimistic update
        this.loadComments(String(this.post()?.id));
      },
      error: (err) => {
        this.confirmService.alert({
          title: 'Error',
          message: 'Failed to delete comment',
          color: 'danger'
        });
      }
    });
  }

  async deletePost() {
    const confirmed = await this.confirmService.ask({
      title: 'Delete Post?',
      message: 'Are you sure you want to delete this post? This cannot be undone.',
      confirmText: 'Delete Forever',
      color: 'danger'
    });

    if (!confirmed) return;
    this.isProcessing.set(true);

    this.postService.delete(this.post()!.id).subscribe({
      next: () => {
         setTimeout(() => {

          this.confirmService.alert({
            title: 'Success',
            message: 'Post deleted successfully.',
            color: 'success'
          }).then(() => {
            this.router.navigate(['/profile/posts']);
          });

        }, 200); // 300ms delay gives the UI time to breathe
      },
      error: (err) => {
        this.confirmService.alert({
          title: 'Error',
          message: err.error?.message || 'Failed to delete post.',
          color: 'danger'
        });
        this.isProcessing.set(false);
      }
    });
  }
}
