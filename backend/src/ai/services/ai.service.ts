import { GeminiProvider } from '../providers/gemini.provider';
import { AnalyzeVulnerabilityDto } from '../dto/analyze-vulnerability.dto';
import { AIVulnerabilityAnalysis } from '../interfaces/ai-analysis.interface';
import { getVulnerabilityAnalysisPrompt } from '../prompts/vulnerability-analysis.prompt';
import * as aiRepository from '../repositories/ai.repository';

const CACHE_TTL_MS = 15 * 60 * 1000;

interface TimedCacheEntry<T> {
  value: T;
  expiresAt: number;
}

const getValidCacheEntry = <T>(cache: Map<string, TimedCacheEntry<T>>, key: string): T | null => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.value;
};

const setCacheEntry = <T>(cache: Map<string, TimedCacheEntry<T>>, key: string, value: T): void => {
  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
};

// Session structure in memory for Chat Context
const chatSessions = new Map<string, TimedCacheEntry<any>>();
// Executive Report caching mechanism to prevent excessive rate-limiting/high-demand errors
const reportCache = new Map<string, TimedCacheEntry<{ stats: any; data: any }>>();

export class AIService {
  private readonly gemini = new GeminiProvider();

  // --- SPRINT 11: Single Vulnerability Analysis ---
  async analyzeVulnerability(data: AnalyzeVulnerabilityDto): Promise<AIVulnerabilityAnalysis> {
    const prompt = getVulnerabilityAnalysisPrompt(data);

    const schema: any = {
      type: 'OBJECT',
      properties: {
        executiveSummary: { type: 'STRING' },
        technicalAnalysis: { type: 'STRING' },
        riskExplanation: { type: 'STRING' },
        attackScenario: { type: 'STRING' },
        businessImpact: { type: 'STRING' },
        remediation: { type: 'STRING' },
        references: { type: 'STRING' },
        confidenceScore: { type: 'INTEGER' },
      },
      required: [
        'executiveSummary',
        'technicalAnalysis',
        'riskExplanation',
        'attackScenario',
        'businessImpact',
        'remediation',
        'references',
        'confidenceScore',
      ],
    };

    const resultText = await this.gemini.generate(prompt, schema);
    const parsed = JSON.parse(resultText) as AIVulnerabilityAnalysis;

    // Validate the fields strictly
    const requiredFields: Array<keyof AIVulnerabilityAnalysis> = [
      'executiveSummary',
      'technicalAnalysis',
      'riskExplanation',
      'attackScenario',
      'businessImpact',
      'remediation',
      'references',
      'confidenceScore',
    ];

    for (const field of requiredFields) {
      if (parsed[field] === undefined || parsed[field] === null) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    return parsed;
  }

  // --- SPRINT 12: Executive AI Report ---
  async getExecutiveReport(ownerId: string): Promise<any> {
    // 1. Fetch user security context
    const assets = await aiRepository.getUserSecurityContext(ownerId);

    // 2. Aggregate statistics and vulnerabilities list
    let totalPorts = 0;
    let totalVulns = 0;
    let critical = 0;
    let high = 0;
    let medium = 0;
    let low = 0;

    const vulnsSummaryList: string[] = [];

    assets.forEach((asset) => {
      // Ports from scanHosts
      asset.scanHosts.forEach((sh) => {
        totalPorts += sh.ports.length;
      });

      // Ports and Vulns from hosts and services
      asset.hosts.forEach((h) => {
        h.services.forEach((s) => {
          totalPorts++;
          s.vulnerabilities.forEach((v) => {
            totalVulns++;
            if (v.severity === 'CRITICAL') critical++;
            else if (v.severity === 'HIGH') high++;
            else if (v.severity === 'MEDIUM') medium++;
            else if (v.severity === 'LOW') low++;

            vulnsSummaryList.push(
              `Asset: ${asset.hostname || asset.ipAddress} | Service: ${s.name}:${s.port} (${s.product || 'unknown'}) | Vulnerability: ${v.title} [Severity: ${v.severity}, CVE: ${v.cveId || 'none'}]`
            );
          });
        });
      });
    });

    const stats = {
      totalAssets: assets.length,
      totalPorts,
      totalVulnerabilities: totalVulns,
      criticalVulnerabilities: critical,
      highVulnerabilities: high,
      mediumVulnerabilities: medium,
      lowVulnerabilities: low,
    };

    const cached = getValidCacheEntry(reportCache, ownerId);
    if (cached && JSON.stringify(cached.stats) === JSON.stringify(stats)) {
      console.log(`[AI Cache] Returning cached Executive AI report for owner: ${ownerId}`);
      return cached.data;
    }

    const vulnsSummary = vulnsSummaryList.length > 0 
      ? vulnsSummaryList.slice(0, 30).join('\n')
      : 'No critical service vulnerabilities discovered.';

    const prompt = `You are a Lead Security Architect and Principal Threat Modeler.
Analyze the following organizational attack surface and vulnerability data:
- Total Discovered Assets: ${assets.length}
- Total Open Ports / Active Services: ${totalPorts}
- Total Discovered Vulnerabilities: ${totalVulns}
- Vulnerabilities Severity breakdown:
  - Critical: ${critical}
  - High: ${high}
  - Medium: ${medium}
  - Low: ${low}

Here is a summary of the discovered services and vulnerabilities:
${vulnsSummary}

Provide a comprehensive executive threat intelligence report.
Your response MUST be a valid JSON object matching the requested schema. Do not include any markdown formatting, backticks, or code blocks (\`\`\`json ... \`\`\`). The response must be pure JSON.
`;

    const schema: any = {
      type: 'OBJECT',
      properties: {
        executiveSummary: { type: 'STRING' },
        overallRiskScore: { type: 'INTEGER' },
        criticalFindings: {
          type: 'ARRAY',
          items: { type: 'STRING' }
        },
        attackSurfaceSummary: {
          type: 'OBJECT',
          properties: {
            details: { type: 'STRING' }
          },
          required: ['details']
        },
        likelyAttackPaths: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              step: { type: 'INTEGER' },
              title: { type: 'STRING' },
              description: { type: 'STRING' }
            },
            required: ['step', 'title', 'description']
          }
        },
        businessImpact: { type: 'STRING' },
        mitreAttackMapping: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              tactic: { type: 'STRING' },
              technique: { type: 'STRING' },
              description: { type: 'STRING' }
            },
            required: ['tactic', 'technique', 'description']
          }
        },
        cvssExplanation: { type: 'STRING' },
        prioritizedRemediationPlan: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              priority: { type: 'INTEGER' },
              action: { type: 'STRING' },
              difficulty: { type: 'STRING' },
              impact: { type: 'STRING' }
            },
            required: ['priority', 'action', 'difficulty', 'impact']
          }
        },
        finalConclusion: { type: 'STRING' }
      },
      required: [
        'executiveSummary',
        'overallRiskScore',
        'criticalFindings',
        'attackSurfaceSummary',
        'likelyAttackPaths',
        'businessImpact',
        'mitreAttackMapping',
        'cvssExplanation',
        'prioritizedRemediationPlan',
        'finalConclusion'
      ]
    };

    const resultText = await this.gemini.generate(prompt, schema);
    const report = JSON.parse(resultText);

    const reportData = {
      stats,
      report,
    };

    setCacheEntry(reportCache, ownerId, { stats, data: reportData });

    return reportData;
  }

  // --- SPRINT 12: SOC Chatbot with memory ---
  async sendChatMessage(ownerId: string, message: string): Promise<{ reply: string; history: any[] }> {
    let session = getValidCacheEntry(chatSessions, ownerId);
    if (!session) {
      // Fetch organizational security context
      const assets = await aiRepository.getUserSecurityContext(ownerId);
      
      let totalPorts = 0;
      let totalVulns = 0;
      const vulnsList: string[] = [];

      assets.forEach((asset) => {
        asset.hosts.forEach((h) => {
          h.services.forEach((s) => {
            totalPorts++;
            s.vulnerabilities.forEach((v) => {
              totalVulns++;
              vulnsList.push(`${v.title} on ${s.name} (Port ${s.port}) [Severity: ${v.severity}]`);
            });
          });
        });
        asset.scanHosts.forEach((sh) => {
          totalPorts += sh.ports.length;
        });
      });

      const contextSummary = `Here is the current security context of the organization:
- Total Discovered Assets: ${assets.length}
- Total Open Ports / Active Services: ${totalPorts}
- Total Discovered Vulnerabilities: ${totalVulns}
${vulnsList.length > 0 ? `- Vulnerabilities:\n${vulnsList.slice(0, 20).map(v => `  * ${v}`).join('\n')}` : '- No vulnerabilities discovered yet.'}
`;

      const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
      const model = process.env.AI_MODEL || 'gemini-2.5-flash';
      if (!apiKey) {
        throw new Error('Gemini API key is not configured.');
      }

      const { GoogleGenAI } = await import('@google/genai');
      const aiClient = new GoogleGenAI({ apiKey });

      const chat = aiClient.chats.create({
        model,
        config: {
          systemInstruction: `You are a professional SOC Analyst Chatbot for SentinelX AI. Help the user analyze their organization's security posture, assets, and vulnerability details. Use the following context to answer questions about the organization's status, lateral movement, or CVSS concerns:
${contextSummary}
Keep explanations technical yet accessible, concise, and structured.`
        }
      });

      session = chat;
      setCacheEntry(chatSessions, ownerId, session);
    }

    const response = await session.sendMessage({ message });
    const reply = response.text || 'No response generated.';

    const history = session.getHistory().map((item: any) => {
      const role = item.role === 'model' ? 'assistant' : item.role;
      const text = item.parts?.[0]?.text || '';
      return { role, text };
    });

    return { reply, history };
  }

  async resetChatHistory(ownerId: string): Promise<void> {
    chatSessions.delete(ownerId);
  }
}
