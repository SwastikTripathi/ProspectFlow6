export interface Contact {
  id: string;
  name: string;
  email: string;
  notes: string;
  nextFollowUpDate: string | null; // ISO date string or null
  followUpCount: number;
  lastContactedDate?: string | null; // ISO date string or null
}
