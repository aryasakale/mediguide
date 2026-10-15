export type Category = 'Hospital' | 'Clinic' | 'Doctor' | 'Pharmacy';
export type Hospital = {
  id: string; name: string; category: Category; specialties: string[]; languages: string[];
  address: string; distanceKm?: number; rating?: number; open24h: boolean; emergency: boolean;
  phone?: string; hours: string; services: string[]; x?: number; y?: number; lat?: number; lng?: number; // x/y: legacy demo-map position; lat/lng: real coordinates
  verified: boolean; // false = sample record, never presented as verified
};
export type Filters = { q: string; location: string; distance: number; specialty: string; category: string; language: string; availability: string };
export type ChatMessage = { role: 'user' | 'assistant'; content: string; specialty?: string; urgent?: boolean; demo?: boolean };
export type Status = 'draft' | 'published' | 'archived';
export type Provider = {
  id: string; name: string; category: Category; address: string; city: string; state: string; postalCode?: string; phone?: string;
  services: string[]; specialties: string[]; languages: string[]; hours: string; open24h: boolean; emergency: boolean; rating?: number;
  lat: number; lng: number; status: Status; verified: boolean; verificationStatus?: 'pending' | 'under_review' | 'verified' | 'rejected'; submittedAt?: string | null; createdAt: string; updatedAt: string;
};
