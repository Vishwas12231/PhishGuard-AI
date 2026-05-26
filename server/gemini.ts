import { GoogleGenAI, Type } from '@google/genai';

// Initialize the Gemini client as guided by the gemini-api skill
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('Warning: GEMINI_API_KEY variable is missing. AI features will require this key.');
}

export const ai = new GoogleGenAI({
  apiKey: apiKey || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export const CYBER_MODEL = 'gemini-3.5-flash';

// Interfaces for our sanitized schema results
export interface ScannerResult {
  threatScore: number;
  threatLevel: 'Safe' | 'Suspicious' | 'Dangerous';
  explanation: string;
  mitigationAdvice: string[];
  indicators: string[];
}

/**
 * Prompt structure for Phishing Analysis
 */
export async function analyzeEmail(sender: string, subject: string, body: string): Promise<ScannerResult> {
  const prompt = `
    Perform a complete cybersecurity analysis on the following incoming email.
    
    Email Details:
    - Sender Address: "${sender}"
    - Subject Line: "${subject}"
    - Email Body text:
    """
    ${body}
    """
    
    Inspect carefully for the following attack indicators:
    1. Urgency/Panic language and intimidation tactics.
    2. Logo, layout, and brand spoofing attempts.
    3. Typosquatting/spoofed sender domains (e.g., paypa1.com, amazon-support.net).
    4. Credential harvesting triggers or unsolicited security verification codes.
    5. Malicious links or request to click redirects.
    6. Grammar/syntax anomalies, spelling issues, and unprofessional elements.
    7. High-pressure social engineering formulas.
  `;

  return queryStructuredScanner(prompt);
}

/**
 * Prompt structure for URL Reputation Scan
 */
export async function analyzeURL(url: string): Promise<ScannerResult> {
  const prompt = `
    Analyze the following URL for cyber threats, reputation risks, and phishing markers.
    
    Target URL: "${url}"
    
    Evaluate security indicators including:
    1. Domain typosquatting or brand impersonation (e.g., "g00gle.com", "verify-netflix.co").
    2. Suspect Top-Level Domains (TLD) often utilized in drive-by scams or malicious downloads.
    3. Shortened URL structures (e.g., bit.ly) or high number of subdomains.
    4. Credential theft page indicators in the URL paths or parameters (e.g., login.php, update-password, verify_account).
    5. Absence of appropriate domain structure or suspect redirection anchors.
  `;

  return queryStructuredScanner(prompt);
}

/**
 * Prompt structure for image or screenshot multi-modal analysis
 */
export async function analyzeScreenshot(base64Data: string, mimeType: string = 'image/png'): Promise<ScannerResult> {
  const prompt = `
    Analyze the uploaded screenshot representing an email, text message, alert, web page, or login template for phishing, spoofed identities, and scams.
    
    Please read all the text in the screenshot, detect any fake branding indicators, urgency warnings, impersonation vectors, and harvest mechanics.
  `;

  try {
    const response = await ai.models.generateContent({
      model: CYBER_MODEL,
      contents: [
        {
          inlineData: {
            mimeType,
            data: base64Data,
          },
        },
        {
          text: prompt,
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          required: ['threatScore', 'threatLevel', 'explanation', 'mitigationAdvice', 'indicators'],
          properties: {
            threatScore: {
              type: Type.INTEGER,
              description: 'Risk rating score from 0 (Perfectly Safe) to 100 (Extremely Dangerous).',
            },
            threatLevel: {
              type: Type.STRING,
              description: 'Primary risk level category. Must represent exactly "Safe", "Suspicious", or "Dangerous".',
            },
            explanation: {
              type: Type.STRING,
              description: 'Comprehensive cybersecurity reason/explanation summarizing specific red flags detected.',
            },
            mitigationAdvice: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Actionable, standard cybersecurity steps/checklist on how to respond or protect yourself here.',
            },
            indicators: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Brief, specific suspicious elements noticed in the text or graphic elements (e.g. Spoof Sender, Artificial Urgency).',
            },
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return sanitizeResult(parsed);
  } catch (err) {
    console.error('Gemini vision query failed, falling back to basic safe output:', err);
    return getFallbackErrorResult(err);
  }
}

/**
 * Structured generation engine
 */
async function queryStructuredScanner(prompt: string): Promise<ScannerResult> {
  try {
    const response = await ai.models.generateContent({
      model: CYBER_MODEL,
      contents: prompt,
      config: {
        systemInstruction: `
          You are PhishGuard AI, a deep-learning cybersecurity engine. Your function is strictly to analyze inputted communications, links, or alerts for social engineering, malware, credential theft, and spoofing signatures.
          Always output a valid, structured JSON result conforming exactly to the requested schema.
        `,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          required: ['threatScore', 'threatLevel', 'explanation', 'mitigationAdvice', 'indicators'],
          properties: {
            threatScore: {
              type: Type.INTEGER,
              description: 'Score from 0 (Perfectly Safe) to 100 (Dangerous Critical Phase).',
            },
            threatLevel: {
              type: Type.STRING,
              description: 'Exactly: "Safe", "Suspicious", or "Dangerous".',
            },
            explanation: {
              type: Type.STRING,
              description: 'Clear structural intelligence analysis detailing the specific threats, domain problems, or scam indicators discovered.',
            },
            mitigationAdvice: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of expert concrete defense steps.',
            },
            indicators: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Technical tags indicating specific features of the threat (e.g. Typosquatting, Urgent Mood, No SSL Indicator).',
            },
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return sanitizeResult(parsed);
  } catch (error) {
    console.error('Gemini content scanner query failed:', error);
    return getFallbackErrorResult(error);
  }
}

function sanitizeResult(parsed: any): ScannerResult {
  return {
    threatScore: typeof parsed.threatScore === 'number' ? parsed.threatScore : 50,
    threatLevel: ['Safe', 'Suspicious', 'Dangerous'].includes(parsed.threatLevel) 
      ? parsed.threatLevel 
      : (parsed.threatScore > 75 ? 'Dangerous' : parsed.threatScore > 30 ? 'Suspicious' : 'Safe'),
    explanation: parsed.explanation || 'Verification complete. No detailed data was extracted from safety engines.',
    mitigationAdvice: Array.isArray(parsed.mitigationAdvice) ? parsed.mitigationAdvice : ['Exercise high vigilance.', 'Report sender or tag appropriately.'],
    indicators: Array.isArray(parsed.indicators) ? parsed.indicators : ['Potential threat profile unidentified.']
  };
}

function getFallbackErrorResult(error: any): ScannerResult {
  return {
    threatScore: 40,
    threatLevel: 'Suspicious',
    explanation: `The PhishGuard AI model encountered an analysis payload issue. Please check your network or review coordinates manually. Details: ${error instanceof Error ? error.message : String(error)}`,
    mitigationAdvice: [
      'Avoid sharing personal credentials on pages linked inside this subject.',
      'Manually crosscheck domain name characters for lookalike glyphs (homograph attack).',
      'Verify the entity via official standalone channels.'
    ],
    indicators: ['AI Scan Interrupted']
  };
}
