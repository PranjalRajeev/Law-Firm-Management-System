import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Message, SendMessageRequest } from '../models/message.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private apiUrl = environment.apiUrl;

  constructor() {}

  getMessages(): Observable<Message[]> {
    // TODO: Implement get messages API call
    throw new Error('Not implemented yet');
  }

  getMessageById(id: number): Observable<Message> {
    // TODO: Implement get message by ID API call
    throw new Error('Not implemented yet');
  }

  sendMessage(messageData: SendMessageRequest): Observable<Message> {
    // TODO: Implement send message API call
    throw new Error('Not implemented yet');
  }

  getMessagesBetweenUsers(userId1: number, userId2: number): Observable<Message[]> {
    // TODO: Implement get messages between users API call
    throw new Error('Not implemented yet');
  }

  getMessagesByCase(caseId: number): Observable<Message[]> {
    // TODO: Implement get messages by case API call
    throw new Error('Not implemented yet');
  }

  markAsRead(messageId: number): Observable<Message> {
    // TODO: Implement mark as read API call
    throw new Error('Not implemented yet');
  }

  getUnreadCount(userId: number): Observable<number> {
    // TODO: Implement get unread count API call
    throw new Error('Not implemented yet');
  }
}
