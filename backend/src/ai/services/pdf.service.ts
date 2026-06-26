import PDFDocument from 'pdfkit';
import { Response } from 'express';

export const generateExecutivePdf = (
  res: Response,
  data: {
    company: string;
    scanTime: string;
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
      likelyAttackPaths: Array<{ step: number; title: string; description: string }>;
      businessImpact: string;
      mitreAttackMapping: Array<{ tactic: string; technique: string; description: string }>;
      cvssExplanation: string;
      prioritizedRemediationPlan: Array<{ priority: number; action: string; difficulty: string; impact: string }>;
      finalConclusion: string;
    };
    assets: any[];
  }
) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  doc.pipe(res);

  // --- PAGE 1: COVER PAGE ---
  doc.rect(0, 0, doc.page.width, doc.page.height).fill('#0b0f19');
  
  // Decorative cyber-pattern lines
  doc.strokeColor('#6366f1').lineWidth(4).moveTo(100, 180).lineTo(doc.page.width - 100, 180).stroke();
  
  // Title
  doc.fillColor('#ffffff').fontSize(32).font('Helvetica-Bold').text('SENTINELX AI', 100, 240);
  doc.fillColor('#a855f7').fontSize(20).text('EXECUTIVE CYBERSECURITY REPORT', 100, 290);
  
  // Subtitle
  doc.fillColor('#94a3b8').fontSize(12).font('Helvetica-Oblique').text('AI-Powered Threat Intelligence & Security Posture Assessment', 100, 320);

  // Metadata Panel
  doc.strokeColor('#1e293b').lineWidth(1).rect(100, 400, doc.page.width - 200, 150).fill('#131c2e').stroke();
  
  doc.fillColor('#ffffff').fontSize(12).font('Helvetica-Bold').text('REPORT METADATA', 120, 420);
  
  doc.fillColor('#94a3b8').font('Helvetica').fontSize(11);
  doc.text(`Organization / User:`, 120, 450);
  doc.fillColor('#ffffff').font('Helvetica-Bold').text(data.company, 280, 450);

  doc.fillColor('#94a3b8').font('Helvetica');
  doc.text(`Scan Date:`, 120, 470);
  doc.fillColor('#ffffff').font('Helvetica-Bold').text(data.scanTime, 280, 470);

  doc.fillColor('#94a3b8').font('Helvetica');
  doc.text(`Generation Date:`, 120, 490);
  doc.fillColor('#ffffff').font('Helvetica-Bold').text(new Date().toLocaleDateString(), 280, 490);

  doc.fillColor('#94a3b8').font('Helvetica');
  doc.text(`Overall Risk Level:`, 120, 510);
  const score = data.report.overallRiskScore;
  const level = score >= 75 ? 'CRITICAL' : score >= 50 ? 'HIGH' : score >= 25 ? 'MEDIUM' : 'LOW';
  doc.fillColor(score >= 50 ? '#ef4444' : '#f59e0b').font('Helvetica-Bold').text(`${level} (${score}/100)`, 280, 510);

  // Footer on cover
  doc.fillColor('#475569').fontSize(10).font('Helvetica').text('CONFIDENTIAL • FOR INTERNAL USE ONLY', 100, doc.page.height - 80, { align: 'center', width: doc.page.width - 200 });

  // --- PAGE 2: EXECUTIVE SUMMARY & RISK SCORE ---
  doc.addPage();
  
  // Header banner on inner pages
  doc.rect(0, 0, doc.page.width, 60).fill('#131c2e');
  doc.fillColor('#ffffff').fontSize(14).font('Helvetica-Bold').text('SENTINELX AI EXECUTIVE REPORT', 50, 22);
  doc.strokeColor('#6366f1').lineWidth(2).moveTo(0, 60).lineTo(doc.page.width, 60).stroke();

  // Heading: Executive Summary
  doc.fillColor('#1e293b').fontSize(18).font('Helvetica-Bold').text('1. Executive Threat Posture', 50, 90);
  doc.moveTo(50, 115).lineTo(doc.page.width - 50, 115).strokeColor('#e2e8f0').lineWidth(1).stroke();

  // Risk Score Box
  doc.strokeColor('#cbd5e1').rect(50, 130, 200, 100).fill('#f8fafc').stroke();
  doc.fillColor('#475569').fontSize(10).font('Helvetica-Bold').text('OVERALL RISK SCORE', 70, 150);
  doc.fillColor(score >= 50 ? '#ef4444' : '#f59e0b').fontSize(36).font('Helvetica-Bold').text(`${score}`, 70, 170);
  doc.fillColor('#64748b').fontSize(11).font('Helvetica').text('/ 100 Score', 145, 195);

  // Summary Text
  doc.fillColor('#334155').fontSize(11).font('Helvetica').text(data.report.executiveSummary, 270, 130, {
    width: doc.page.width - 320,
    align: 'justify',
    lineGap: 4
  });

  // Critical Findings
  doc.fillColor('#1e293b').fontSize(14).font('Helvetica-Bold').text('Critical Security Findings', 50, 260);
  doc.moveTo(50, 280).lineTo(doc.page.width - 50, 280).strokeColor('#e2e8f0').lineWidth(1).stroke();

  let findY = 295;
  data.report.criticalFindings.forEach((finding) => {
    doc.fillColor('#ef4444').fontSize(11).font('Helvetica-Bold').text(`•`, 50, findY);
    doc.fillColor('#334155').fontSize(11).font('Helvetica').text(finding, 65, findY, { width: doc.page.width - 115 });
    findY += doc.heightOfString(finding, { width: doc.page.width - 115 }) + 8;
  });

  // --- PAGE 3: ATTACK SURFACE & PORTS ---
  doc.addPage();
  doc.rect(0, 0, doc.page.width, 60).fill('#131c2e');
  doc.fillColor('#ffffff').fontSize(14).font('Helvetica-Bold').text('SENTINELX AI EXECUTIVE REPORT', 50, 22);
  doc.strokeColor('#6366f1').lineWidth(2).moveTo(0, 60).lineTo(doc.page.width, 60).stroke();

  doc.fillColor('#1e293b').fontSize(18).font('Helvetica-Bold').text('2. Attack Surface Summary', 50, 90);
  doc.moveTo(50, 115).lineTo(doc.page.width - 50, 115).strokeColor('#e2e8f0').lineWidth(1).stroke();

  // Attack surface text details
  doc.fillColor('#334155').fontSize(11).font('Helvetica').text(data.report.attackSurfaceSummary.details, 50, 130, {
    width: doc.page.width - 100,
    align: 'justify',
    lineGap: 4
  });

  // Stats Grid
  const gridY = 230;
  doc.strokeColor('#e2e8f0').rect(50, gridY, doc.page.width - 100, 70).fill('#f8fafc').stroke();
  
  // Cols
  doc.fillColor('#475569').fontSize(9).font('Helvetica-Bold').text('TOTAL ASSETS', 80, gridY + 15);
  doc.fillColor('#1e293b').fontSize(18).font('Helvetica-Bold').text(`${data.stats.totalAssets}`, 80, gridY + 30);

  doc.fillColor('#475569').fontSize(9).font('Helvetica-Bold').text('OPEN PORTS', 210, gridY + 15);
  doc.fillColor('#1e293b').fontSize(18).font('Helvetica-Bold').text(`${data.stats.totalPorts}`, 210, gridY + 30);

  doc.fillColor('#475569').fontSize(9).font('Helvetica-Bold').text('VULNERABILITIES', 340, gridY + 15);
  doc.fillColor('#1e293b').fontSize(18).font('Helvetica-Bold').text(`${data.stats.totalVulnerabilities}`, 340, gridY + 30);

  doc.fillColor('#475569').fontSize(9).font('Helvetica-Bold').text('CRITICAL / HIGH', 470, gridY + 15);
  const critHigh = data.stats.criticalVulnerabilities + data.stats.highVulnerabilities;
  doc.fillColor(critHigh > 0 ? '#ef4444' : '#22c55e').fontSize(18).font('Helvetica-Bold').text(`${critHigh}`, 470, gridY + 30);

  // Asset Inventory details (table header)
  doc.fillColor('#1e293b').fontSize(14).font('Helvetica-Bold').text('Discovered Assets & Services', 50, 320);
  doc.moveTo(50, 340).lineTo(doc.page.width - 50, 340).strokeColor('#e2e8f0').lineWidth(1).stroke();

  let tableY = 355;
  // Header row
  doc.rect(50, tableY, doc.page.width - 100, 20).fill('#131c2e');
  doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold').text('IP / Hostname', 60, tableY + 5);
  doc.text('OS', 230, tableY + 5);
  doc.text('Services & Ports', 360, tableY + 5);

  tableY += 20;
  
  data.assets.slice(0, 10).forEach((asset) => {
    // Collect services/ports text
    const portsList: string[] = [];
    asset.hosts.forEach((h: any) => {
      h.services.forEach((s: any) => portsList.push(`${s.port}/${s.protocol} (${s.name})`));
    });
    asset.scanHosts.forEach((sh: any) => {
      sh.ports.forEach((p: any) => {
        const item = `${p.portNumber}/${p.protocol} (${p.service})`;
        if (!portsList.includes(item)) portsList.push(item);
      });
    });

    doc.fillColor('#334155').fontSize(9).font('Helvetica').text(asset.hostname || asset.ipAddress, 60, tableY + 6);
    doc.text(asset.operatingSystem || 'Unknown', 230, tableY + 6);
    const portsStr = portsList.slice(0, 3).join(', ') + (portsList.length > 3 ? '...' : '');
    doc.text(portsStr || 'None', 360, tableY + 6, { width: 180 });

    doc.moveTo(50, tableY + 22).lineTo(doc.page.width - 50, tableY + 22).strokeColor('#f1f5f9').lineWidth(1).stroke();
    tableY += 22;
  });

  // --- PAGE 4: ATTACK PATH & MITRE ---
  doc.addPage();
  doc.rect(0, 0, doc.page.width, 60).fill('#131c2e');
  doc.fillColor('#ffffff').fontSize(14).font('Helvetica-Bold').text('SENTINELX AI EXECUTIVE REPORT', 50, 22);
  doc.strokeColor('#6366f1').lineWidth(2).moveTo(0, 60).lineTo(doc.page.width, 60).stroke();

  doc.fillColor('#1e293b').fontSize(18).font('Helvetica-Bold').text('3. Threat Vector Modeling & MITRE Mapping', 50, 90);
  doc.moveTo(50, 115).lineTo(doc.page.width - 50, 115).strokeColor('#e2e8f0').lineWidth(1).stroke();

  // Attack Path timeline
  doc.fillColor('#475569').fontSize(12).font('Helvetica-Bold').text('Likely Attack Paths', 50, 130);
  
  let pathY = 150;
  data.report.likelyAttackPaths.forEach((path) => {
    // Step circle
    doc.strokeColor('#a855f7').fill('#a855f7').circle(60, pathY + 8, 8).fillAndStroke();
    doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold').text(`${path.step}`, 57, pathY + 4);

    doc.fillColor('#1e293b').fontSize(11).font('Helvetica-Bold').text(path.title, 80, pathY);
    doc.fillColor('#334155').fontSize(10).font('Helvetica').text(path.description, 80, pathY + 16, { width: doc.page.width - 150 });
    pathY += doc.heightOfString(path.description, { width: doc.page.width - 150 }) + 30;
  });

  // MITRE Cards
  doc.fillColor('#475569').fontSize(12).font('Helvetica-Bold').text('MITRE ATT&CK Alignment', 50, pathY + 10);
  
  let mitreY = pathY + 30;
  data.report.mitreAttackMapping.forEach((m) => {
    doc.strokeColor('#e2e8f0').rect(50, mitreY, doc.page.width - 100, 45).fill('#f8fafc').stroke();
    doc.fillColor('#6366f1').fontSize(10).font('Helvetica-Bold').text(`${m.tactic} > ${m.technique}`, 60, mitreY + 8);
    doc.fillColor('#475569').fontSize(9).font('Helvetica').text(m.description, 60, mitreY + 22, { width: doc.page.width - 120 });
    mitreY += 55;
  });

  // --- PAGE 5: REMEDIATION & CONCLUSION ---
  doc.addPage();
  doc.rect(0, 0, doc.page.width, 60).fill('#131c2e');
  doc.fillColor('#ffffff').fontSize(14).font('Helvetica-Bold').text('SENTINELX AI EXECUTIVE REPORT', 50, 22);
  doc.strokeColor('#6366f1').lineWidth(2).moveTo(0, 60).lineTo(doc.page.width, 60).stroke();

  doc.fillColor('#1e293b').fontSize(18).font('Helvetica-Bold').text('4. Recommended Actions & Conclusions', 50, 90);
  doc.moveTo(50, 115).lineTo(doc.page.width - 50, 115).strokeColor('#e2e8f0').lineWidth(1).stroke();

  // CVSS explanation
  doc.fillColor('#475569').fontSize(10).font('Helvetica-Oblique').text(`Vulnerability scoring alignment: ${data.report.cvssExplanation}`, 50, 130, { width: doc.page.width - 100 });

  // Prioritized actions
  doc.fillColor('#1e293b').fontSize(14).font('Helvetica-Bold').text('Prioritized Action Plan', 50, 180);
  doc.moveTo(50, 200).lineTo(doc.page.width - 50, 200).strokeColor('#e2e8f0').lineWidth(1).stroke();

  let actY = 215;
  data.report.prioritizedRemediationPlan.forEach((act) => {
    doc.strokeColor('#cbd5e1').rect(50, actY, doc.page.width - 100, 50).fill('#f8fafc').stroke();
    
    // Priority badge
    doc.fillColor('#131c2e').fontSize(12).font('Helvetica-Bold').text(`P${act.priority}`, 65, actY + 18);
    
    doc.fillColor('#334155').fontSize(10).font('Helvetica-Bold').text(act.action, 100, actY + 8);
    doc.fillColor('#64748b').fontSize(9).font('Helvetica').text(`Difficulty: ${act.difficulty}  |  Impact: ${act.impact}`, 100, actY + 24);
    
    actY += 60;
  });

  // Business Impact
  doc.fillColor('#1e293b').fontSize(14).font('Helvetica-Bold').text('Business Impact Analysis', 50, actY + 10);
  doc.moveTo(50, actY + 30).lineTo(doc.page.width - 50, actY + 30).strokeColor('#e2e8f0').lineWidth(1).stroke();

  doc.fillColor('#475569').fontSize(10).font('Helvetica').text(data.report.businessImpact, 50, actY + 40, {
    width: doc.page.width - 100,
    align: 'justify',
    lineGap: 3
  });

  // Final conclusion
  doc.fillColor('#1e293b').fontSize(14).font('Helvetica-Bold').text('Conclusion', 50, actY + 120);
  doc.moveTo(50, actY + 140).lineTo(doc.page.width - 50, actY + 140).strokeColor('#e2e8f0').lineWidth(1).stroke();

  doc.fillColor('#475569').fontSize(10).font('Helvetica').text(data.report.finalConclusion, 50, actY + 150, {
    width: doc.page.width - 100,
    align: 'justify',
    lineGap: 3
  });

  doc.end();
};
