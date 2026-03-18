import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-client-messages',
  templateUrl: './client-messages.component.html',
  styleUrls: ['./client-messages.component.scss']
})
export class ClientMessagesComponent implements OnInit, OnDestroy, AfterViewChecked {

  @ViewChild('messagesContainer') private msgContainer!: ElementRef;

  cases:           any[] = [];
  selectedCase:    any   = null;
  messages:        any[] = [];
  newMessage       = '';
  currentUserId:   number | null = null;

  isLoadingCases    = true;
  isLoadingMessages = false;
  isSending         = false;

  private pollSub?:       Subscription;
  private shouldScroll    = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.currentUserId = Number(localStorage.getItem('userId')) || null;
    this.loadCases();
  }

  ngOnDestroy(): void { this.pollSub?.unsubscribe(); }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) { this.scrollToBottom(); this.shouldScroll = false; }
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  // ── Cases ────────────────────────────────────────────────────────────────
  loadCases(): void {
    this.isLoadingCases = true;
    this.http.get<any[]>(`${environment.apiUrl}/client/cases`, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => { this.cases = data; this.isLoadingCases = false; },
        error: (err)  => { console.error(err); this.isLoadingCases = false; }
      });
  }

  selectCase(c: any): void {
    this.selectedCase = c;
    this.messages = [];
    this.pollSub?.unsubscribe();
    if (c.lawyerName) {
      this.loadMessages();
      // Poll for new messages every 10 seconds
      this.pollSub = interval(10000).subscribe(() => this.loadMessages(false));
    }
  }

  // ── Messages ──────────────────────────────────────────────────────────────
  loadMessages(showLoader = true): void {
    if (!this.selectedCase) return;
    if (showLoader) this.isLoadingMessages = true;

    this.http.get<any[]>(
      `${environment.apiUrl}/client/cases/${this.selectedCase.id}/messages`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (data) => {
        const hadNew = data.length > this.messages.length;
        this.messages = data;
        this.isLoadingMessages = false;
        if (hadNew || showLoader) this.shouldScroll = true;

        // Reset unread count on selected case
        if (this.selectedCase) this.selectedCase.unreadMessages = 0;
      },
      error: (err) => { console.error(err); this.isLoadingMessages = false; }
    });
  }

  sendMessage(): void {
    const content = this.newMessage.trim();
    if (!content || !this.selectedCase || this.isSending) return;

    this.isSending = true;
    const payload = {
      caseId:     this.selectedCase.id,
      receiverId: this.selectedCase.lawyerId,
      content,
      type: 'TEXT'
    };

    this.http.post<any>(
      `${environment.apiUrl}/client/messages/send`,
      payload,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (msg) => {
        this.messages.push(msg);
        this.newMessage = '';
        this.isSending  = false;
        this.shouldScroll = true;
      },
      error: (err) => { console.error(err); this.isSending = false; }
    });
  }

  onEnterKey(event: Event): void {
  const ke = event as KeyboardEvent;
  if (!ke.shiftKey) { event.preventDefault(); this.sendMessage(); }
}
  // ── Date separator helper ─────────────────────────────────────────────────
  showDateSeparator(current: any, prev: any): boolean {
    if (!prev) return true;
    const a = new Date(current.createdAt).toDateString();
    const b = new Date(prev.createdAt).toDateString();
    return a !== b;
  }

  // ── Scroll ────────────────────────────────────────────────────────────────
  private scrollToBottom(): void {
    try {
      const el = this.msgContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    } catch {}
  }
}