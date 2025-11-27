import { SlicePipe, DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { Post } from '../../services/blog';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-post-item',
  imports: [DatePipe, SlicePipe, RouterModule],
  templateUrl: './post-item.html',
  styleUrl: './post-item.css',
})
export class PostItem {
  post = input.required<Post>();
}
