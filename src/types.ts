export interface User {
  id: string;
  email: string;
  fullName: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
}

export interface ThreatAnalysis {
  threatScore: number;
  threatLevel: 'Safe' | 'Suspicious' | 'Dangerous';
  explanation: string;
  mitigationAdvice: string[];
  indicators: string[];
}

export interface ScanReport {
  id: string;
  userId?: string;
  type: 'email' | 'url' | 'image';
  inputData: {
    senderEmail?: string;
    subject?: string;
    emailBody?: string;
    url?: string;
    fileName?: string;
  };
  result: ThreatAnalysis;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  message: string;
  createdAt: string;
}

export interface DashboardStats {
  totalScans: number;
  dangerousCount: number;
  suspiciousCount: number;
  safeCount: number;
  avgThreatScore: number;
  categories: {
    email: number;
    url: number;
    image: number;
  };
  timeline: Array<{
    id: string;
    timestamp: string;
    type: 'email' | 'url' | 'image';
    threatScore: number;
    level: 'Safe' | 'Suspicious' | 'Dangerous';
    preview?: string;
  }>;
}
