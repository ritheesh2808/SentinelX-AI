import { GeminiProvider } from '../providers/gemini.provider';
import { AnalyzeVulnerabilityDto } from '../dto/analyze-vulnerability.dto';
import { AIVulnerabilityAnalysis } from '../interfaces/ai-analysis.interface';
import { getVulnerabilityAnalysisPrompt } from '../prompts/vulnerability-analysis.prompt';

export class AIService {
  private readonly gemini = new GeminiProvider();

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
}
