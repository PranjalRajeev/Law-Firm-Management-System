import { User } from './user.model';

export interface Message {
  id: number;
  content: string;
  type: 'TEXT' | 'FILE' | 'IMAGE' | 'SYSTEM';
  isRead: boolean;
  createdAt: string;
  sender: User;
  receiver: User;
  caseEntityId: number;
  attachmentUrl?: string;
}

export interface SendMessageRequest {
  content: string;
  receiverId: number;
  caseId?: number;
  type?: 'TEXT' | 'FILE' | 'IMAGE';
  attachmentUrl?: string;
}
