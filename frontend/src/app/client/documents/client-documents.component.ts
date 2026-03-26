// src/app/client/documents/client-documents.component.ts
// REPLACE the entire file with this content

import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DocumentService } from '../../shared/services/document.service';
import {
  DocumentDto, DocumentRequestDto, DocumentType, DocumentStatus,
  DOCUMENT_TYPE_LABELS, DOCUMENT_STATUS_LABELS
} from '../../shared/models/document.model';
import { environment } from '../../../environments/environment';
import { forkJoin } from 'rxjs';

interface CaseDocGroup {
  caseId:          number;
  caseNumber:      string;
  caseTitle:       string;
  caseStatus:      string;
  documents:       DocumentDto[];
  requests:        DocumentRequestDto[];
  docCount:        number;
  pendingRequests: number;  // requests waiting for client to fulfill
}

@Component({
  selector: 'app-client-documents',
  templateUrl: './client-documents.component.html',
  styleUrls:  ['./client-documents.component.scss']
})
export class ClientDocumentsComponent implements OnInit {

  // ── View state ────────────────────────────────────────────────────────────
  view: 'cases' | 'documents' = 'cases';

  // ── Cases overview ────────────────────────────────────────────────────────
  caseGroups:  CaseDocGroup[] = [];
  loadingCases = true;
  casesError   = '';

  // ── Document list ─────────────────────────────────────────────────────────
  activeCaseGroup: CaseDocGroup | null = null;
  documents: DocumentDto[]        = [];
  filtered:  DocumentDto[]        = [];
  requests:  DocumentRequestDto[] = [];

  // ── Active sub-tab ────────────────────────────────────────────────────────
  activeTab: 'documents' | 'requests' = 'documents';

  // ── Filters ───────────────────────────────────────────────────────────────
  searchKeyword  = '';
  selectedType   = '';
  selectedStatus = '';
  searchTimeout: any;

  // ── Selected document ─────────────────────────────────────────────────────
  selectedDoc: DocumentDto | null = null;

  // ── Upload panel (free upload) ────────────────────────────────────────────
  showUploadPanel  = false;
  uploadCaseId: number | null = null;
  uploadTitle      = '';
  uploadDesc       = '';
  uploadType       = 'OTHER';
  selectedFile: File | null = null;
  uploading        = false;
  uploadError      = '';
  uploadSuccess    = '';

  // ── Fulfill panel (for a specific request) ────────────────────────────────
  fulfillRequest: DocumentRequestDto | null = null;
  fulfillFile: File | null = null;
  fulfillTitle   = '';
  fulfillDesc    = '';
  fulfillType    = 'OTHER';
  fulfilling     = false;
  fulfillError   = '';
  fulfillSuccess = '';

  // ── Download ──────────────────────────────────────────────────────────────
  downloading: number | null = null;

  // ── Reference data ────────────────────────────────────────────────────────
  readonly typeLabels:   Record<string, string> = DOCUMENT_TYPE_LABELS;
  readonly statusLabels: Record<string, string> = DOCUMENT_STATUS_LABELS;
  readonly allTypes     = Object.keys(DOCUMENT_TYPE_LABELS)  as DocumentType[];
  readonly allStatuses  = Object.keys(DOCUMENT_STATUS_LABELS) as DocumentStatus[];

  private base = `${environment.apiUrl}/client`;

  constructor(private docService: DocumentService, private http: HttpClient) {}

  ngOnInit(): void { this.loadCaseGroups(); }

  // ── Load all docs + requests grouped by case ──────────────────────────────
  loadCaseGroups(): void {
    this.loadingCases = true;
    forkJoin({
      docs:     this.docService.getMyDocuments(),
      requests: this.http.get<DocumentRequestDto[]>(`${this.base}/document-requests`)
    }).subscribe({
      next: ({ docs, requests }) => {
        this.caseGroups   = this.groupByCase(docs, requests);
        this.loadingCases = false;
      },
      error: () => { this.casesError = 'Failed to load documents.'; this.loadingCases = false; }
    });
  }

