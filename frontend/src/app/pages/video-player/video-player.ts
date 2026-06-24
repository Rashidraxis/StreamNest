import { Component, OnInit, OnDestroy, signal, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VideoService } from '../../services/video.service';
import { Video } from '../../models/video.model';
import Hls from 'hls.js';

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [],
  templateUrl: './video-player.html',
  styleUrl: './video-player.css'
})
export class VideoPlayer implements OnInit, OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;

  video = signal<Video | null>(null);
  loading = signal(true);
  error = signal('');
  private hls: Hls | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private videoService: VideoService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadVideo(parseInt(id));
    }
  }

  loadVideo(id: number) {
    this.videoService.getVideoById(id).subscribe({
      next: (video) => {
        this.video.set(video);
        this.loading.set(false);
        setTimeout(() => this.initPlayer(video.videoUrl), 100);
      },
      error: () => {
        this.error.set('Video not found');
        this.loading.set(false);
      }
    });
  }

  initPlayer(videoUrl: string) {
    const video = this.videoElement?.nativeElement;
    if (!video) return;

    if (Hls.isSupported()) {
      this.hls = new Hls();
      this.hls.loadSource(videoUrl);
      this.hls.attachMedia(video);
      this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play();
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS support
      video.src = videoUrl;
      video.play();
    } else {
      this.error.set('Your browser does not support HLS streaming');
    }
  }

  goBack() {
    this.router.navigate(['/videos']);
  }

  ngOnDestroy() {
    if (this.hls) {
      this.hls.destroy();
    }
  }
}