import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Users, 
  CreditCard, 
  Server, 
  X, 
  Activity, 
  Bot, 
  Ban, 
  CheckCircle2, 
  Clock
} from 'lucide-react';
import { ReportItem } from '../types';

interface AdminPanelViewProps {
  reports: ReportItem[];
  onTakeAction: (reportId: string, actionType: 'ban' | 'warn' | 'delete') => void;
  onDismissReport: (reportId: string) => void;
}

export const AdminPanelView: React.FC<AdminPanelViewProps> = ({
  reports,
  onTakeAction,
  onDismissReport,
}) => {
  const [activeTab, setActiveTab] = useState<'moderation' | 'health'>('moderation');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'action_taken' | 'dismissed'>('all');

  const filteredReports = reports.filter(r => 
    selectedFilter === 'all' ? true : r.status === selectedFilter
  );

  const stats = [
    { label: 'Validated Society Patrons', value: '4,850', change: '+8.4% this quarter', icon: Users },
    { label: 'Treasury Retainage (MRR)', value: '€248,500', change: 'Vault fees & dues', icon: CreditCard },
    { label: 'Encrypted Salon Sockets', value: '1,240', change: 'Zero plaintext trace', icon: Activity },
    { label: 'Automated Discretion Gate', value: '99.8%', change: 'Private Vision & NLP', icon: Bot },
  ];

  const systemServices = [
    { name: 'Encrypted Edge Gateway (Kong TLS 1.3)', status: 'Optimal', latency: '4ms', load: '18% Capacity' },
    { name: 'Dossier Ledger (PostgreSQL Isolated Nodes)', status: 'Encrypted', latency: '2ms', load: 'Zero-Leak Shards' },
    { name: 'Ephemeral Memory Pool (Volatile Redis Cluster)', status: 'Optimal', latency: '1ms', load: 'Auto-Purge Ready' },
    { name: 'Private Event Bus (Kafka Confidential Enclave)', status: 'Clear', latency: '3ms', load: '0 Queue Lag' },
    { name: 'Semantic Registry Search (Elastic Cluster)', status: 'Synchronized', latency: '9ms', load: 'Encrypted Index' },
    { name: 'Vision Discretion & NSFW Shield', status: 'Armed', latency: '38ms', load: 'Dedicated Inference GPU' },
  ];

  return (
    <div className="space-y-6 text-zinc-200">
      {/* Header Banner */}
      <div className="rounded-2xl bg-[#0C0D11] p-6 sm:p-8 border border-white/[0.12] shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181B22] border border-[#E5C590]/30 text-[#E5C590] text-xs font-mono uppercase tracking-[0.16em]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>High Curatorship Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif text-white tracking-wide font-normal">
            Society Governance & Discretion Oversight
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-sans max-w-2xl leading-relaxed">
            Review decorum infractions, audit cryptographic notary pipelines, inspect vault settlements, and ensure compliance with Maison Noir covenants.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-[#121419] p-1 rounded-full flex items-center gap-1 border border-white/[0.08] shrink-0">
          <button
            onClick={() => setActiveTab('moderation')}
            className={`px-4 py-2 rounded-full text-xs font-serif uppercase tracking-[0.12em] transition-all cursor-pointer ${
              activeTab === 'moderation'
                ? 'bg-[#E5C590] text-black font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Decorum Queue
          </button>
          <button
            onClick={() => setActiveTab('health')}
            className={`px-4 py-2 rounded-full text-xs font-serif uppercase tracking-[0.12em] transition-all cursor-pointer ${
              activeTab === 'health'
                ? 'bg-[#E5C590] text-black font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Infrastructure
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-[#0C0D11] border border-white/[0.08] rounded-2xl p-5 shadow-xs space-y-2.5"
            >
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-sans">{s.label}</span>
                <Icon className="w-4 h-4 text-[#E5C590]" />
              </div>
              <div className="text-2xl font-serif text-white font-light">
                {s.value}
              </div>
              <div className="text-[11px] font-mono text-[#E5C590]/90">
                {s.change}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Tab Content */}
      {activeTab === 'moderation' ? (
        <div className="bg-[#0C0D11] border border-white/[0.08] rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-serif text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#E5C590]" />
                <span>Pending Decorum & Discretion Audits</span>
              </h2>
              <p className="text-xs text-zinc-400 font-sans mt-0.5">
                Incidents flagged by members or quarantined by automated confidential filters.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-[#121419] p-1 rounded-full border border-white/[0.06] text-xs">
              {(['all', 'pending', 'action_taken', 'dismissed'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setSelectedFilter(f)}
                  className={`px-3 py-1 rounded-full font-serif uppercase tracking-[0.1em] text-[11px] transition-all cursor-pointer ${
                    selectedFilter === f
                      ? 'bg-[#181B22] text-[#E5C590] border border-[#E5C590]/30 shadow-xs'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {f === 'all' && 'All'}
                  {f === 'pending' && 'Pending'}
                  {f === 'action_taken' && 'Sanctioned'}
                  {f === 'dismissed' && 'Pardoned'}
                </button>
              ))}
            </div>
          </div>

          {/* Reports Table / Card List */}
          <div className="space-y-3.5 divide-y divide-white/[0.06]">
            {filteredReports.map(report => (
              <div
                key={report.id}
                className="pt-4 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#181B22] text-[#E5C590] border border-[#E5C590]/30 font-mono text-[11px]">
                      {report.reason}
                    </span>
                    <span className="font-serif text-sm text-white">
                      {report.targetTitle}
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">
                      (Reported by @{report.reporterName})
                    </span>
                  </div>

                  {/* AI Risk Score Pill */}
                  <div className="flex items-center gap-2.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono border flex items-center gap-1.5 ${
                      report.aiRiskScore > 90
                        ? 'bg-rose-950/40 text-rose-300 border-rose-500/30'
                        : 'bg-[#181B22] text-[#E5C590] border-[#E5C590]/30'
                    }`}>
                      <Bot className="w-3.5 h-3.5" />
                      <span>Confidence: {report.aiRiskScore}%</span>
                    </span>
                    <span className="text-[11px] text-zinc-500 font-mono">{report.createdAt}</span>
                  </div>
                </div>

                <div className="bg-[#121419] p-3.5 rounded-xl space-y-1.5 text-xs text-zinc-300 border border-white/[0.06] font-sans">
                  <p><strong className="text-zinc-400">Patron Observation:</strong> {report.description}</p>
                  <p className="text-[#E5C590]">
                    <strong>Curatorial Filter Analysis:</strong> {report.aiFlagReason}
                  </p>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    {report.status === 'pending' && (
                      <span className="text-[11px] text-[#E5C590] font-mono flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Awaiting Curator Verdict
                      </span>
                    )}
                    {report.status === 'action_taken' && (
                      <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Credentials Revoked / Post Quarantined
                      </span>
                    )}
                    {report.status === 'dismissed' && (
                      <span className="text-[11px] text-zinc-500 font-mono flex items-center gap-1.5">
                        <X className="w-3.5 h-3.5" />
                        Report Dismissed as Unfounded
                      </span>
                    )}
                  </div>

                  {report.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onTakeAction(report.id, 'ban')}
                        className="px-3.5 py-1.5 rounded-full text-xs font-serif uppercase tracking-[0.1em] bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Ban className="w-3 h-3" />
                        <span>Excommunicate / Purge</span>
                      </button>
                      <button
                        onClick={() => onDismissReport(report.id)}
                        className="px-3.5 py-1.5 rounded-full text-xs font-serif uppercase tracking-[0.1em] bg-[#181B22] border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                      >
                        Pardon
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Health & Infrastructure Monitör */
        <div className="bg-[#0C0D11] border border-white/[0.08] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-serif text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-[#E5C590]" />
              <span>Confidential Microservice Health & Zero-Log Mesh</span>
            </h2>
            <span className="text-xs text-[#E5C590] font-mono bg-[#181B22] px-3 py-1 rounded-full border border-[#E5C590]/30">
              99.99% Availability
            </span>
          </div>

          <div className="space-y-2.5">
            {systemServices.map(srv => (
              <div
                key={srv.name}
                className="p-3.5 rounded-xl bg-[#121419] border border-white/[0.06] flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-serif text-white">
                    {srv.name}
                  </div>
                  <div className="text-[11px] text-zinc-400 font-mono">
                    {srv.load}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <span className="text-[11px] text-zinc-400 font-mono">
                    {srv.latency}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[10px] flex items-center gap-1.5 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {srv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
