import PDFDocument from 'pdfkit';
import { Response } from 'express';

export const generateBoardPdf = (
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
      riskScore: number;
      criticalFindings: string[];
      attackSurfaceSummary: string;
      attackPathTimeline: Array<{ stage: string; title: string; description: string; nodeId: string }>;
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
    };
    assets: any[];
  }
) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  doc.pipe(res);

  const primaryColor = '#6366f1'; // Indigo
  const darkBg = '#0b0f19'; // Deep cyber black
  const secondaryBg = '#131c2e'; // Dark cards blue
  const accentColor = '#a855f7'; // Purple
  const textMuted = '#94a3b8'; // Light gray text
  const borderMuted = '#1e293b';

  // Helper for inner page header/footer
  const drawPageShell = (pageTitle: string) => {
    // Header banner
    doc.rect(0, 0, doc.page.width, 60).fill(secondaryBg);
    doc.fillColor('#ffffff').fontSize(12).font('Helvetica-Bold').text('SENTINELX SOC REPORT  |  CONFIDENTIAL', 50, 24);
    doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text(pageTitle.toUpperCase(), doc.page.width - 200, 24, { align: 'right', width: 150 });
    doc.strokeColor(primaryColor).lineWidth(1.5).moveTo(0, 60).lineTo(doc.page.width, 60).stroke();

    // Footer banner
    doc.strokeColor(borderMuted).lineWidth(1).moveTo(50, doc.page.height - 50).lineTo(doc.page.width - 50, doc.page.height - 50).stroke();
    doc.fillColor(textMuted).fontSize(8).font('Helvetica').text('CONFIDENTIAL - FOR BOARD OF DIRECTORS ONLY', 50, doc.page.height - 40);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, doc.page.width - 200, doc.page.height - 40, { align: 'right', width: 150 });
  };

  // --- PAGE 1: COVER PAGE ---
  doc.rect(0, 0, doc.page.width, doc.page.height).fill(darkBg);
  
  // Custom Deloitte/Microsoft Accent bars
  doc.strokeColor(primaryColor).lineWidth(5).moveTo(100, 160).lineTo(doc.page.width - 100, 160).stroke();
  doc.strokeColor(accentColor).lineWidth(3).moveTo(100, 172).lineTo(300, 172).stroke();

  // Titles
  doc.fillColor('#ffffff').fontSize(36).font('Helvetica-Bold').text('SENTINELX AI SOC', 100, 230);
  doc.fillColor(accentColor).fontSize(20).text('ENTERPRISE VULNERABILITY & RISK REPORT', 100, 280);
  doc.fillColor(textMuted).fontSize(12).font('Helvetica-Oblique').text('Board-Ready Executive Cybersecurity Posture Analysis', 100, 310);

  // Corporate Metadata box
  doc.strokeColor(borderMuted).lineWidth(1).rect(100, 420, doc.page.width - 200, 180).fill(secondaryBg).stroke();
  
  doc.fillColor('#ffffff').fontSize(11).font('Helvetica-Bold').text('REPORT SPECIFICATIONS', 125, 445);
  doc.moveTo(125, 460).lineTo(doc.page.width - 125, 460).strokeColor(borderMuted).stroke();

  doc.fillColor(textMuted).font('Helvetica').fontSize(10);
  doc.text('Target Organization:', 125, 480);
  doc.fillColor('#ffffff').font('Helvetica-Bold').text(data.company, 280, 480);

  doc.fillColor(textMuted).font('Helvetica');
  doc.text('Assessment Period:', 125, 505);
  doc.fillColor('#ffffff').font('Helvetica-Bold').text(data.scanTime, 280, 505);

  doc.fillColor(textMuted).font('Helvetica');
  doc.text('CISO Risk Index Score:', 125, 530);
  const score = data.report.riskScore;
  const level = score >= 75 ? 'CRITICAL' : score >= 50 ? 'HIGH' : score >= 25 ? 'MEDIUM' : 'LOW';
  doc.fillColor(score >= 50 ? '#ef4444' : '#f59e0b').font('Helvetica-Bold').text(`${level} (${score}/100)`, 280, 530);

  doc.fillColor(textMuted).font('Helvetica');
  doc.text('Report Auditor:', 125, 555);
  doc.fillColor('#ffffff').font('Helvetica-Bold').text('SentinelX Autonomous Agent', 280, 555);

  // Confidential Disclaimer
  doc.fillColor('#ef4444').fontSize(9).font('Helvetica-Bold').text('RESTRICTED CLASS 4 SPECIFICATION - PROHIBITED FOR EXTERNAL DISTRIBUTION', 100, doc.page.height - 80, { align: 'center', width: doc.page.width - 200 });

  // --- PAGE 2: EXECUTIVE POSTURE & DIAL ---
  doc.addPage();
  drawPageShell('Executive Posture Assessment');

  doc.fillColor('#1e293b').fontSize(18).font('Helvetica-Bold').text('1. CISO Executive Risk Index', 50, 90);
  doc.moveTo(50, 115).lineTo(doc.page.width - 50, 115).strokeColor('#cbd5e1').stroke();

  // Overall Score Gauge drawn Box
  doc.strokeColor(borderMuted).rect(50, 130, 180, 110).fill('#f8fafc').stroke();
  doc.fillColor('#475569').fontSize(10).font('Helvetica-Bold').text('RISK INDEX SCORE', 70, 150);
  doc.fillColor(score >= 50 ? '#ef4444' : '#f59e0b').fontSize(36).font('Helvetica-Bold').text(`${score}`, 70, 170);
  doc.fillColor('#64748b').fontSize(11).font('Helvetica').text('/100 Posture', 140, 195);
  doc.fillColor(score >= 50 ? '#ef4444' : '#22c55e').fontSize(10).font('Helvetica-Bold').text(`Posture Status: ${level}`, 70, 215);

  // Executive Summary text
  doc.fillColor('#334155').fontSize(11).font('Helvetica').text(data.report.attackSurfaceSummary, 250, 130, {
    width: doc.page.width - 300,
    align: 'justify',
    lineGap: 4
  });

  // Critical Findings
  doc.fillColor('#1e293b').fontSize(14).font('Helvetica-Bold').text('Immediate High-Priority Findings', 50, 280);
  doc.moveTo(50, 300).lineTo(doc.page.width - 50, 300).strokeColor('#e2e8f0').stroke();

  let findY = 315;
  data.report.criticalFindings.slice(0, 6).forEach((finding, idx) => {
    doc.fillColor('#ef4444').fontSize(10).font('Helvetica-Bold').text(`[Finding #${idx + 1}]`, 50, findY);
    doc.fillColor('#334155').fontSize(10).font('Helvetica').text(finding, 150, findY, { width: doc.page.width - 200 });
    findY += doc.heightOfString(finding, { width: doc.page.width - 200 }) + 10;
  });

  // --- PAGE 3: ASSETS & PORT EXPOSURES ---
  doc.addPage();
  drawPageShell('Attack Surface Map');

  doc.fillColor('#1e293b').fontSize(18).font('Helvetica-Bold').text('2. Exposed Surface Details', 50, 90);
  doc.moveTo(50, 115).lineTo(doc.page.width - 50, 115).strokeColor('#cbd5e1').stroke();

  // Attack Surface summary Grid box
  const gridY = 130;
  doc.strokeColor('#cbd5e1').rect(50, gridY, doc.page.width - 100, 70).fill('#f8fafc').stroke();
  
  doc.fillColor('#475569').fontSize(9).font('Helvetica-Bold').text('TOTAL TARGET ASSETS', 75, gridY + 18);
  doc.fillColor('#1e293b').fontSize(18).font('Helvetica-Bold').text(`${data.stats.totalAssets}`, 75, gridY + 32);

  doc.fillColor('#475569').fontSize(9).font('Helvetica-Bold').text('EXPOSED PORT PATHS', 230, gridY + 18);
  doc.fillColor('#1e293b').fontSize(18).font('Helvetica-Bold').text(`${data.stats.totalPorts}`, 230, gridY + 32);

  doc.fillColor('#475569').fontSize(9).font('Helvetica-Bold').text('TOTAL VULNERABILITIES', 385, gridY + 18);
  doc.fillColor('#1e293b').fontSize(18).font('Helvetica-Bold').text(`${data.stats.totalVulnerabilities}`, 385, gridY + 32);

  // Asset Inventory list
  doc.fillColor('#1e293b').fontSize(14).font('Helvetica-Bold').text('Discovered Assets Configuration Table', 50, 230);
  doc.moveTo(50, 250).lineTo(doc.page.width - 50, 250).strokeColor('#cbd5e1').stroke();

  let tblY = 265;
  doc.rect(50, tblY, doc.page.width - 100, 20).fill(secondaryBg);
  doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold').text('IP / HOSTNAME', 60, tblY + 6);
  doc.text('OPERATING SYSTEM', 220, tblY + 6);
  doc.text('VULNERABILITIES', 360, tblY + 6);
  doc.text('PORTS EXPOSED', 460, tblY + 6);

  tblY += 20;

  data.assets.slice(0, 12).forEach((asset) => {
    let portCount = 0;
    let vulnStr = '0 (Low Risk)';
    
    asset.scanHosts.forEach((sh: any) => portCount += sh.ports.length);
    let vCount = 0;
    asset.hosts.forEach((h: any) => {
      h.services.forEach((s: any) => {
        portCount++;
        vCount += s.vulnerabilities.length;
      });
    });

    if (vCount > 0) vulnStr = `${vCount} vulnerabilities`;

    doc.fillColor('#334155').fontSize(9).font('Helvetica').text(asset.hostname || asset.ipAddress, 60, tblY + 6);
    doc.text(asset.operatingSystem || 'Unknown Linux', 220, tblY + 6);
    doc.text(vulnStr, 360, tblY + 6);
    doc.text(`${portCount} active ports`, 460, tblY + 6);

    doc.moveTo(50, tblY + 22).lineTo(doc.page.width - 50, tblY + 22).strokeColor('#f1f5f9').stroke();
    tblY += 22;
  });

  // --- PAGE 4: ATTACK GRAPH PATH TIMELINE ---
  doc.addPage();
  drawPageShell('Attack Graphs Analysis');

  doc.fillColor('#1e293b').fontSize(18).font('Helvetica-Bold').text('3. Threat Modeling Attack Paths', 50, 90);
  doc.moveTo(50, 115).lineTo(doc.page.width - 50, 115).strokeColor('#cbd5e1').stroke();

  doc.fillColor('#475569').fontSize(11).font('Helvetica-Oblique').text('AI-correlated likely threat progression timeline sequence:', 50, 130);

  let pathY = 160;
  data.report.attackPathTimeline.forEach((item, index) => {
    // Stage title
    doc.strokeColor(accentColor).fill(accentColor).circle(60, pathY + 10, 8).fillAndStroke();
    doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold').text(`${index + 1}`, 57, pathY + 6);

    doc.fillColor('#1e293b').fontSize(11).font('Helvetica-Bold').text(`${item.stage}: ${item.title}`, 80, pathY);
    doc.fillColor('#475569').fontSize(10).font('Helvetica').text(item.description, 80, pathY + 18, { width: doc.page.width - 150 });

    pathY += doc.heightOfString(item.description, { width: doc.page.width - 150 }) + 30;
  });

  // --- PAGE 5: MITRE ATT&CK MAPPING ---
  doc.addPage();
  drawPageShell('MITRE ATT&CK Mapping');

  doc.fillColor('#1e293b').fontSize(18).font('Helvetica-Bold').text('4. MITRE ATT&CK Tactics Alignment', 50, 90);
  doc.moveTo(50, 115).lineTo(doc.page.width - 50, 115).strokeColor('#cbd5e1').stroke();

  let mitreY = 135;
  data.report.mitreMapping.slice(0, 5).forEach((mitre) => {
    doc.strokeColor('#cbd5e1').rect(50, mitreY, doc.page.width - 100, 75).fill('#f8fafc').stroke();

    doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text(`${mitre.tactic} > ${mitre.technique} (${mitre.cveId || 'CVE-N/A'})`, 60, mitreY + 8);
    doc.fillColor('#1e293b').fontSize(9).font('Helvetica-Bold').text('Vulnerability:', 60, mitreY + 22);
    doc.fillColor('#334155').font('Helvetica').text(mitre.vulnerabilityTitle, 130, mitreY + 22, { width: doc.page.width - 200 });

    doc.fillColor('#1e293b').fontSize(9).font('Helvetica-Bold').text('Detection:', 60, mitreY + 36);
    doc.fillColor('#334155').font('Helvetica').text(mitre.detection, 130, mitreY + 36, { width: doc.page.width - 200 });

    doc.fillColor('#1e293b').fontSize(9).font('Helvetica-Bold').text('Mitigation:', 60, mitreY + 50);
    doc.fillColor('#334155').font('Helvetica').text(mitre.mitigation, 130, mitreY + 50, { width: doc.page.width - 200 });

    mitreY += 88;
  });

  // --- PAGE 6: PATCH PRIORITIZATION ---
  doc.addPage();
  drawPageShell('Patch Prioritization Plan');

  doc.fillColor('#1e293b').fontSize(18).font('Helvetica-Bold').text('5. Prioritized Vulnerability Remediation Plan', 50, 90);
  doc.moveTo(50, 115).lineTo(doc.page.width - 50, 115).strokeColor('#cbd5e1').stroke();

  let patchY = 135;
  doc.rect(50, patchY, doc.page.width - 100, 20).fill(secondaryBg);
  doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold').text('CVE ID', 60, patchY + 6);
  doc.text('PRIORITY SCORE', 140, patchY + 6);
  doc.text('EFFORT', 250, patchY + 6);
  doc.text('DOWNTIME', 330, patchY + 6);
  doc.text('REMEDIATION ACTION', 400, patchY + 6);

  patchY += 20;

  data.report.patchPrioritization.slice(0, 8).forEach((item) => {
    doc.fillColor('#334155').fontSize(9).font('Helvetica').text(item.cveId || 'CVE-N/A', 60, patchY + 6);
    doc.fillColor(item.priorityScore >= 75 ? '#ef4444' : '#f59e0b').font('Helvetica-Bold').text(`${item.priorityScore} / 100`, 140, patchY + 6);
    doc.fillColor('#334155').font('Helvetica').text(item.patchEffort, 250, patchY + 6);
    doc.text(item.downtimeEstimate, 330, patchY + 6);
    doc.text(item.vulnerabilityTitle.substring(0, 30) + '...', 400, patchY + 6, { width: 150 });

    doc.moveTo(50, patchY + 22).lineTo(doc.page.width - 50, patchY + 22).strokeColor('#f1f5f9').stroke();
    patchY += 22;
  });

  // Detailed why comments block
  doc.fillColor('#1e293b').fontSize(12).font('Helvetica-Bold').text('Remediation Context Justifications', 50, patchY + 15);
  let justY = patchY + 35;
  data.report.patchPrioritization.slice(0, 3).forEach((item) => {
    doc.fillColor('#334155').fontSize(9.5).font('Helvetica-Bold').text(`• Why patch ${item.cveId || 'vulnerability'}:`, 50, justY);
    doc.fillColor('#475569').font('Helvetica').text(item.why, 150, justY, { width: doc.page.width - 200 });
    justY += doc.heightOfString(item.why, { width: doc.page.width - 200 }) + 10;
  });

  // --- PAGE 7: INCIDENT PLAYBOOK ---
  doc.addPage();
  drawPageShell('Incident Response Playbook');

  doc.fillColor('#1e293b').fontSize(18).font('Helvetica-Bold').text('6. Playbook & Recovery Framework', 50, 90);
  doc.moveTo(50, 115).lineTo(doc.page.width - 50, 115).strokeColor('#cbd5e1').stroke();

  // Containment, eradication, recovery lists
  let playY = 135;
  doc.fillColor('#1e293b').fontSize(12).font('Helvetica-Bold').text('Immediate Containment Plan', 50, playY);
  playY += 18;
  data.report.incidentPlaybook.containmentPlan.forEach((step) => {
    doc.fillColor('#334155').fontSize(9.5).font('Helvetica').text(`[ ] ${step}`, 60, playY, { width: doc.page.width - 110 });
    playY += doc.heightOfString(step, { width: doc.page.width - 110 }) + 6;
  });

  playY += 15;
  doc.fillColor('#1e293b').fontSize(12).font('Helvetica-Bold').text('Eradication & Mitigation Strategy', 50, playY);
  playY += 18;
  data.report.incidentPlaybook.eradicationPlan.forEach((step) => {
    doc.fillColor('#334155').fontSize(9.5).font('Helvetica').text(`[ ] ${step}`, 60, playY, { width: doc.page.width - 110 });
    playY += doc.heightOfString(step, { width: doc.page.width - 110 }) + 6;
  });

  playY += 15;
  doc.fillColor('#1e293b').fontSize(12).font('Helvetica-Bold').text('Systems Recovery Checklist', 50, playY);
  playY += 18;
  data.report.incidentPlaybook.recoveryPlan.forEach((step) => {
    doc.fillColor('#334155').fontSize(9.5).font('Helvetica').text(`[ ] ${step}`, 60, playY, { width: doc.page.width - 110 });
    playY += doc.heightOfString(step, { width: doc.page.width - 110 }) + 6;
  });

  // End document
  doc.end();
};
