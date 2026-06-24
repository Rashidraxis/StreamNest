import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Video } from '../models/video.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class VideoService {

  private apiUrl = '/api/videos';
  private adminUrl = '/api/admin';

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  getAllVideos(): Observable<Video[]> {
    return this.http.get<Video[]>(this.apiUrl, {
      headers: this.getHeaders()
    });
  }

  getVideoById(id: number): Observable<Video> {
    return this.http.get<Video>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  searchVideos(query: string): Observable<Video[]> {
    return this.http.get<Video[]>(`${this.apiUrl}/search?query=${query}`, {
      headers: this.getHeaders()
    });
  }

  uploadVideo(formData: FormData): Observable<string> {
    return this.http.post<string>(`${this.adminUrl}/upload`, formData, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.authService.getToken()}`
      }),
      responseType: 'text' as 'json'
    });
  }

  deleteVideo(id: number): Observable<string> {
    return this.http.delete<string>(`${this.adminUrl}/videos/${id}`, {
      headers: this.getHeaders(),
      responseType: 'text' as 'json'
    });
  }
}