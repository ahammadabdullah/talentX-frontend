export type UserRole = "EMPLOYER" | "TALENT";
export type ApplicationSource = "MANUAL" | "INVITATION";
export type InvitationStatus = "PENDING" | "ACCEPTED" | "DECLINED";

export interface User {
  id: string;
  role: UserRole;
  email: string;
  name: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  techStack: string[];
  description: string;
  deadline: string;
  applicationCount: number;
  isExpired: boolean;
}

export interface Application {
  id: string;
  jobId: string;
  talentId: string;
  talentName: string;
  source: ApplicationSource;
  createdAt: string;
}

export interface Invitation {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  deadline: string;
  status: InvitationStatus;
  aiScore?: number;
}

export interface TalentScore {
  talentId: string;
  talentName: string;
  score: number;
}
