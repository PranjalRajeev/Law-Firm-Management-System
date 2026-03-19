// src/app/client/hearings/client-hearings.component.ts

import { Component, OnInit } from '@angular/core';
import { HearingService } from '../../shared/services/hearing.service';
import { GroupedHearingsDto, HearingDto } from '../../shared/models/hearing.model';

@Component({
  selector: 'app-client-hearings',
  templateUrl: './client-hearings.component.html',
  styleUrls: ['./client-hearings.component.scss']
})
export class ClientHearingsComponent implements OnInit {

  grouped: GroupedHearingsDto | null = null;
  loading = true;
  error   = '';

  activeTab: 'upcoming' | 'past' = 'upcoming';

  // Detail panel state
  selectedHearing: HearingDto | null = null;
  detailLoading = false;

  constructor(private hearingService: HearingService) {}

  ngOnInit(): void {
    this.hearingService.getGroupedHearings().subscribe({
      next:  g  => { this.grouped = g; this.loading = false; },
      error: () => { this.error = 'Failed to load hearings. Please try again.'; this.loading = false; }
    });
  }

  // ── Tab helpers ───────────────────────────────────────────────────────────
  get displayList(): HearingDto[] {
    if (!this.grouped) return [];
    return this.activeTab === 'upcoming' ? this.grouped.upcoming : this.grouped.past;
  }

  setTab(tab: 'upcoming' | 'past'): void {
    this.activeTab = tab;
    this.selectedHearing = null;
  }

  // ── Detail panel ──────────────────────────────────────────────────────────
  openDetail(hearing: HearingDto): void {
    this.selectedHearing = hearing;
  }

  closeDetail(): void {
    this.selectedHearing = null;
  }

  // ── Status helpers ────────────────────────────────────────────────────────
  statusClass(status: string): string {
    const map: Record<string, string> = {
      SCHEDULED : 'badge--scheduled',
      COMPLETED : 'badge--completed',
      POSTPONED : 'badge--postponed',
      CANCELLED : 'badge--cancelled',
    };
    return map[status] ?? 'badge--scheduled';
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      SCHEDULED : 'Scheduled',
      COMPLETED : 'Completed',
      POSTPONED : 'Postponed',
      CANCELLED : 'Cancelled',
    };
    return map[status] ?? status;
  }

  // ── Date helpers ──────────────────────────────────────────────────────────
  getDay(iso: string): string {
    return new Date(iso).getDate().toString().padStart(2, '0');
  }

  getMonth(iso: string): string {
    return new Date(iso).toLocaleString('en-IN', { month: 'short' }).toUpperCase();
  }

  getYear(iso: string): string {
    return new Date(iso).getFullYear().toString();
  }

  getTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  }

  getFullDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-IN', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  daysUntil(iso: string): number {
    return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
  }
}