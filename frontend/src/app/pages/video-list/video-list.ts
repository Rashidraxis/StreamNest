import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VideoService } from '../../services/video.service';
import { AuthService } from '../../services/auth.service';
import { Video } from '../../models/video.model';

@Component({
  selector: 'app-video-list',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './video-list.html',
  styleUrl: './video-list.css'
})
export class VideoList implements OnInit {
  videos = signal<Video[]>([]);
  loading = signal(true);
  error = signal('');
  searchQuery = '';
  userName = '';
  isAdmin = false;

  constructor(
    private videoService: VideoService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.userName = this.authService.getName() || '';
    this.isAdmin = this.authService.isAdmin();
    this.loadVideos();
  }

  loadVideos() {
    this.loading.set(true);
    this.videoService.getAllVideos().subscribe({
      next: (videos) => {
        this.videos.set(videos);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load videos');
        this.loading.set(false);
      }
    });
  }

  search() {
    if (!this.searchQuery.trim()) {
      this.loadVideos();
      return;
    }

    this.loading.set(true);
    this.videoService.searchVideos(this.searchQuery).subscribe({
      next: (videos) => {
        this.videos.set(videos);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Search failed');
        this.loading.set(false);
      }
    });
  }

  watchVideo(id: number) {
    this.router.navigate(['/watch', id]);
  }

  formatDuration(seconds: number): string {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  deleteVideo(id: number) {
    if (!confirm('Are you sure you want to delete this video?')) return;

    this.videoService.deleteVideo(id).subscribe({
      next: () => {
        // remove from local list without reloading
        this.videos.set(this.videos().filter(v => v.id !== id));
      },
      error: () => {
        alert('Failed to delete video');
      }
    });
  }
}