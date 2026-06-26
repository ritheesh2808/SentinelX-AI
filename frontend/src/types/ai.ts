export interface AIVulnerabilityAnalysis {
  executiveSummary: string;
  technicalAnalysis: string;
  riskExplanation: string;
  attackScenario: string;
  businessImpact: string;
  remediation: string;
  references: string;
  confidenceScore: number;
}

export interface AIExecutiveReport {
  stats: {
    totalAssets: number;
    totalPorts: number;
    totalVulnerabilities: number;
    criticalVulnerabilities: number;
    highVulnerabilities: number;
    mediumVulnerabilities: number;
    lowVulnerabilities: number;
  };
  report: {
    executiveSummary: string;
    overallRiskScore: number;
    criticalFindings: string[];
    attackSurfaceSummary: {
      details: string;
    };
    likelyAttackPaths: Array<{
      step: number;
      title: string;
      description: string;
    }>;
    businessImpact: string;
    mitreAttackMapping: Array<{
      tactic: string;
      technique: string;
      description: string;
    }>;
    cvssExplanation: string;
    prioritizedRemediationPlan: Array<{
      priority: number;
      action: string;
      difficulty: string;
      impact: string;
    }>;
    finalConclusion: string;
  };
}

export interface AISocAnalysis {
  stats: {
    totalAssets: number;
    totalPorts: number;
    totalVulnerabilities: number;
    criticalVulnerabilities: number;
    highVulnerabilities: number;
    mediumVulnerabilities: number;
    lowVulnerabilities: number;
  };
  report: {
    riskScore: number;
    criticalFindings: string[];
    attackSurfaceSummary: string;
    attackPathTimeline: Array<{
      stage: string;
      title: string;
      description: string;
      nodeId: string;
    }>;
    graphData: {
      nodes: Array<{ id: string; label: string; type: string }>;
      edges: Array<{ from: string; to: string; label: string }>;
    };
    mitreMapping: Array<{
      cveId: string;
      vulnerabilityTitle: string;
      tactic: string;
      technique: string;
      detection: string;
      mitigation: string;
      references: string;
    }>;
    patchPrioritization: Array<{
      cveId: string;
      vulnerabilityTitle: string;
      severity: string;
      priorityScore: number;
      patchEffort: string;
      businessImpact: string;
      downtimeEstimate: string;
      why: string;
    }>;
    incidentPlaybook: {
      timeline: Array<{ timestampOffset: string; event: string; status: string }>;
      containmentPlan: string[];
      eradicationPlan: string[];
      recoveryPlan: string[];
      lessonsLearned: string[];
    };
    chartsData: {
      severityCount: {
        info: number;
        low: number;
        medium: number;
        high: number;
        critical: number;
      };
      serviceDistribution: Array<{ service: string; count: number }>;
      portDistribution: Array<{ port: number; count: number }>;
      riskScoreTrend: Array<{ month: string; score: number }>;
    };
  };
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}
