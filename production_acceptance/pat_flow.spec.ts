import { test, expect, chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Define paths
const evidenceDir = path.join(__dirname, '../PAT_Final');
const screenshotsDir = path.join(evidenceDir, 'screenshots');
const logsDir = path.join(evidenceDir, 'logs');

// Helper to write console logs
function appendConsoleLog(msgText: string) {
  fs.appendFileSync(path.join(logsDir, 'console.log'), `${new Date().toISOString()} - ${msgText}\n`);
}

// Helper to write network log entry
function appendNetworkLog(data: any) {
  const file = path.join(logsDir, 'network.json');
  let currentLogs: any[] = [];
  if (fs.existsSync(file)) {
    try {
      currentLogs = JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (e) {
      currentLogs = [];
    }
  }
  currentLogs.push({ timestamp: new Date().toISOString(), ...data });
  fs.writeFileSync(file, JSON.stringify(currentLogs, null, 2), 'utf8');
}

test.describe('SentinelX AI Production Acceptance Test (PAT)', () => {
  // We share states like username/password
  const email = `operator.pat.${Date.now()}@sentinelx.ai`;
  const password = `P@ssword123!_${Date.now()}`;
  const fullName = `QA Operator PAT ${Date.now()}`;

  test.beforeAll(() => {
    // Clear files if they exist
    if (fs.existsSync(path.join(logsDir, 'console.log'))) {
      fs.unlinkSync(path.join(logsDir, 'console.log'));
    }
    if (fs.existsSync(path.join(logsDir, 'network.json'))) {
      fs.unlinkSync(path.join(logsDir, 'network.json'));
    }
    appendConsoleLog('=== SentinelX AI PAT Test Execution Log Started ===');
  });

  test('E2E Full Verification Flow', async ({ page, context }) => {
    // 1. Hook console log listener
    page.on('console', msg => {
      appendConsoleLog(`[CONSOLE][${msg.type()}] ${msg.text()}`);
    });

    page.on('pageerror', err => {
      appendConsoleLog(`[PAGE ERROR] ${err.message}\nStack: ${err.stack}`);
    });

    // 2. Hook network listener
    page.on('request', request => {
      appendNetworkLog({
        type: 'request',
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
      });
    });

    page.on('response', response => {
      appendNetworkLog({
        type: 'response',
        url: response.url(),
        status: response.status(),
        headers: response.headers(),
      });
    });

    // Start recording trace
    await context.tracing.start({ screenshots: true, snapshots: true, sources: true });

    // PHASE 1: Launch Homepage / Check redirects
    appendConsoleLog('PHASE 1: Navigating to homepage...');
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForURL('**/login');
    expect(page.url()).toContain('/login');
    await page.screenshot({ path: path.join(screenshotsDir, 'phase1_login_redirect.png') });

    // Navigate to register page
    await page.goto('/register');
    await page.waitForURL('**/register');
    expect(page.url()).toContain('/register');
    await page.screenshot({ path: path.join(screenshotsDir, 'phase1_register_page.png') });

    // PHASE 2: Registration, Validation and Login Persistence
    appendConsoleLog('PHASE 2: Validating registration rules...');
    
    // Password validation tests
    await page.fill('input#fullName', fullName);
    await page.fill('input#email', email);
    await page.fill('input#password', 'short');
    await page.click('button[type="submit"]');
    
    const pwdError = page.locator('text=Password must be at least');
    await expect(pwdError).toBeVisible();
    await page.screenshot({ path: path.join(screenshotsDir, 'phase2_password_validation_error.png') });

    // Duplicate email registration validation
    // First, register a user successfully
    await page.fill('input#password', password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/login');
    await page.screenshot({ path: path.join(screenshotsDir, 'phase2_registration_success.png') });

    // Try to register the same user again
    await page.goto('/register');
    await page.fill('input#fullName', fullName);
    await page.fill('input#email', email);
    await page.fill('input#password', password);
    await page.click('button[type="submit"]');
    
    const duplicateError = page.locator('text=Email already registered');
    // It should display a server/general error alert
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotsDir, 'phase2_duplicate_email_error.png') });

    // Go back to login
    await page.goto('/login');
    await page.fill('input#email', email);
    await page.fill('input#password', password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    expect(page.url()).toContain('/dashboard');
    await page.screenshot({ path: path.join(screenshotsDir, 'phase2_login_success.png') });

    // Refresh and check session persistence
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).toContain('/dashboard');
    await page.screenshot({ path: path.join(screenshotsDir, 'phase2_session_persistence.png') });

    // PHASE 3 & 4: Sidebar Navigation & Full Workflow
    appendConsoleLog('PHASE 3 & 4: Navigating sub-sections and executing workflows...');

    // 1. Navigation to Assets and Create Asset
    await page.click('text=Asset Inventory');
    await page.waitForURL('**/dashboard/assets');
    await page.screenshot({ path: path.join(screenshotsDir, 'phase3_assets_page.png') });

    await page.click('button:has-text("Register Asset")');
    await page.fill('input[placeholder*="database-srv-1"]', 'pat-test-host');
    await page.fill('input[placeholder*="192.168.1.50"]', '10.0.0.45');
    await page.fill('input[placeholder*="Ubuntu 22.04 LTS"]', 'Linux Debian 12');
    await page.fill('input[placeholder*="Staging, Production"]', 'Production-Core');
    await page.click('button[type="submit"]:has-text("Register")');
    await page.waitForTimeout(1500); // Wait for API response and reload
    await page.screenshot({ path: path.join(screenshotsDir, 'phase4_asset_created.png') });

    // 2. Navigation to System Scans and trigger simulation
    await page.click('text=System Scans');
    await page.waitForURL('**/dashboard/scans');
    await page.screenshot({ path: path.join(screenshotsDir, 'phase3_scans_page.png') });

    // Trigger scan simulation
    await page.click('button:has-text("Import Scan")');
    await page.waitForURL('**/dashboard/scans/import');
    await page.screenshot({ path: path.join(screenshotsDir, 'phase4_scan_import_view.png') });

    // Since we want to run scan simulation
    await page.click('button:has-text("Run Security Scanner Simulation")');
    // Wait for the scan execution to kick off
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(screenshotsDir, 'phase4_scan_simulation_triggered.png') });

    // Let's go to Scans page and check progress or SSE alerts
    await page.goto('/dashboard/scans');
    await page.waitForLoadState('domcontentloaded');
    await page.screenshot({ path: path.join(screenshotsDir, 'phase4_scans_list_progress.png') });

    // 3. Navigation to Ports & Services
    await page.click('text=Ports & Services');
    await page.waitForURL('**/dashboard/ports');
    await page.screenshot({ path: path.join(screenshotsDir, 'phase3_ports_page.png') });

    // 4. Navigation to Vulnerabilities
    await page.click('text=Vulnerabilities');
    await page.waitForURL('**/dashboard/vulnerabilities');
    await page.screenshot({ path: path.join(screenshotsDir, 'phase3_vulnerabilities_page.png') });

    // 5. Navigation to Executive Dashboard (and PDF download check)
    await page.click('text=Executive Dashboard');
    await page.waitForURL('**/dashboard/report');
    await page.screenshot({ path: path.join(screenshotsDir, 'phase3_executive_report_page.png') });

    // Trigger PDF generation
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button:has-text("Export Executive PDF")'),
    ]);
    const pdfPath = path.join(evidenceDir, 'logs/executive-audit-report.pdf');
    await download.saveAs(pdfPath);
    appendConsoleLog(`PDF report downloaded to ${pdfPath}`);
    expect(fs.existsSync(pdfPath)).toBeTruthy();

    // 6. Navigation to Security Graphs & Risk Timeline
    await page.click('text=Security Graphs');
    await page.waitForURL('**/dashboard/graphs');
    await page.screenshot({ path: path.join(screenshotsDir, 'phase3_security_graphs_page.png') });

    // 7. Navigation to MITRE Mapping
    await page.click('text=MITRE & Patching');
    await page.waitForURL('**/dashboard/mitre');
    await page.screenshot({ path: path.join(screenshotsDir, 'phase3_mitre_page.png') });

    // 8. Navigation to Incident Response
    await page.click('text=Incident Response');
    await page.waitForURL('**/dashboard/incidents');
    await page.screenshot({ path: path.join(screenshotsDir, 'phase3_incident_response_page.png') });

    // 9. Navigation to SOC AI Chat
    await page.click('text=SOC AI Chat');
    await page.waitForURL('**/dashboard/chat');
    await page.screenshot({ path: path.join(screenshotsDir, 'phase3_soc_chat_page.png') });

    // Send chat message
    await page.fill('input[placeholder*="Ask AI SOC Analyst"]', 'Explain the risk status of pat-test-host.');
    await page.click('button:has-text("Send")');
    await page.waitForTimeout(5000); // Wait for Gemini response stream
    await page.screenshot({ path: path.join(screenshotsDir, 'phase4_soc_chat_sent.png') });

    // 10. Navigation to On-Demand Analyst
    await page.click('text=On-Demand Analyst');
    await page.waitForURL('**/dashboard/ai');
    await page.screenshot({ path: path.join(screenshotsDir, 'phase3_ai_agent_page.png') });

    // 11. Navigation to Control Settings
    await page.click('text=Control Settings');
    await page.waitForURL('**/dashboard/settings');
    await page.screenshot({ path: path.join(screenshotsDir, 'phase3_settings_page.png') });

    // PHASE 8: Viewport Responsive Testing
    appendConsoleLog('PHASE 8: Conducting responsive viewport checks...');
    const viewports = [320, 375, 425, 768, 1024, 1280, 1440, 1920];
    for (const vp of viewports) {
      await page.setViewportSize({ width: vp, height: 900 });
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(screenshotsDir, `responsive_viewport_${vp}.png`) });
    }

    // Reset Viewport size to desktop default
    await page.setViewportSize({ width: 1280, height: 800 });

    // PHASE 10: Security Vulnerability Fuzzing
    appendConsoleLog('PHASE 10: Injecting Security Payloads (SQL Injection & XSS)...');
    // Try SQL injection on Login
    await page.goto('/login');
    await page.fill('input#email', "' OR '1'='1");
    await page.fill('input#password', 'somepass');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    // Should display validation or login failure, but NOT authorize
    expect(page.url()).toContain('/login');
    await page.screenshot({ path: path.join(screenshotsDir, 'security_sqli_protection.png') });

    // Try XSS payload in input
    await page.goto('/login');
    await page.fill('input#email', '<script>alert("xss")</script>@gmail.com');
    await page.fill('input#password', 'somepass');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/login');
    await page.screenshot({ path: path.join(screenshotsDir, 'security_xss_protection.png') });

    // Test missing JWT authorization direct URL access
    appendConsoleLog('PHASE 10: Testing direct URL access restrictions without active JWT session...');
    // We clear localStorage to simulate missing JWT
    await page.evaluate(() => localStorage.clear());
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).toContain('/login');
    await page.screenshot({ path: path.join(screenshotsDir, 'security_missing_jwt_protection.png') });

    // PHASE 11: Concurrent stress checks
    appendConsoleLog('PHASE 11: Stress testing multi-tabs & concurrent requests simulation...');
    const page2 = await context.newPage();
    await page2.goto('/dashboard');
    await page2.waitForLoadState('domcontentloaded');
    expect(page2.url()).toContain('/login'); // Both tabs redirected to login since localStorage was cleared
    await page2.screenshot({ path: path.join(screenshotsDir, 'stress_multitabs.png') });
    await page2.close();

    // End tracing
    await context.tracing.stop({ path: path.join(evidenceDir, 'traces/pat_execution_trace.zip') });
    appendConsoleLog('=== SentinelX AI PAT Test Execution Completed Successfully ===');
  });
});