  private groupByCase(docs: DocumentDto[], requests: DocumentRequestDto[]): CaseDocGroup[] {
    const map = new Map<number, CaseDocGroup>();

    for (const d of docs) {
      const cid = d.caseId ?? 0;
      if (!map.has(cid)) {
        map.set(cid, {
          caseId: cid, caseNumber: d.caseNumber ?? '—',
          caseTitle: d.caseTitle ?? 'Unknown Case', caseStatus: '',
          documents: [], requests: [], docCount: 0, pendingRequests: 0
        });
      }
      const g = map.get(cid)!;
      g.documents.push(d);
      g.docCount++;
    }

    for (const r of requests) {
      const cid = r.caseId ?? 0;
      if (!map.has(cid)) {
        map.set(cid, {
          caseId: cid, caseNumber: r.caseNumber ?? '—',
          caseTitle: r.caseTitle ?? 'Unknown Case', caseStatus: '',
          documents: [], requests: [], docCount: 0, pendingRequests: 0
        });
      }
      const g = map.get(cid)!;
      g.requests.push(r);
      if (r.status === 'PENDING') g.pendingRequests++;
    }

    return Array.from(map.values())
      .sort((a, b) => b.pendingRequests - a.pendingRequests || a.caseNumber.localeCompare(b.caseNumber));
  }

  // ── Drill into a case ─────────────────────────────────────────────────────
  openCase(group: CaseDocGroup): void {
    this.activeCaseGroup = group;
    this.view            = 'documents';
    this.documents       = [...group.documents];
    this.filtered        = [...group.documents];
    this.requests        = [...group.requests];
    this.selectedDoc     = null;
    this.activeTab       = group.pendingRequests > 0 ? 'requests' : 'documents';
    this.searchKeyword   = '';
    this.selectedType    = '';
    this.selectedStatus  = '';
    this.uploadCaseId    = group.caseId;
    this.fulfillRequest  = null;
  }

  backToCases(): void {
    this.view            = 'cases';
    this.activeCaseGroup = null;
    this.selectedDoc     = null;
    this.showUploadPanel = false;
    this.fulfillRequest  = null;
  }

  setTab(tab: 'documents' | 'requests'): void {
    this.activeTab      = tab;
    this.selectedDoc    = null;
    this.fulfillRequest = null;
  }

