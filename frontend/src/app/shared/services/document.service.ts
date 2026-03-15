import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Document, UploadDocumentRequest } from '../models/document.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = environment.apiUrl;

  constructor() {}

  getDocuments(): Observable<Document[]> {
    // TODO: Implement get documents API call
    throw new Error('Not implemented yet');
  }

  getDocumentById(id: number): Observable<Document> {
    // TODO: Implement get document by ID API call
    throw new Error('Not implemented yet');
  }

  uploadDocument(documentData: UploadDocumentRequest): Observable<Document> {
    // TODO: Implement upload document API call
    throw new Error('Not implemented yet');
  }

  updateDocument(id: number, documentData: Partial<Document>): Observable<Document> {
    // TODO: Implement update document API call
    throw new Error('Not implemented yet');
  }

  deleteDocument(id: number): Observable<void> {
    // TODO: Implement delete document API call
    throw new Error('Not implemented yet');
  }

  getDocumentsByCase(caseId: number): Observable<Document[]> {
    // TODO: Implement get documents by case API call
    throw new Error('Not implemented yet');
  }

  getDocumentsByUser(userId: number): Observable<Document[]> {
    // TODO: Implement get documents by user API call
    throw new Error('Not implemented yet');
  }

  searchDocuments(keyword: string): Observable<Document[]> {
    // TODO: Implement search documents API call
    throw new Error('Not implemented yet');
  }

  downloadDocument(id: number): Observable<Blob> {
    // TODO: Implement download document API call
    throw new Error('Not implemented yet');
  }
}
