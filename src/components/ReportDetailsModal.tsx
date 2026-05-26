import React from 'react';
import { X, Mail, Globe, Image as ImageIcon, Download, Printer, ShieldAlert, AlertTriangle, ShieldCheck, Calendar } from 'lucide-react';
import { ScanReport } from '../types';
import { jsPDF } from 'jspdf';

interface ReportDetailsModalProps {
  report: ScanReport;
  onClose: () => void;
}

export default function ReportDetailsModal({ report, onClose }: ReportDetailsModalProps) {
  const downloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `phishguard_audit_report_${report.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const generatePDFReport = () => {
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
      doc.text(`${targetLabel}:`, margin + 5, y + 2);
      
      doc.setFont('courier', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42); // Slate 900
      const targetValWrapped = doc.splitTextToSize(targetValue, maxLineWidth - 10);
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
      // Fallback to legacy window print if any generation issue
      window.print();
    }
  };

  const getSeverityColors = (level: string) => {
    if (level === 'Dangerous') return {
      text: 'text-red-400',
      border: 'border-red-500/30',
      bg: 'bg-red-500/10',
      lightText: 'text-red-300'
    };
    if (level === 'Suspicious') return {
      text: 'text-yellow-400',
      border: 'border-yellow-400/30',
      bg: 'bg-yellow-400/10',
      lightText: 'text-yellow-300'
    };
    return {
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/10',
      lightText: 'text-emerald-300'
    };
  };

  const colors = getSeverityColors(report.result?.threatLevel || 'Safe');

  const targetLabel = report.type === 'email' 
    ? 'Verified Inbound Email Address' 
    : report.type === 'url' 
      ? 'Verified Link Target Address' 
      : 'Screenshot File Identity';

  const targetValue = report.type === 'email' 
    ? report.inputData.senderEmail 
    : report.type === 'url' 
      ? report.inputData.url 
      : report.inputData.fileName;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto print:absolute print:inset-0 print:bg-white print:p-0 print:z-0 print:backdrop-blur-none">
      <div className="modal-print-target w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-6 relative max-h-[90vh] overflow-y-auto print:max-h-none print:border-none print:bg-white print:text-black print:p-0">
        
        {/* Close Button / Print hide */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition cursor-pointer p-1.5 rounded-lg border border-slate-900 bg-slate-900/30 hover:bg-slate-900 print-hidden"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        {/* Title / ID Metadata */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-900 pb-4 print-border-gray">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-500 tracking-widest uppercase print-text-gray">PHISHGUARD THREAT AUDIT DETAILED BRIEF</span>
              <span className={`text-[9px] font-mono border uppercase px-1.5 py-0.5 rounded ${colors.text} ${colors.border} ${colors.bg} print-level-${report.result?.threatLevel || 'Safe'}`}>
                {report.result?.threatLevel || 'Safe'} STATUS
              </span>
            </div>
            <h2 className="text-lg font-bold text-white uppercase mt-1 print-text-dark">
              Audit Report <span className="text-slate-500 font-mono text-xs print-text-gray">#{report.id}</span>
            </h2>
          </div>
          <span className="text-[10px] sm:text-xs font-mono text-slate-400 flex items-center gap-1 print-text-gray">
            <Calendar className="h-3.5 w-3.5" /> Checked: {new Date(report.createdAt).toLocaleString()}
          </span>
        </div>

        {/* Big Threat Level Banner */}
        <div className={`rounded-xl border p-5 flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-4 ${colors.border} ${colors.bg} print-border-gray print-bg-light`}>
          <div className="space-y-1">
            <span className="text-xs font-mono text-slate-400 block uppercase print-text-gray">THREAT INDEX CLASSIFICATION</span>
            <span className={`text-2xl font-black font-mono tracking-wide ${colors.text} print-level-${report.result?.threatLevel || 'Safe'} border-none bg-transparent p-0 block`}>{report.result?.threatLevel || 'Safe'}</span>
            <p className="text-[11px] text-slate-300 max-w-sm print-text-gray">Based on security models scanning syntactic signals, phishing templates, and URL redirect structures.</p>
          </div>

          {/* Circle score gauge */}
          <div className="relative h-20 w-20 flex items-center justify-center rounded-full bg-slate-900 border-2 border-slate-800 shrink-0 print-border-gray print-bg-light">
            <span className={`text-2xl font-black font-mono ${colors.text} print-level-${report.result?.threatLevel || 'Safe'} border-none bg-transparent`}>{report.result?.threatScore || 0}</span>
            <span className="text-[8px] font-mono text-slate-500 absolute bottom-3 print-text-gray">/ 100</span>
          </div>
        </div>

        {/* Target Details table */}
        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-slate-400 block uppercase print-text-gray">TARGET CRITERIA</span>
          <div className="rounded-xl border border-slate-900 bg-slate-900/40 p-4 font-mono text-xs sm:text-sm space-y-2.5 print-border-gray print-bg-light print-text-dark">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-slate-500 text-xs print-text-gray">{targetLabel}:</span>
              <span className="text-slate-200 select-all font-bold text-xs sm:text-sm break-all print-text-dark">{targetValue}</span>
            </div>
            {report.type === 'email' && report.inputData.subject && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-t border-slate-950 pt-2 print-border-gray">
                <span className="text-slate-500 text-xs print-text-gray">Email Subject Line:</span>
                <span className="text-slate-300 font-bold text-xs break-all print-text-dark">{report.inputData.subject}</span>
              </div>
            )}
          </div>
        </div>

        {/* AI Explanation block */}
        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-slate-400 block uppercase print-text-gray">ANALYSIS INTERPRETATION DETAILS</span>
          <div className="p-4 rounded-xl border border-slate-900 bg-slate-900/10 text-xs sm:text-sm leading-relaxed text-slate-200 print-border-gray print-bg-light print-text-dark">
            {report.result?.explanation || 'No analysis explanation details available.'}
          </div>
        </div>

        {/* Identified Tags / Bad indicators */}
        <div className="space-y-2 bg-slate-900/20 p-4 rounded-xl border border-slate-900 print-border-gray print-bg-light">
          <span className="text-xs font-mono font-bold text-slate-400 block uppercase print-text-gray">SECURITY VIOLATION MARKERS</span>
          <div className="flex flex-wrap gap-2 pt-1">
            {report.result?.indicators && report.result.indicators.map((tag, i) => (
              <span
                key={i}
                className="text-[10px] font-mono font-semibold bg-red-500/10 border border-red-500/30 text-rose-300 px-2.5 py-1 rounded print-level-Dangerous"
              >
                ⚠️ {tag}
              </span>
            ))}
            {(!report.result?.indicators || report.result.indicators.length === 0) && (
              <span className="text-xs text-slate-500 italic print-text-gray">No malicious signatures isolated.</span>
            )}
          </div>
        </div>

        {/* Action checklist advice */}
        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-slate-400 block uppercase print-text-gray">ACTION PLAN MITIGATION BLUEPRINT</span>
          <ul className="space-y-2">
            {report.result?.mitigationAdvice && report.result.mitigationAdvice.map((step, i) => (
              <li key={i} className="text-xs sm:text-sm text-slate-300 flex items-start gap-2.5 print-text-dark">
                <span className={`font-mono text-xs font-bold shrink-0 mt-0.5 ${colors.text} print-list-counter`}>[{i + 1}]</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Print / Download options bar */}
        <div className="pt-4 border-t border-slate-900 flex justify-end gap-3 print-hidden">
          <button
            onClick={generatePDFReport}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 cursor-pointer"
          >
            <Printer className="h-4 w-4" /> Print PDF Report
          </button>
          <button
            onClick={downloadJSON}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2.5 text-xs font-semibold text-white cursor-pointer"
          >
            <Download className="h-4 w-4" /> Export Report JSON
          </button>
        </div>

      </div>
    </div>
  );
}
