import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment';

@Pipe({
  name: 'imgUrl',
  standalone: true
})
export class ImgUrlPipe implements PipeTransform {

  transform(relativePath: string | undefined | null): string {
    if (!relativePath) {
      return '/assets/images/react.jpg';
    }

    if (relativePath.startsWith('http') || relativePath.startsWith('data:')) {
      return relativePath;
    }

    const baseUrl = environment.apiUrl.replace(/\/$/, '');

    const path = relativePath.replace(/^\//, '');

    return `${baseUrl}/${path}`;
  }
}
