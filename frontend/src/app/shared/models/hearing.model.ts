// src/app/shared/models/hearing.model.ts

export interface HearingDto {
  id: number;
  title: string;
  description: string | null;
  hearingDate: string;        // ISO string e.g. "2026-03-24T10:30:00"
  courtName: string | null;
  courtRoom: string | null;
  judgeName: string | null;
  status: HearingStatus;
  notes: string | null;
  caseId: number;
  caseNumber: string;
  caseTitle: string;
}

export interface GroupedHearingsDto {
  upcoming: HearingDto[];
  past: HearingDto[];
  totalUpcoming: number;
  totalPast: number;
}

export type HearingStatus = 'SCHEDULED' | 'COMPLETED' | 'POSTPONED' | 'CANCELLED';