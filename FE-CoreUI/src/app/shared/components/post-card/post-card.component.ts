import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { BadgeComponent, CardModule } from '@coreui/angular';
import { stripHtml } from '../../utils/html.util';
import { Post } from '../../../core/models/post.model';
import { ImgUrlPipe } from '../../pipes/img-url.pipe';

@Component({
  selector: 'app-post-card',
  imports: [CommonModule, CardModule, RouterLink, DatePipe, BadgeComponent, ImgUrlPipe],
  templateUrl: './post-card.component.html',
  styleUrl: './post-card.component.scss',
})
export class PostCardComponent {
  post = input.required<Post>();
  layout = input<'grid' | 'list'>('grid');

  // NEW: Input to toggle status badges
  showStatus = input(false);

  linkPrefix = input<string>('/post');

  displayImage = computed(() => {
    if (this.post().url_thumbnail) {
      return this.post().url_thumbnail;
    }

    return null;
  });

  displayExcerpt = computed(() => {
    if (this.post().excerpt) return this.post().excerpt;
    return stripHtml(this.post().body);
  });

  authorName = computed(() => {
    return this.post().user?.fullName || 'Unknown Author';
  });

  postCategories = computed(() => {
    return this.post().categories || [{id: 0, name: "Other"}];
  })

}
