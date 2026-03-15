import { User } from './user.model';

export interface Document {
  id: number;
  title: string;
  description?: string;
  filePath: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  documentType: 'CONTRACT' | 'EVIDENCE' | 'COURT_FILING' | 'CORRESPONDENCE' | 'RESEARCH' | 'INVOICE' | 'OTHER';
  status: 'UPLOADED' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'ARCHIVED';
  uploadedBy: number;
  uploadedAt: string;
  updatedAt: string;
  uploadedByUser: User;
}

export interface UploadDocumentRequest {
  title: string;
  description?: string;
  documentType: string;
  caseId: number;
  file: File;
}
