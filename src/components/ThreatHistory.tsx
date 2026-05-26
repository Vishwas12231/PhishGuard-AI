import React, { useState } from 'react';
import { Search, Mail, Globe, Image as ImageIcon, Trash2, Download, Printer, ShieldCheck, ShieldAlert, AlertTriangle, ExternalLink, Calendar, FileText } from 'lucide-react';
import { ScanReport } from '../types';
import { jsPDF } from 'jspdf';

interface ThreatHistoryProps {
  reports: ScanReport[];
  loading: boolean;
  onDeleteReport: (id: string) => void;
  onSelectScan: (report: ScanReport) => void;
  token: string | null;
}

export default function ThreatHistory({ reports, loading, onDeleteReport, onSelectScan, token }: ThreatHistoryProps) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'email' | 'url' | 'image'>('all');

  // Filter computation
  const filtered = reports.filter(r => {
    const matchesSearch = 
      (r.type?.toLowerCase().includes(search.toLowerCase())) ||
      (r.result?.threatLevel?.toLowerCase().includes(search.toLowerCase())) ||
      (r.result?.explanation?.toLowerCase().includes(search.toLowerCase())) ||
      // Input details search
      (r.inputData?.senderEmail?.toLowerCase().includes(search.toLowerCase())) ||
      (r.inputData?.url?.toLowerCase().includes(search.toLowerCase())) ||
      (r.inputData?.fileName?.toLowerCase().includes(search.toLowerCase())) ||
      (r.inputData?.subject?.toLowerCase().includes(search.toLowerCase()));

    const matchesType = filterType === 'all' || r.type === filterType;

    return matchesSearch && matchesType;
  });

  const downloadJSON = (report: ScanReport) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `phishguard_threat_report_${report.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const generatePDFReport = (report: ScanReport) => {
    try {
      const doc = new jsPDF();
      
      // Page styling helper variables
      const margin = 15;
      const width = 210;
      const maxLineWidth = width - (margin * 2); // 180mm
      let y = 20;

      // Color Palette Definition
      const brandColor = [15, 23, 42]; // Slate 900
      let statusColor = [5, 150, 105]; // Emerald (Safe)
      if (report.result?.threatLevel === 'Dangerous') {
        statusColor = [190, 18, 60]; // Rose (Dangerous)
      } else if (report.result?.threatLevel === 'Suspicious') {
        statusColor = [217, 119, 6]; // Amber (Suspicious)
      }

      // Title header band
      doc.setFillColor(brandColor[0], brandColor[1], brandColor[2]);
      doc.rect(0, 0, width, 40, 'F');

      // Title & Branding Text inside band
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('PHISHGUARD SECURITY', margin, 18);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184); // Slate 400
      doc.text('AUTOMATED CYBER THREAT AUDIT DETAILED BRIEF', margin, 25);
      
      doc.setFont('courier', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.text(`REPORT ID: #${report.id}`, width - margin - 50, 21, { align: 'right' });

      // Move Y position below header band
      y = 52;

      // General Audit Info
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
      doc.text('AUDIT CLASSIFICATION', margin, y);
      
      // Horizontal separator rule
      y += 3;
      doc.setDrawColor(226, 232, 240); // Slate 200
      doc.setLineWidth(0.5);
      doc.line(margin, y, width - margin, y);
      y += 8;

      // Threat Classification block details
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(100, 116, 139); // Slate 500
      doc.text('Threat Category:', margin, y);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.text(`${report.result?.threatLevel || 'Safe'}`, margin + 35, y);

      // Score bubble outline / drawing
      doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
      // Small rectangle with threat score
      doc.rect(width - margin - 45, y - 6, 45, 10, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text(`SCORE: ${report.result?.threatScore || 0}/100`, width - margin - 22.5, y, { align: 'center' });

      y += 10;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(100, 116, 139); // Slate 500
      doc.text('Scan Datetime:', margin, y);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(51, 65, 85); // Slate 700
      doc.text(`${new Date(report.createdAt).toLocaleString()}`, margin + 35, y);

      y += 15;

      const currentTargetLabel = report.type === 'email' 
        ? 'Verified Inbound Email Address' 
        : report.type === 'url' 
          ? 'Verified Link Target Address' 
          : 'Screenshot File Identity';

      const currentTargetValue = report.type === 'email' 
        ? report.inputData.senderEmail 
        : report.type === 'url' 
          ? report.inputData.url 
          : report.inputData.fileName;

      // Target Metadata Section
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
      doc.text('TARGET CRITERIA', margin, y);
      
      y += 3;
      doc.setDrawColor(226, 232, 240); // Slate 200
      doc.line(margin, y, width - margin, y);
      y += 8;

      // Draw light gray info background card
      doc.setFillColor(248, 250, 252); // Slate 50
      doc.setDrawColor(241, 145, 155); // Reset border drawing defaults
      doc.setDrawColor(241, 245, 249); // Slate 100
      doc.rect(margin, y - 5, maxLineWidth, report.type === 'email' ? 24 : 16, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // Slate 500
      doc.text(`${currentTargetLabel}:`, margin + 5, y + 2);
      
      doc.setFont('courier', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42); // Slate 900
      const targetValWrapped = doc.splitTextToSize(currentTargetValue, maxLineWidth - 10);
      doc.text(targetValWrapped, margin + 5, y + 8);
      
      if (report.type === 'email' && report.inputData.subject) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text('Subject Title:', margin + 5, y + 16);
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(15, 23, 42);
        const subjWrapped = doc.splitTextToSize(report.inputData.subject, maxLineWidth - 35);
        doc.text(subjWrapped, margin + 30, y + 16);
        y += 26;
      } else {
        y += 18;
      }

      y += 8;

      // Analysis Interpretation Detailed Section
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
      doc.text('ANALYSIS INTERPRETATION DETAILS', margin, y);
      
      y += 3;
      doc.setDrawColor(226, 232, 240); // Slate 200
      doc.line(margin, y, width - margin, y);
      y += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85); // Slate 700
      
      const explanationText = report.result?.explanation || 'No analysis explanation details available.';
      const explanationWrapped = doc.splitTextToSize(explanationText, maxLineWidth);
      
      // Calculate text height
      const explanationHeight = explanationWrapped.length * 5;
      doc.text(explanationWrapped, margin, y);
      y += explanationHeight + 12;

      // Check if page needs break
      if (y > 230) {
        doc.addPage();
        y = 20;
      }

      // Threats Detected Bad Indicators Tags
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
      doc.text('SECURITY VIOLATION MARKERS', margin, y);
      
      y += 3;
      doc.line(margin, y, width - margin, y);
      y += 8;

      if (report.result?.indicators && report.result.indicators.length > 0) {
        report.result.indicators.forEach((indicator) => {
          doc.setFillColor(254, 242, 242); // Rose 50
          doc.setDrawColor(254, 205, 205); // Rose 200
          doc.rect(margin, y - 4, maxLineWidth, 8, 'FD');
          
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.setTextColor(153, 27, 27); // Rose 800
          doc.text(`[!] ${indicator}`, margin + 5, y + 1.5);
          y += 11;

          if (y > 265) {
            doc.addPage();
            y = 20;
          }
        });
      } else {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);
        doc.setTextColor(148, 163, 184); // Slate 400
        doc.text('No malicious signatures isolated.', margin, y);
        y += 12;
      }

      y += 5;
      if (y > 240) {
        doc.addPage();
        y = 20;
      }

      // Mitigation Action Plan Advice Checklist
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
      doc.text('ACTION PLAN MITIGATION BLUEPRINT', margin, y);
      
      y += 3;
      doc.setDrawColor(226, 232, 240); // Slate 200
      doc.line(margin, y, width - margin, y);
      y += 8;

      if (report.result?.mitigationAdvice && report.result.mitigationAdvice.length > 0) {
        report.result.mitigationAdvice.forEach((step, index) => {
          // Wrap text for safety
          const stepWrapped = doc.splitTextToSize(`[${index + 1}]  ${step}`, maxLineWidth);
          const blockHeight = stepWrapped.length * 5;
          
          if (y + blockHeight > 275) {
            doc.addPage();
            y = 20;
          }

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          doc.setTextColor(51, 65, 85);
          
          doc.text(stepWrapped, margin, y);
          y += blockHeight + 4;
        });
      } else {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);
        doc.setTextColor(148, 163, 184);
        doc.text('No mitigation steps listed.', margin, y);
        y += 12;
      }

      // Add a clean footer on all pages
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        
        // Horizontal footer separator line
        doc.setDrawColor(241, 245, 249);
        doc.line(margin, 282, width - margin, 282);
        
        doc.text('CONFIDENTIAL - PhishGuard Threat Analysis Client Brief', margin, 287);
        doc.text(`Page ${i} of ${totalPages}`, width - margin, 287, { align: 'right' });
      }

      // Save generated A4 PDF file
      doc.save(`phishguard_threat_brief_${report.id}.pdf`);
    } catch (pdfErr) {
      console.error('Error generating detailed PDF:', pdfErr);
      // Fallback
      onSelectScan(report);
      setTimeout(() => window.print(), 300);
    }
  };

  const calculateScoreColor = (score: number) => {
    if (score > 75) return 'text-red-400 bg-red-500/10 border-red-500/30';
    if (score > 35) return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
    return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  };

  return (
    <div className="space-y-6">
      {/* Visual Hub header card */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 backdrop-blur-md flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2 font-sans">
            <FileText className="h-5 w-5 text-cyan-400" /> Archival Threat Registers & Auditing Logs
          </h2>
          <p className="mt-1 text-xs md:text-sm text-slate-300 font-sans">
            Inspect historic threat assessments, print secure PDF briefs, or retrieve raw JSON parameters for threat feeds.
          </p>
        </div>
        {token === null && (
          <span className="text-[10px] sm:text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-3 py-1 font-mono uppercase text-center self-start sm:self-auto select-none">
            Viewing DEMO Records. Sign In to lock personal logs.
          </span>
        )}
      </div>

      {/* Database Filters Bar */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 backdrop-blur-md flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search keywords, domains, grades..."
            className="w-full rounded-xl border border-white/10 bg-black/30 pl-11 pr-4 py-2.5 text-xs sm:text-sm text-white focus:border-cyan-500 focus:outline-none transition font-sans"
          />
        </div>

        {/* Tab filters */}
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto self-start md:self-auto pr-1">
          {(['all', 'email', 'url', 'image'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition whitespace-nowrap uppercase cursor-pointer ${
                filterType === type 
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-[0_0_10px_rgba(6,182,212,0.25)]' 
                  : 'bg-black/30 border border-white/10 text-slate-450 text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {type === 'all' ? 'All Types' : `${type} Scans`}
            </button>
          ))}
        </div>
      </div>

      {/* Main Registry list list */}
      {loading ? (
        <div className="py-20 text-center text-slate-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-3" />
          <span className="text-xs font-mono text-cyan-400 animate-pulse">Loading historical registers...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 py-16 text-center text-slate-550 flex flex-col items-center justify-center">
          <FileText className="h-12 w-12 text-slate-705 text-slate-650 text-slate-500 mx-auto mb-3 animate-pulse" />
          <p className="text-sm font-semibold text-slate-300">No threat documents tracked.</p>
          <p className="text-xs text-slate-450 text-slate-400 mt-1 max-w-xs font-sans leading-relaxed">Try broadening search terms or issue new scans in active toolbars.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => {
            const levelColor = (item.result?.threatLevel || 'Safe') === 'Dangerous' 
              ? 'text-red-400' 
              : (item.result?.threatLevel || 'Safe') === 'Suspicious'
                ? 'text-yellow-400'
                : 'text-emerald-400';

            const itemIcon = item.type === 'email' 
              ? <Mail className="h-4.5 w-4.5 text-cyan-400" />
              : item.type === 'url'
                ? <Globe className="h-4.5 w-4.5 text-teal-400" />
                : <ImageIcon className="h-4.5 w-4.5 text-purple-400" />;

            const previewText = item.type === 'email' 
              ? item.inputData?.senderEmail 
              : item.type === 'url' 
                ? item.inputData?.url 
                : item.inputData?.fileName;

            return (
              <div
                key={item.id}
                className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 flex flex-col justify-between hover:border-white/20 hover:bg-white/[0.05] transition duration-300 shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                        {itemIcon}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white uppercase font-sans">{item.type} Scan report</span>
                        <div className="text-[9px] font-mono text-slate-500 mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">SEC_ID: {item.id}</div>
                      </div>
                    </div>
                    
                    <span className={`text-[10px] font-mono font-extrabold border px-2 py-0.5 rounded ${calculateScoreColor(item.result?.threatScore || 0)}`}>
                      SCORE: {item.result?.threatScore || 0}
                    </span>
                  </div>

                  {/* Summary preview */}
                  <div className="space-y-1 bg-black/40 p-2.5 text-[10px] sm:text-xs rounded-xl border border-white/5 font-mono">
                    <span className="text-slate-400 block uppercase">TARGET ARTIFACT:</span>
                    <span className="text-slate-200 block truncate select-all">{previewText}</span>
                    {item.type === 'email' && item.inputData?.subject && (
                      <span className="text-slate-400 block truncate mt-0.5">SUBJ: {item.inputData.subject}</span>
                    )}
                  </div>

                  {/* AI Explanation block */}
                  <p className="text-[11px] sm:text-xs text-slate-350 text-slate-300 line-clamp-3 leading-relaxed font-sans">
                    {item.result?.explanation || 'No analysis explanation details available.'}
                  </p>
                </div>

                {/* Operations tools alignment */}
                <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[9px] font-mono text-slate-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {new Date(item.createdAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-2">
                    {/* View Details */}
                    <button
                      onClick={() => onSelectScan(item)}
                      title="Inspect full audit diagnostics"
                      className="text-xs text-cyan-400 hover:text-white hover:bg-cyan-600 border border-cyan-500/25 bg-cyan-950/20 rounded-xl px-3 py-1.5 transition cursor-pointer font-sans"
                    >
                      Audit
                    </button>

                    {/* Download JSON */}
                    <button
                      onClick={() => downloadJSON(item)}
                      title="Export report parameters as JSON"
                      className="text-xs text-slate-400 hover:text-white bg-black/20 hover:bg-black/40 border border-white/15 rounded-xl p-1.5 transition cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>

                    {/* Print Brief */}
                    <button
                      onClick={() => generatePDFReport(item)}
                      title="Print structured target to file PDF"
                      className="text-xs text-slate-400 hover:text-white bg-black/20 hover:bg-black/40 border border-white/15 rounded-xl p-1.5 transition cursor-pointer"
                    >
                      <Printer className="h-3.5 w-3.5" />
                    </button>

                    {/* Delete item if login session active */}
                    {token && (
                      <button
                        onClick={() => {
                          if (window.confirm('Quarantine and erase report?')) {
                            onDeleteReport(item.id);
                          }
                        }}
                        title="Erase log"
                        className="text-xs text-red-400 hover:text-white hover:bg-red-950/30 border border-red-500/15 rounded-xl p-1.5 transition cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
