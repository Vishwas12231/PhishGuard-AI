import fs from 'fs';
import path from 'path';

// Define the file paths for local data persistence
const DATA_DIR = path.join(process.cwd(), 'data');

// Types corresponding to MongoDB schemas
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  createdAt: string;
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
  result: {
    threatScore: number; // 0-100
    threatLevel: 'Safe' | 'Suspicious' | 'Dangerous';
    explanation: string;
    mitigationAdvice: string[];
    indicators: string[]; // extracted threat items
  };
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  userId?: string;
  sender: 'user' | 'ai';
  message: string;
  createdAt: string;
}

// Database schema container
interface DB {
  users: User[];
  scans: ScanReport[];
  chats: ChatMessage[];
}

class Database {
  private dbPath = path.join(DATA_DIR, 'db.json');
  private data: DB = { users: [], scans: [], chats: [] };

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(this.dbPath)) {
        const fileContent = fs.readFileSync(this.dbPath, 'utf8');
        this.data = JSON.parse(fileContent);
      } else {
        this.save();
      }
    } catch (error) {
      console.error('Failed to initialize local JSON DB:', error);
    }
  }

  private save() {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (error) {
      console.error('Failed to save data status to JSON DB:', error);
    }
  }

  // Collection Accessors behaving like MongoDB
  get users() {
    return {
      find: (filter?: Partial<User>) => {
        if (!filter) return this.data.users;
        return this.data.users.filter(u => 
          Object.entries(filter).every(([key, val]) => (u as any)[key] === val)
        );
      },
      findOne: (filter: Partial<User>) => {
        return this.data.users.find(u => 
          Object.entries(filter).every(([key, val]) => (u as any)[key] === val)
        ) || null;
      },
      create: (user: Omit<User, 'id' | 'createdAt'>) => {
        const newUser: User = {
          ...user,
          id: 'u_' + Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString()
        };
        this.data.users.push(newUser);
        this.save();
        return newUser;
      }
    };
  }

  get scans() {
    return {
      find: (filter?: Partial<ScanReport>) => {
        let list = this.data.scans;
        if (filter) {
          list = list.filter(s => 
            Object.entries(filter).every(([key, val]) => (s as any)[key] === val)
          );
        }
        // Return reverse chronological order
        return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },
      findOne: (filter: Partial<ScanReport>) => {
        return this.data.scans.find(s => 
          Object.entries(filter).every(([key, val]) => (s as any)[key] === val)
        ) || null;
      },
      create: (scan: Omit<ScanReport, 'id' | 'createdAt'>) => {
        const newScan: ScanReport = {
          ...scan,
          id: 's_' + Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString()
        };
        this.data.scans.push(newScan);
        this.save();
        return newScan;
      },
      delete: (id: string) => {
        const idx = this.data.scans.findIndex(s => s.id === id);
        if (idx !== -1) {
          this.data.scans.splice(idx, 1);
          this.save();
          return true;
        }
        return false;
      }
    };
  }

  get chats() {
    return {
      find: (filter?: Partial<ChatMessage>) => {
        let list = this.data.chats;
        if (filter) {
          list = list.filter(c => 
            Object.entries(filter).every(([key, val]) => (c as any)[key] === val)
          );
        }
        return list;
      },
      create: (chat: Omit<ChatMessage, 'id' | 'createdAt'>) => {
        const newChat: ChatMessage = {
          ...chat,
          id: 'c_' + Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString()
        };
        this.data.chats.push(newChat);
        this.save();
        return newChat;
      },
      clearUserHistory: (userId: string) => {
        this.data.chats = this.data.chats.filter(c => c.userId !== userId);
        this.save();
        return true;
      }
    };
  }
}

export const db = new Database();
