import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { VideoService } from '../../services/video.service';

@Component({
  selector: 'app-admin-upload',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './admin-upload.html',
  styleUrl: './admin-upload.css'
})
export class AdminUpload {
  title = '';
  description = '';
  selectedFile: File | null = null;
  loading = signal(false);
  error = signal('');
  success = signal('');

  constructor(
    private videoService: VideoService,
    private router: Router
  ) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
    }
  }

  upload() {
    if (!this.title) {
      this.error.set('Please enter a title');
      return;
    }

    if (!this.selectedFile) {
      this.error.set('Please select a video file');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('title', this.title);
    formData.append('description', this.description);

    this.videoService.uploadVideo(formData).subscribe({
      next: () => {
        this.success.set('Video uploaded successfully! Processing in background...');
        this.loading.set(false);
        this.title = '';
        this.description = '';
        this.selectedFile = null;
      },
      error: (err) => {
        this.error.set(err.error?.error || 'Upload failed. Please try again.');
        this.loading.set(false);
      }
    });
  }

  goToVideos() {
    this.router.navigate(['/videos']);
  }
}