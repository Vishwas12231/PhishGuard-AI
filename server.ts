import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { db } from './server/db.js';
import {
  ai,
  CYBER_MODEL,
  analyzeEmail,
  analyzeURL,
  analyzeScreenshot,
  ScannerResult
} from './server/gemini.js';
import {
  requireAuth,
  optionalAuth,
  JWT_SECRET,
  AuthenticatedRequest
} from './server/middleware/auth.js';

// Setup file upload handling keeping images in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // limit file size to 5MB
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Security headers & Parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Custom standard security headers simulating Helmet
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'no-referrer');
    next();
  });

  // Simple In-Memory Rate Limiter to protect endpoints
  const ipLimits = new Map<string, { count: number; lastReset: number }>();
  app.use('/api/', (req, res, next) => {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const limitInfo = ipLimits.get(ip) || { count: 0, lastReset: now };

    if (now - limitInfo.lastReset > 60000) {
      limitInfo.count = 0;
      limitInfo.lastReset = now;
    }

    limitInfo.count++;
    ipLimits.set(ip, limitInfo);

    if (limitInfo.count > 100) {
      return res.status(429).json({ error: 'Too many security requests. Please verify connection bounds and try again in a minute.' });
    }
    next();
  });

  // ==========================================
  // AUTHENTICATION ENDPOINTS
  // ==========================================

  // Signup controller
  app.post('/api/auth/signup', (req, res) => {
    try {
      const { email, password, fullName } = req.body;

      if (!email || !password || !fullName) {
        return res.status(400).json({ error: 'Required signup credentials missing.' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password code length must be 6 characters or longer.' });
      }

      const existingUser = db.users.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ error: 'A cybersecurity account already exists for this email.' });
      }

      const hash = bcrypt.hashSync(password, 10);
      const user = db.users.create({
        email: email.toLowerCase(),
        passwordHash: hash,
        fullName
      });

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

      res.status(201).json({
        token,
        user: { id: user.id, email: user.email, fullName: user.fullName }
      });
    } catch (error) {
      console.error('Signup Failure:', error);
      res.status(500).json({ error: 'Cybersecurity gateway error registering account' });
    }
  });

  // Login controller
  app.post('/api/auth/login', (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password credentials are required.' });
      }

      const user = db.users.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password security signature.' });
      }

      const isValid = bcrypt.compareSync(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid email or password security signature.' });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

      res.json({
        token,
        user: { id: user.id, email: user.email, fullName: user.fullName }
      });
    } catch (error) {
      console.error('Login Failure:', error);
      res.status(500).json({ error: 'Cybersecurity gateway login failed' });
    }
  });

  // Profile lookup
  app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res) => {
    try {
      const user = db.users.findOne({ id: req.userId });
      if (!user) {
        return res.status(404).json({ error: 'Active profile not tracked in current systems.' });
      }

      res.json({
        user: { id: user.id, email: user.email, fullName: user.fullName }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to lookup security session.' });
    }
  });

  // ==========================================
  // EMAIL SCANNER
  // ==========================================
  app.post('/api/scan/email', optionalAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { senderEmail, subject, emailBody } = req.body;

      if (!emailBody) {
        return res.status(400).json({ error: 'Email message body text is required for phishing analysis.' });
      }

      const analysis = await analyzeEmail(
        senderEmail || 'unknown@incoming-domain.com',
        subject || '(No Subject Line)',
        emailBody
      );

      const report = db.scans.create({
        userId: req.userId,
        type: 'email',
        inputData: { senderEmail, subject, emailBody },
        result: analysis
      });

      res.json(report);
    } catch (error) {
      console.error('Email Analysis Error:', error);
      res.status(500).json({ error: 'Gemini security pipeline failed to complete Email Phishing scan.' });
    }
  });

  // ==========================================
  // URL SCANNER
  // ==========================================
  app.post('/api/scan/url', optionalAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { url } = req.body;

      if (!url) {
        return res.status(400).json({ error: 'Target URL link addresses are required for threat evaluation.' });
      }

      const analysis = await analyzeURL(url);

      const report = db.scans.create({
        userId: req.userId,
        type: 'url',
        inputData: { url },
        result: analysis
      });

      res.json(report);
    } catch (error) {
      console.error('URL Scan Error:', error);
      res.status(500).json({ error: 'Gemini security pipeline failed to scan URL rep.' });
    }
  });

  // ==========================================
  // SCREENSHOT IMAGE ANALYZER (Visions)
  // ==========================================
  app.post('/api/scan/image', optionalAuth, upload.single('image'), async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Please upload a screenshot or image of the suspicious artifact.' });
      }

      const base64Data = req.file.buffer.toString('base64');
      const mimeType = req.file.mimetype;

      const analysis = await analyzeScreenshot(base64Data, mimeType);

      const report = db.scans.create({
        userId: req.userId,
        type: 'image',
        inputData: { fileName: req.file.originalname },
        result: analysis
      });

      res.json(report);
    } catch (error) {
      console.error('Screenshot vision error:', error);
      res.status(500).json({ error: 'Image analysis error. Verify key options and format structure.' });
    }
  });

  // ==========================================
  // ACTION REPORT & HISTORICAL ARCHIVING
  // ==========================================

  function deduplicateAndFilterScans(reports: any[]) {
    // 1. Filter out the static seeded reports
    const realScans = reports.filter(r => {
      if (r.type === 'email' && r.inputData?.senderEmail === 'support-verify@paypa1-security-updates.net') return false;
      if (r.type === 'url' && r.inputData?.url === 'http://microsoft-outlook-web-mailbox-upgrade-resolve.support-server.xyz/exchange') return false;
      if (r.type === 'email' && r.inputData?.senderEmail === 'notifications@github.com' && r.inputData?.subject?.includes('Security Alert')) return false;
      return true;
    });

    // 2. Deduplicate based on type and key content
    const deduplicated = [];
    const seen = new Set();
    for (const item of realScans) {
      let key = '';
      if (item.type === 'email') {
        key = `email:${(item.inputData?.senderEmail || '').toLowerCase().trim()}:${(item.inputData?.subject || '').toLowerCase().trim()}:${(item.inputData?.emailBody || '').toLowerCase().trim()}`;
      } else if (item.type === 'url') {
        let url = (item.inputData?.url || '').toLowerCase().trim();
        if (url.endsWith('/')) {
          url = url.slice(0, -1);
        }
        key = `url:${url}`;
      } else if (item.type === 'image') {
        key = `image:${(item.inputData?.fileName || '').toLowerCase().trim()}`;
      } else {
        key = `id:${item.id}`;
      }

      if (!seen.has(key)) {
        seen.add(key);
        deduplicated.push(item);
      }
    }
    return deduplicated;
  }

  // List all scans
  app.get('/api/scan/history', optionalAuth, (req: AuthenticatedRequest, res) => {
    try {
      let rawReports = [];
      if (req.userId) {
        // Fetch specific user or guest session reports
        rawReports = db.scans.find({ userId: req.userId });
      } else {
        rawReports = [];
      }

      const cleanReports = deduplicateAndFilterScans(rawReports);
      res.json({ reports: cleanReports });
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve scanner records.' });
    }
  });

  // Delete scan item
  app.delete('/api/scan/:id', requireAuth, (req: AuthenticatedRequest, res) => {
    try {
      const scanId = req.params.id;
      const scan = db.scans.findOne({ id: scanId });

      if (!scan) {
        return res.status(404).json({ error: 'Threat report not resolved in the registry.' });
      }

      if (scan.userId !== req.userId) {
        return res.status(403).json({ error: 'Unauthorized to delete reports belonging to other profiles.' });
      }

      db.scans.delete(scanId);
      res.json({ success: true, message: 'Threat document safely removed from local catalog.' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete scanning document.' });
    }
  });

  // ==========================================
  // CYBERSECURITY CHATBOT (PhishGuard AI)
  // ==========================================
  app.post('/api/chat/message', optionalAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Prompt message cannot be blank.' });
      }

      // Save user prompt history
      db.chats.create({
        userId: req.userId,
        sender: 'user',
        message
      });

      // Gather previous short history to keep conversational state
      const userHistory = db.chats.find({ userId: req.userId || 'guest' }).slice(-6);
      
      const chatConversation = userHistory.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.message }]
      }));

      const sysInstruction = `
        You are "PhishGuard AI", an elite virtual enterprise cybersecurity and defense assistant.
        Your focus is strictly phishing email detection, credential scam techniques, suspicious URL indicators, scam screenshots, and mitigation blueprints.
        Provide professional, sharp, realistic, and expert advice. Support your explanations with brief actionable bullet points. Avoid flowery AI prose.
        If a user asks about anything unrelated to cybersecurity, computer systems security, or phishing, gracefully prompt them back to safety-first guidelines.
      `;

      const response = await ai.models.generateContent({
        model: CYBER_MODEL,
        contents: [
          // Prepend system guidelines and structure
          { role: 'user', parts: [{ text: sysInstruction }] },
          { role: 'model', parts: [{ text: "Understood. I am activated as PhishGuard AI, ready to analyze digital threat scenarios and outline mitigation blueprints." }] },
          ...chatConversation
        ],
      });

      const aiReplyText = response.text || 'Cybersecurity analysis engine was unable to formulate a stable safe response. Double check indicators.';

      // Save model reply history
      db.chats.create({
        userId: req.userId,
        sender: 'ai',
        message: aiReplyText
      });

      res.json({ reply: aiReplyText });
    } catch (error) {
      console.error('Chat AI failure:', error);
      res.status(500).json({ error: 'AI Assistant terminal offline. Ensure keys are calibrated.' });
    }
  });

  // Fetch chat timeline history
  app.get('/api/chat/history', optionalAuth, (req: AuthenticatedRequest, res) => {
    try {
      const history = db.chats.find({ userId: req.userId || 'guest' });
      res.json({ history });
    } catch (error) {
      res.status(500).json({ error: 'Failed to access cybersecurity logs.' });
    }
  });

  // Clear chat timelines
  app.delete('/api/chat/clear', optionalAuth, (req: AuthenticatedRequest, res) => {
    try {
      db.chats.clearUserHistory(req.userId || 'guest');
      res.json({ success: true, message: 'Conversation timeline successfully wiped clean.' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to prune conversation files.' });
    }
  });

  // ==========================================
  // SYSTEM ANALYTICS STATS DOCK
  // ==========================================
  app.get('/api/dashboard/stats', optionalAuth, (req: AuthenticatedRequest, res) => {
    try {
      let rawReports = [];
      if (req.userId) {
        rawReports = db.scans.find({ userId: req.userId });
      } else {
        rawReports = [];
      }

      // Filter seed reports & remove duplicates from metrics
      const userReports = deduplicateAndFilterScans(rawReports);

      const totalScans = userReports.length;
      const dangerousReports = userReports.filter(r => r.result.threatLevel === 'Dangerous');
      const suspiciousReports = userReports.filter(r => r.result.threatLevel === 'Suspicious');
      const safeReports = userReports.filter(r => r.result.threatLevel === 'Safe');

      const avgThreatScore = totalScans > 0 
        ? Math.round(userReports.reduce((sum, r) => sum + r.result.threatScore, 0) / totalScans)
        : 0;

      // Extract details for standard charts (e.g., breakdown by category)
      const categories = { email: 0, url: 0, image: 0 };
      userReports.forEach(r => {
        if (categories[r.type] !== undefined) categories[r.type]++;
      });

      // Simple timeline data feed
      const timelineData = userReports.slice(0, 5).map(r => ({
        id: r.id,
        timestamp: r.createdAt,
        type: r.type,
        threatScore: r.result.threatScore,
        level: r.result.threatLevel,
        preview: r.type === 'email' ? r.inputData.senderEmail : r.type === 'url' ? r.inputData.url : r.inputData.fileName
      }));

      res.json({
        totalScans,
        dangerousCount: dangerousReports.length,
        suspiciousCount: suspiciousReports.length,
        safeCount: safeReports.length,
        avgThreatScore,
        categories,
        timeline: timelineData
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to compile dashboard analytics.' });
    }
  });

  // Serve static application inside the Vite middleware pipeline
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[PhishGuard AI Engine Server] booted on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Fatal Server Boot Error:', error);
});
