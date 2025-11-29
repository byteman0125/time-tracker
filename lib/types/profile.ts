export interface StoredProfile {
  id: string;
  name: string;
  email: string;
  title?: string;
  resumeUrl?: string;
  personalInfo?: {
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    notes?: string;
  };
}

export type ProfileOption = Pick<StoredProfile, "id" | "name" | "email" | "title">;


