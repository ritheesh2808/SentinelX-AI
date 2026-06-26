import React, { useState, useEffect } from 'react';
import * as aiService from '../../services/aiService';
import type { AISocAnalysis } from '../../types/ai';
import type { RiskTimelineItem } from '../../services/aiService';

export const SecurityGraphsPage: React.FC = () => {
  const [socData, setSocData] = useState<AISocAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [riskTimeline, setRiskTimeline] = useState<RiskTimelineItem[]>([]);

  const fetchSocReport = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [socAnalysis, timeline] = await Promise.all([
        aiService.getSocAnalysis(),
        aiService.getRiskTimeline().catch(() => []),
      ]);
      setSocData(socAnalysis);
      setRiskTimeline(timeline);
    } catch (err: any) {
      console.error('Failed to load SOC report:', err);
      setError(err?.response?.data?.error || 'Failed to generate SOC AI Analysis. Make sure you have imported XML scans.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSocReport();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#6366f1] border-t-transparent"></div>
        <p className="text-sm text-[#cbd5e1] animate-pulse">Drawing network topologies and mapping attack vectors...</p>
      </div>
    );
  }

  if (error || !socData) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center space-y-4 max-w-xl mx-auto my-12 text-left">
        <h2 className="text-base font-bold text-red-400">SOC Visualizer Offline</h2>
        <p className="text-sm text-[#cbd5e1]">{error || 'Could not compile correlation graphs.'}</p>
        <button
          onClick={fetchSocReport}
          className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-[#f8fafc] hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-[#6366f1]/10"
        >
          Retry Load
        </button>
      </div>
    );
  }

  const { report } = socData;

  // Build network graph positions dynamically
  const nodeSpacing = 80;
  const nodes = report.graphData?.nodes || [];
  const edges = report.graphData?.edges || [];

  // Group nodes by type to render them neatly in layers
  const attackerNode = nodes.find((n) => n.type === 'attacker') || { id: 'attacker', label: 'Attacker Source' };
  const assetNodes = nodes.filter((n) => n.type === 'asset' || n.type === 'host');
  const serviceNodes = nodes.filter((n) => n.type === 'service' || n.type === 'port');
  const vulnNodes = nodes.filter((n) => n.type === 'vulnerability' || n.type === 'vuln');
  const impactNodes = nodes.filter((n) => n.type === 'impact');

  // Compute layout coordinates
  const layoutNodes: Array<{ id: string; label: string; type: string; x: number; y: number }> = [];

  // Layer 1: Attacker (x = 80, y = center)
  const centerY = Math.max(assetNodes.length, serviceNodes.length, vulnNodes.length) * nodeSpacing / 2 + 100;
  layoutNodes.push({ ...attackerNode, type: 'attacker', x: 80, y: centerY });

  // Layer 2: Assets (x = 240, distributed vertically)
  assetNodes.forEach((node, idx) => {
    const y = centerY + (idx - (assetNodes.length - 1) / 2) * 160;
    layoutNodes.push({ ...node, x: 260, y });
  });

  // Layer 3: Services (x = 480, distributed vertically)
  serviceNodes.forEach((node, idx) => {
    const y = centerY + (idx - (serviceNodes.length - 1) / 2) * 120;
    layoutNodes.push({ ...node, x: 480, y });
  });

  // Layer 4: Vulnerabilities (x = 700, distributed vertically)
  vulnNodes.forEach((node, idx) => {
    const y = centerY + (idx - (vulnNodes.length - 1) / 2) * 110;
    layoutNodes.push({ ...node, x: 700, y });
  });

  // Layer 5: Impact / Exfiltration (x = 920)
  impactNodes.forEach((node, idx) => {
    const y = centerY + (idx - (impactNodes.length - 1) / 2) * 140;
    layoutNodes.push({ ...node, x: 920, y });
  });

  const getCoordinates = (id: string) => {
    const found = layoutNodes.find((n) => n.id === id);
    if (found) return { x: found.x, y: found.y };
    // fallback random positioning if mismatch
    return { x: 400, y: 300 };
  };

  return (
    <div className="space-y-8 text-left animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#f8fafc] mb-1">SOC Threat Graphs</h1>
        <p className="text-sm text-[#94a3b8]">Interactive visual models of attack surfaces, compromised nodes, and lateral paths.</p>
      </div>

      {/* Network Topology Graph Card */}
      <div className="bg-[#131c2e] border border-[#1e293b] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#cbd5e1]">Autonomous Attack Surface Graph</h3>
          <span className="text-[10px] bg-[#6366f1]/10 text-[#6366f1] border border-[#6366f1]/20 font-bold px-2 py-0.5 rounded">Live Map</span>
        </div>

        {/* SVG Topology Wrapper */}
        <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-[#1e293b]">
          <div className="min-w-[1000px] h-[550px] relative bg-[#0b0f19] border border-[#1e293b]/60 rounded-xl overflow-hidden">
            <svg className="w-full h-full">
              {/* Defs for gradients & path arrows */}
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="15" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#334155" />
                </marker>
                <marker id="flow-arrow" viewBox="0 0 10 10" refX="15" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#6366f1" />
                </marker>
              </defs>

              {/* Draw Edges */}
              {edges.map((edge, idx) => {
                const fromCoord = getCoordinates(edge.from);
                const toCoord = getCoordinates(edge.to);
                const isThreat = edge.from === 'attacker' || edge.to === 'attacker' || edge.label.toLowerCase().includes('compromise') || edge.label.toLowerCase().includes('exploit');
                return (
                  <g key={idx}>
                    <line
                      x1={fromCoord.x}
                      y1={fromCoord.y}
                      x2={toCoord.x}
                      y2={toCoord.y}
                      stroke={isThreat ? '#6366f1' : '#334155'}
                      strokeWidth={isThreat ? '2' : '1.2'}
                      strokeDasharray={isThreat ? '5,5' : 'none'}
                      className={isThreat ? 'animate-[dash_10s_linear_infinite]' : ''}
                      markerEnd={isThreat ? 'url(#flow-arrow)' : 'url(#arrow)'}
                    />
                    {/* Edge Label */}
                    <text
                      x={(fromCoord.x + toCoord.x) / 2}
                      y={(fromCoord.y + toCoord.y) / 2 - 6}
                      fill={isThreat ? '#a855f7' : '#94a3b8'}
                      fontSize="9"
                      textAnchor="middle"
                      className="font-mono bg-[#0b0f19] px-1"
                    >
                      {edge.label}
                    </text>
                  </g>
                );
              })}

              {/* Draw Nodes */}
              {layoutNodes.map((node) => {
                const color = node.type === 'attacker'
                  ? 'fill-red-500/20 stroke-red-500'
                  : node.type === 'asset'
                  ? 'fill-[#6366f1]/20 stroke-[#6366f1]'
                  : node.type === 'service'
                  ? 'fill-[#a855f7]/20 stroke-[#a855f7]'
                  : node.type === 'vulnerability'
                  ? 'fill-orange-500/20 stroke-orange-500'
                  : 'fill-emerald-500/20 stroke-emerald-500';

                return (
                  <g key={node.id} className="group cursor-pointer">
                    <circle cx={node.x} cy={node.y} r="20" className={`${color} stroke-2 transition-all duration-300 group-hover:scale-110`} />
                    {/* Node Icons / Labels */}
                    <text x={node.x} y={node.y + 35} fill="#f8fafc" fontSize="10" fontWeight="bold" textAnchor="middle" className="pointer-events-none">
                      {node.label.length > 20 ? node.label.substring(0, 18) + '...' : node.label}
                    </text>
                    <text x={node.x} y={node.y + 48} fill="#94a3b8" fontSize="8" textAnchor="middle" className="uppercase tracking-wider pointer-events-none font-mono">
                      {node.type}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Visual Attack Timeline timeline vector */}
        <div className="bg-[#131c2e] border border-[#1e293b] rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#cbd5e1] border-b border-[#1e293b] pb-2">Attack Path Timeline Flow</h3>
          <div className="space-y-6 relative pl-6 border-l border-[#334155]/30">
            {report.attackPathTimeline.map((item, idx) => (
              <div key={idx} className="relative">
                <span className="absolute -left-[33px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-[#6366f1] text-[#f8fafc] text-xs font-bold shadow-lg">
                  {idx + 1}
                </span>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-[#a855f7] uppercase tracking-wider">{item.stage}</span>
                  <h4 className="text-sm font-bold text-[#f8fafc]">{item.title}</h4>
                  <p className="text-xs text-[#94a3b8] leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Heatmap Matrix Card */}
        <div className="bg-[#131c2e] border border-[#1e293b] rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#cbd5e1] border-b border-[#1e293b] pb-2">Vulnerability Risk Matrix Heatmap</h3>
          
          <div className="space-y-4">
            {/* Heatmap Grid */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold">
              <div className="col-span-1"></div>
              <div className="text-emerald-400">Low Impact</div>
              <div className="text-amber-400">Medium Impact</div>
              <div className="text-red-400">High Impact</div>

              {/* Rows */}
              <div className="text-[#94a3b8] flex items-center justify-end pr-2">High Likelihood</div>
              <div className="h-16 bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center rounded-lg">Medium</div>
              <div className="h-16 bg-orange-500/20 border border-orange-500/30 text-orange-400 flex items-center justify-center rounded-lg">High</div>
              <div className="h-16 bg-red-500/30 border border-red-500/40 text-red-400 flex items-center justify-center rounded-lg font-black animate-pulse">Critical</div>

              <div className="text-[#94a3b8] flex items-center justify-end pr-2">Med Likelihood</div>
              <div className="h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center rounded-lg">Low</div>
              <div className="h-16 bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center rounded-lg">Medium</div>
              <div className="h-16 bg-orange-500/20 border border-orange-500/30 text-orange-400 flex items-center justify-center rounded-lg">High</div>

              <div className="text-[#94a3b8] flex items-center justify-end pr-2">Low Likelihood</div>
              <div className="h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center rounded-lg">Low</div>
              <div className="h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center rounded-lg">Low</div>
              <div className="h-16 bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center rounded-lg">Medium</div>
            </div>

            <div className="text-[10px] text-[#cbd5e1] leading-relaxed italic bg-[#0b0f19] p-3 rounded-lg border border-[#1e293b]">
              Note: Visual plotting calculates CVE exploit availability metrics against ports to determine attack likelihood percentages.
            </div>
          </div>
        </div>
      </div>

      {/* Risk Timeline SVG Area Chart */}
      {riskTimeline.length > 0 && (
        <div className="bg-[#131c2e] border border-[#1e293b] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#cbd5e1]">
              6-Month Risk Score Trend
            </h3>
            <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 font-bold px-2 py-0.5 rounded">
              LIVE DATA
            </span>
          </div>

          <div className="w-full overflow-x-auto">
            {(() => {
              const W = 800;
              const H = 200;
              const PAD = { top: 20, right: 30, bottom: 40, left: 50 };
              const chartW = W - PAD.left - PAD.right;
              const chartH = H - PAD.top - PAD.bottom;
              const maxRisk = Math.max(...riskTimeline.map((d) => d.riskScore), 100);
              const scaleX = (i: number) => PAD.left + (i / (riskTimeline.length - 1)) * chartW;
              const scaleY = (v: number) => PAD.top + chartH - (v / maxRisk) * chartH;

              const points = riskTimeline.map((d, i) => `${scaleX(i)},${scaleY(d.riskScore)}`).join(' ');
              const areaPath = `M ${scaleX(0)},${scaleY(riskTimeline[0].riskScore)} ` +
                riskTimeline.slice(1).map((d, i) => `L ${scaleX(i + 1)},${scaleY(d.riskScore)}`).join(' ') +
                ` L ${scaleX(riskTimeline.length - 1)},${PAD.top + chartH} L ${scaleX(0)},${PAD.top + chartH} Z`;

              return (
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>

                  {/* Grid lines */}
                  {[0, 25, 50, 75, 100].map((v) => (
                    <g key={v}>
                      <line
                        x1={PAD.left} y1={scaleY(v)}
                        x2={PAD.left + chartW} y2={scaleY(v)}
                        stroke="#1e293b" strokeWidth="1" strokeDasharray="4,4"
                      />
                      <text x={PAD.left - 6} y={scaleY(v) + 4} fill="#475569" fontSize="9" textAnchor="end">
                        {v}
                      </text>
                    </g>
                  ))}

                  {/* Area fill */}
                  <path d={areaPath} fill="url(#riskGrad)" />

                  {/* Line */}
                  <polyline
                    points={points}
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />

                  {/* Data points */}
                  {riskTimeline.map((d, i) => (
                    <g key={i}>
                      <circle
                        cx={scaleX(i)} cy={scaleY(d.riskScore)} r="4"
                        fill="#6366f1" stroke="#0b0f19" strokeWidth="2"
                      />
                      <text
                        x={scaleX(i)} y={scaleY(d.riskScore) - 10}
                        fill="#f8fafc" fontSize="10" textAnchor="middle" fontWeight="bold"
                      >
                        {d.riskScore}
                      </text>
                      <text
                        x={scaleX(i)} y={PAD.top + chartH + 16}
                        fill="#64748b" fontSize="10" textAnchor="middle"
                      >
                        {d.month}
                      </text>
                    </g>
                  ))}
                </svg>
              );
            })()}
          </div>

          {/* Mini legend */}
          <div className="flex gap-4 pt-2">
            {[
              { color: 'bg-red-500', label: `Critical Findings: ${riskTimeline.at(-1)?.criticalFindings ?? 0}` },
              { color: 'bg-[#6366f1]', label: `Current Risk Score: ${riskTimeline.at(-1)?.riskScore ?? 0}` },
              { color: 'bg-amber-400', label: `Open CVEs: ${riskTimeline.at(-1)?.cves ?? 0}` },
              { color: 'bg-emerald-400', label: `Open Ports: ${riskTimeline.at(-1)?.openPorts ?? 0}` },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${item.color}`} />
                <span className="text-[10px] text-slate-400">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityGraphsPage;
