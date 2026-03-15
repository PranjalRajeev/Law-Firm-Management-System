import { User } from './user.model';

export interface Case {
  id: number;
  caseNumber: string;
  title: string;
  description?: string;
  caseType: 'CRIMINAL' | 'CIVIL' | 'FAMILY' | 'CORPORATE' | 'REAL_ESTATE' | 'IMMIGRATION' | 'TAX' | 'LABOR' | 'INTELLECTUAL_PROPERTY' | 'OTHER';
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED' | 'SETTLED' | 'DISMISSED' | 'APPEALED';
  dateOpened: string;
  dateClosed?: string;
  nextHearingDate?: string;
  courtName?: string;
  judgeName?: string;
  opposingCounsel?: string;
  settlementAmount?: number;
  feesCharged?: number;
  createdAt: string;
  updatedAt: string;
  client: User;
  assignedLawyer: User;
}

export interface CreateCaseRequest {
  title: string;
  description?: string;
  caseType: string;
  clientId: number;
  assignedLawyerId: number;
  courtName?: string;
  judgeName?: string;
  opposingCounsel?: string;
  nextHearingDate?: string;
}