  // ── Filtering ─────────────────────────────────────────────────────────────
  onSearch(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => this.applyFilters(), 300);
  }

  onTypeFilter():   void { this.applyFilters(); }
  onStatusFilter(): void { this.applyFilters(); }

  clearFilters(): void {
    this.searchKeyword = ''; this.selectedType = ''; this.selectedStatus = '';
    this.applyFilters();
  }

  private applyFilters(): void {
    this.filtered = this.documents.filter(d => {
      const kw     = this.searchKeyword.toLowerCase();
      const searchOk = !kw || d.title.toLowerCase().includes(kw)
                            || d.fileName.toLowerCase().includes(kw);
      const typeOk   = !this.selectedType   || d.documentType === this.selectedType;
      const statusOk = !this.selectedStatus || d.status       === this.selectedStatus;
      return searchOk && typeOk && statusOk;
    });
  }

  // ── Detail panel ──────────────────────────────────────────────────────────
  openDetail(doc: DocumentDto): void  { this.selectedDoc = doc; }
  closeDetail(): void                  { this.selectedDoc = null; }

  // ── Upload (free) ─────────────────────────────────────────────────────────
  toggleUpload(): void {
    this.showUploadPanel = !this.showUploadPanel;
    if (!this.showUploadPanel) this.resetUploadForm();
    else this.uploadCaseId = this.activeCaseGroup?.caseId ?? null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
    if (this.selectedFile && !this.uploadTitle)
      this.uploadTitle = this.selectedFile.name.replace(/\.[^/.]+$/, '');
  }

  submitUpload(): void {
    if (!this.selectedFile || !this.uploadCaseId) { this.uploadError = 'Please select a file.'; return; }
    this.uploading = true; this.uploadError = ''; this.uploadSuccess = '';

    this.docService.uploadDocument(
      this.uploadCaseId, this.selectedFile,
      this.uploadTitle, this.uploadDesc, this.uploadType
    ).subscribe({
      next: doc => {
        this.documents.unshift(doc);
        this.applyFilters();
        if (this.activeCaseGroup) {
          this.activeCaseGroup.documents.unshift(doc);
          this.activeCaseGroup.docCount++;
        }
        this.uploadSuccess = `"${doc.title}" uploaded successfully.`;
        this.uploading = false;
        setTimeout(() => { this.showUploadPanel = false; this.resetUploadForm(); }, 2000);
      },
      error: err => { this.uploadError = err?.error?.message ?? 'Upload failed.'; this.uploading = false; }
    });
  }

  private resetUploadForm(): void {
    this.uploadTitle = ''; this.uploadDesc = ''; this.uploadType = 'OTHER';
    this.selectedFile = null; this.uploadError = ''; this.uploadSuccess = '';
  }

  // ── Fulfill a document request ────────────────────────────────────────────
  startFulfill(req: DocumentRequestDto): void {
    this.fulfillRequest = req;
    this.fulfillTitle   = req.title;
    this.fulfillDesc    = '';
    this.fulfillType    = 'OTHER';
    this.fulfillFile    = null;
    this.fulfillError   = '';
    this.fulfillSuccess = '';
    this.showUploadPanel = false;
  }

  closeFulfill(): void { this.fulfillRequest = null; }

  onFulfillFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.fulfillFile = input.files?.[0] ?? null;
  }

  submitFulfill(): void {
    if (!this.fulfillFile || !this.fulfillRequest || !this.activeCaseGroup) {
      this.fulfillError = 'Please select a file.'; return;
    }
    this.fulfilling    = true;
    this.fulfillError  = '';
    this.fulfillSuccess = '';

    const fd = new FormData();
    fd.append('file', this.fulfillFile);
    if (this.fulfillTitle) fd.append('title', this.fulfillTitle);
    if (this.fulfillDesc)  fd.append('description', this.fulfillDesc);
    fd.append('documentType', this.fulfillType);

    this.http.post<DocumentRequestDto>(
      `${this.base}/cases/${this.activeCaseGroup.caseId}/document-requests/${this.fulfillRequest.id}/fulfill`,
      fd
    ).subscribe({
      next: updatedReq => {
        // Update request in list
        const i = this.requests.findIndex(r => r.id === updatedReq.id);
        if (i > -1) this.requests[i] = updatedReq;
        if (this.activeCaseGroup) {
          const j = this.activeCaseGroup.requests.findIndex(r => r.id === updatedReq.id);
          if (j > -1) this.activeCaseGroup.requests[j] = updatedReq;
          this.activeCaseGroup.pendingRequests =
            this.activeCaseGroup.requests.filter(r => r.status === 'PENDING').length;
        }
        // Reload documents so the new upload shows up
        this.docService.getDocumentsForCase(this.activeCaseGroup!.caseId).subscribe(docs => {
          this.documents = docs;
          this.applyFilters();
          if (this.activeCaseGroup) {
            this.activeCaseGroup.documents = docs;
            this.activeCaseGroup.docCount = docs.length;
          }
        });
        this.fulfillSuccess = `Document submitted for "${updatedReq.title}".`;
        this.fulfilling     = false;
        setTimeout(() => { this.fulfillRequest = null; }, 2000);
      },
      error: err => { this.fulfillError = err?.error?.message ?? 'Upload failed.'; this.fulfilling = false; }
    });
  }

  // ── Download ──────────────────────────────────────────────────────────────
  download(doc: DocumentDto): void {
    this.downloading = doc.id;
    this.docService.downloadDocument(doc.id, doc.fileName);
    setTimeout(() => this.downloading = null, 2500);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  formatSize(bytes: number | null): string { return this.docService.formatFileSize(bytes); }

  typeLabel(t: string | null): string   { return t ? (DOCUMENT_TYPE_LABELS[t as DocumentType] ?? t) : '—'; }
  statusLabel(s: string | null): string { return s ? (DOCUMENT_STATUS_LABELS[s as DocumentStatus] ?? s) : '—'; }

  statusClass(s: string | null): string {
    const map: Record<string, string> = {
      UPLOADED: 'badge--uploaded', PENDING_REVIEW: 'badge--pending',
      APPROVED: 'badge--approved', REJECTED: 'badge--rejected', ARCHIVED: 'badge--archived'
    };
    return map[s ?? ''] ?? 'badge--uploaded';
  }

  requestStatusClass(s: string): string {
    const map: Record<string, string> = {
      PENDING: 'req-badge--pending', FULFILLED: 'req-badge--fulfilled', CANCELLED: 'req-badge--cancelled'
    };
    return map[s] ?? 'req-badge--pending';
  }

  fileIconClass(ft: string | null): string {
    switch (ft?.toUpperCase()) {
      case 'PDF': return 'icon--pdf';
      case 'DOC': case 'DOCX': return 'icon--doc';
      case 'XLS': case 'XLSX': return 'icon--xls';
      case 'JPG': case 'JPEG': case 'PNG': return 'icon--img';
      default: return 'icon--file';
    }
  }

  get activeFilterCount(): number {
    return [this.searchKeyword, this.selectedType, this.selectedStatus].filter(v => !!v).length;
  }

  docsByStatus(g: CaseDocGroup, status: string): number {
    return g.documents.filter(d => d.status === status).length;
  }

  get totalDocCount(): number {
    return this.caseGroups.reduce((sum, g) => sum + g.docCount, 0);
  }

  get totalPendingRequests(): number {
    return this.caseGroups.reduce((sum, g) => sum + g.pendingRequests, 0);
  }
}