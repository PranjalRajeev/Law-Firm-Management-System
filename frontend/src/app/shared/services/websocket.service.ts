import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket!: WebSocket;
  private messageSubject = new Subject<any>();
  private connectionSubject = new Subject<boolean>();

  constructor() {}

  connect(): void {
    if (!this.socket || this.socket.readyState === WebSocket.CLOSED) {
      this.socket = new WebSocket(`${environment.apiUrl.replace('http', 'ws')}/ws`);
      
      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.connectionSubject.next(true);
      };

      this.socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        this.messageSubject.next(message);
      };

      this.socket.onclose = () => {
        console.log('WebSocket disconnected');
        this.connectionSubject.next(false);
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.connectionSubject.next(false);
      };
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
    }
  }

  sendMessage(message: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  getMessages(): Observable<any> {
    return this.messageSubject.asObservable();
  }

  getConnectionStatus(): Observable<boolean> {
    return this.connectionSubject.asObservable();
  }

  isConnected(): boolean {
    return this.socket && this.socket.readyState === WebSocket.OPEN;
  }
}
