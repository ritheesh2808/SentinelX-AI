import React, { useState } from 'react';

interface LiveScanTrackerProps {
  activeScan: { progress: number; stage: string; target: string } | null;
  onTriggerScan: (target: string) => Promise<void>;
  isTriggering: boolean;
}

export const LiveScanTracker: React.FC<LiveScanTrackerProps> = ({
  activeScan,
  onTriggerScan,
  isTriggering,
}) => {
  const [targetIp, setTargetIp] = useState('192.168.1.100');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetIp.trim()) return;
    onTriggerScan(targetIp.trim());
  };

  const getStageMessage = (stage: string) => {
    switch (stage) {
      case 'Initializing':
        return 'Booting Nmap scanners, validating targets...';
      case 'Host Discovery':
        return 'Pinging subnets, identifying active interfaces...';
      case 'Port Scan':
        return 'Scanning TCP/UDP ranges, checking banner scripts...';
      case 'Service Detection':
        return 'Fingerprinting running products, banners and system os...';
      case 'Vulnerability Detection':
        return 'Matching service indices to master CVE databases...';
      case 'AI Analysis':
        return 'Consulting Gemini model to assess risks and generate playbooks...';
      case 'Completed':
        return 'Scan successful. Context injected to database.';
      default:
        return 'Scanner in idle standby.';
    }
  };

  return (
    <div className="bg-[#131c2e] border border-[#1e293b] rounded-2xl p-6 shadow-xl">
      <h3 className="text-base font-semibold text-[#f8fafc] mb-2 flex items-center gap-2">
        <span>🌐</span> Live Vulnerability Scanner
      </h3>
      <p className="text-xs text-[#94a3b8] mb-6">
        Simulate a target network assessment to audit hosts, discover open ports, and generate risk vectors.
      </p>

      {!activeScan ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-[#94a3b8] uppercase tracking-wider mb-2">
              Target IP Address / Range
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={targetIp}
                onChange={(e) => setTargetIp(e.target.value)}
                placeholder="e.g. 192.168.1.100"
                disabled={isTriggering}
                className="flex-1 bg-[#0b0f19] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#f8fafc] focus:outline-none focus:border-emerald-500/50 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isTriggering || !targetIp.trim()}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-slate-950 font-semibold px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                {isTriggering ? 'Launching...' : 'Run Scan'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-[#94a3b8] block font-medium">Target: {activeScan.target}</span>
              <span className="text-sm font-semibold text-[#f8fafc] mt-1 block">
                {activeScan.stage}
              </span>
            </div>
            <span className="text-lg font-bold text-emerald-400">
              {activeScan.progress}%
            </span>
          </div>

          <div className="w-full bg-[#0b0f19] rounded-full h-2.5 overflow-hidden border border-[#1e293b]">
            <div
              className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500 shadow-[0_0_8px_#10b981]"
              style={{ width: `${activeScan.progress}%` }}
            />
          </div>

          <p className="text-xs text-[#94a3b8] italic">
            {getStageMessage(activeScan.stage)}
          </p>

          <div className="grid grid-cols-3 gap-2 pt-2 text-center">
            <div className="bg-[#0b0f19] p-2 rounded-lg border border-[#1e293b]">
              <span className="text-[10px] text-[#475569] block uppercase font-medium">Hosts</span>
              <span className="text-sm font-bold text-[#f8fafc] mt-0.5 block">
                {activeScan.progress >= 30 ? '1' : '0'}
              </span>
            </div>
            <div className="bg-[#0b0f19] p-2 rounded-lg border border-[#1e293b]">
              <span className="text-[10px] text-[#475569] block uppercase font-medium">Ports</span>
              <span className="text-sm font-bold text-[#f8fafc] mt-0.5 block">
                {activeScan.progress >= 50 ? '2' : '0'}
              </span>
            </div>
            <div className="bg-[#0b0f19] p-2 rounded-lg border border-[#1e293b]">
              <span className="text-[10px] text-[#475569] block uppercase font-medium">CVEs</span>
              <span className="text-sm font-bold text-[#f8fafc] mt-0.5 block">
                {activeScan.progress >= 85 ? '1' : '0'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
