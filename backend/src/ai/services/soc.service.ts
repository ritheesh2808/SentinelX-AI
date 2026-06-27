import { GeminiProvider } from '../providers/gemini.provider';
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

// SOC analysis in-memory cache with TTL support
const socAnalysisCache = new Map<string, TimedCacheEntry<{ stats: any; data: any }>>();

export class SocService {
  private readonly gemini = new GeminiProvider();

  async getSocAnalysis(ownerId: string): Promise<any> {
    // 1. Fetch user security context
    const assets = await aiRepository.getUserSecurityContext(ownerId);

    // 2. Aggregate raw statistics
    let totalPorts = 0;
    let totalVulns = 0;
    let critical = 0;
    let high = 0;
    let medium = 0;
    let low = 0;

    const vulnsSummaryList: string[] = [];
    const portsList: number[] = [];
    const servicesList: string[] = [];

    assets.forEach((asset) => {
      asset.scanHosts.forEach((sh) => {
        sh.ports.forEach((p) => {
          totalPorts++;
          portsList.push(p.portNumber);
          servicesList.push(p.service);
        });
      });

      asset.hosts.forEach((h) => {
        h.services.forEach((s) => {
          totalPorts++;
          portsList.push(s.port);
          servicesList.push(s.name);
          s.vulnerabilities.forEach((v) => {
            totalVulns++;
            if (v.severity === 'CRITICAL') critical++;
            else if (v.severity === 'HIGH') high++;
            else if (v.severity === 'MEDIUM') medium++;
            else if (v.severity === 'LOW') low++;

            vulnsSummaryList.push(
              `Asset: ${asset.hostname || asset.ipAddress} | Port: ${s.port} | Service: ${s.name} | Vulnerability: ${v.title} [Severity: ${v.severity}, CVE: ${v.cveId || 'N/A'}]`
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

    // Check Cache
    const cached = getValidCacheEntry(socAnalysisCache, ownerId);
    if (cached && JSON.stringify(cached.stats) === JSON.stringify(stats)) {
      console.log(`[SOC Cache] Returning cached SOC Analysis for owner: ${ownerId}`);
      return cached.data;
    }

    const vulnsSummaryText = vulnsSummaryList.length > 0
      ? vulnsSummaryList.slice(0, 30).join('\n')
      : 'No critical service vulnerabilities discovered.';

    const portsSummaryText = portsList.length > 0
      ? Array.from(new Set(portsList)).slice(0, 20).join(', ')
      : 'None';

    const servicesSummaryText = servicesList.length > 0
      ? Array.from(new Set(servicesList)).slice(0, 20).join(', ')
      : 'None';

    // 3. Prompt Gemini with structured output
    const prompt = `You are a Principal SOC Analyst, Lead Threat Modeler, and Chief Information Security Officer (CISO).
Analyze the following organizational attack surface and vulnerability dataset:
- Total Discovered Assets: ${assets.length}
- Total Open Ports / Active Services: ${totalPorts} (Exposed ports list: ${portsSummaryText})
- Active Services: ${servicesSummaryText}
- Total Discovered Vulnerabilities: ${totalVulns}
- Vulnerabilities Severity breakdown:
  - Critical: ${critical}
  - High: ${high}
  - Medium: ${medium}
  - Low: ${low}

Vulnerability and Service Details:
${vulnsSummaryText}

Generate a complete autonomous Security Operations Center (SOC) risk assessment and threat intelligence correlation report.
Your response MUST be a valid JSON object matching the requested schema. Do not include any markdown formatting, backticks, or code blocks (\`\`\`json ... \`\`\`). The response must be pure JSON.
`;

    const schema: any = {
      type: 'OBJECT',
      properties: {
        riskScore: { type: 'INTEGER' },
        criticalFindings: {
          type: 'ARRAY',
          items: { type: 'STRING' }
        },
        attackSurfaceSummary: { type: 'STRING' },
        attackPathTimeline: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              stage: { type: 'STRING' }, // Initial Access, Privilege Escalation, Lateral Movement, etc.
              title: { type: 'STRING' },
              description: { type: 'STRING' },
              nodeId: { type: 'STRING' }
            },
            required: ['stage', 'title', 'description', 'nodeId']
          }
        },
        graphData: {
          type: 'OBJECT',
          properties: {
            nodes: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  id: { type: 'STRING' },
                  label: { type: 'STRING' },
                  type: { type: 'STRING' } // attacker, asset, service, vulnerability, impact
                },
                required: ['id', 'label', 'type']
              }
            },
            edges: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  from: { type: 'STRING' },
                  to: { type: 'STRING' },
                  label: { type: 'STRING' }
                },
                required: ['from', 'to', 'label']
              }
            }
          },
          required: ['nodes', 'edges']
        },
        mitreMapping: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              cveId: { type: 'STRING' },
              vulnerabilityTitle: { type: 'STRING' },
              tactic: { type: 'STRING' },
              technique: { type: 'STRING' },
              detection: { type: 'STRING' },
              mitigation: { type: 'STRING' },
              references: { type: 'STRING' }
            },
            required: ['cveId', 'vulnerabilityTitle', 'tactic', 'technique', 'detection', 'mitigation', 'references']
          }
        },
        patchPrioritization: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              cveId: { type: 'STRING' },
              vulnerabilityTitle: { type: 'STRING' },
              severity: { type: 'STRING' },
              priorityScore: { type: 'INTEGER' },
              patchEffort: { type: 'STRING' }, // Low, Medium, High
              businessImpact: { type: 'STRING' },
              downtimeEstimate: { type: 'STRING' },
              why: { type: 'STRING' }
            },
            required: ['cveId', 'vulnerabilityTitle', 'severity', 'priorityScore', 'patchEffort', 'businessImpact', 'downtimeEstimate', 'why']
          }
        },
        incidentPlaybook: {
          type: 'OBJECT',
          properties: {
            timeline: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  timestampOffset: { type: 'STRING' },
                  event: { type: 'STRING' },
                  status: { type: 'STRING' }
                },
                required: ['timestampOffset', 'event', 'status']
              }
            },
            containmentPlan: { type: 'ARRAY', items: { type: 'STRING' } },
            eradicationPlan: { type: 'ARRAY', items: { type: 'STRING' } },
            recoveryPlan: { type: 'ARRAY', items: { type: 'STRING' } },
            lessonsLearned: { type: 'ARRAY', items: { type: 'STRING' } }
          },
          required: ['timeline', 'containmentPlan', 'eradicationPlan', 'recoveryPlan', 'lessonsLearned']
        },
        chartsData: {
          type: 'OBJECT',
          properties: {
            severityCount: {
              type: 'OBJECT',
              properties: {
                info: { type: 'INTEGER' },
                low: { type: 'INTEGER' },
                medium: { type: 'INTEGER' },
                high: { type: 'INTEGER' },
                critical: { type: 'INTEGER' }
              },
              required: ['info', 'low', 'medium', 'high', 'critical']
            },
            serviceDistribution: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  service: { type: 'STRING' },
                  count: { type: 'INTEGER' }
                },
                required: ['service', 'count']
              }
            },
            portDistribution: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  port: { type: 'INTEGER' },
                  count: { type: 'INTEGER' }
                },
                required: ['port', 'count']
              }
            },
            riskScoreTrend: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  month: { type: 'STRING' },
                  score: { type: 'INTEGER' }
                },
                required: ['month', 'score']
              }
            }
          },
          required: ['severityCount', 'serviceDistribution', 'portDistribution', 'riskScoreTrend']
        }
      },
      required: [
        'riskScore',
        'criticalFindings',
        'attackSurfaceSummary',
        'attackPathTimeline',
        'graphData',
        'mitreMapping',
        'patchPrioritization',
        'incidentPlaybook',
        'chartsData'
      ]
    };

    const resultText = await this.gemini.generate(prompt, schema);
    const parsedReport = JSON.parse(resultText);

    const fullResult = {
      stats,
      report: parsedReport,
    };

    // Cache the result
    setCacheEntry(socAnalysisCache, ownerId, { stats, data: fullResult });

    return fullResult;
  }
}
