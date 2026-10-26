import React from 'react';
import { ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { NationalTricolorRibbon } from './GovLogos';

export const GovFooter: React.FC = () => {
  return (
    <footer className="mt-auto bg-[#071D3F] text-white/90 border-t border-[#CBD2DC] select-none text-xs">
      {/* Top National Tricolor Accent */}
      <NationalTricolorRibbon height="h-1" />

      {/* Main Footer Links Container */}
      <div className="max-w-[1600px] mx-auto px-4 py-8 space-y-6">
        
        {/* Row 1: Key Government of India Portal Shortcuts */}
        <div className="border-b border-white/10 pb-5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#FCD34D] mb-3">
            Government of India Initiatives &amp; National Portals
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-[11px]">
            <a
              href="https://india.gov.in"
              target="_blank"
              rel="noreferrer"
              className="text-white/80 hover:text-white hover:underline flex items-center gap-1"
            >
              india.gov.in <ExternalLink className="w-2.5 h-2.5 text-white/40" />
            </a>
            <a
              href="https://education.gov.in"
              target="_blank"
              rel="noreferrer"
              className="text-white/80 hover:text-white hover:underline flex items-center gap-1"
            >
              Ministry of Education <ExternalLink className="w-2.5 h-2.5 text-white/40" />
            </a>
            <a
              href="https://pgportal.gov.in"
              target="_blank"
              rel="noreferrer"
              className="text-white/80 hover:text-white hover:underline flex items-center gap-1"
            >
              CPGRAMS Portal <ExternalLink className="w-2.5 h-2.5 text-white/40" />
            </a>
            <a
              href="https://www.digitalindia.gov.in"
              target="_blank"
              rel="noreferrer"
              className="text-white/80 hover:text-white hover:underline flex items-center gap-1"
            >
              Digital India <ExternalLink className="w-2.5 h-2.5 text-white/40" />
            </a>
            <a
              href="https://www.aicte-india.org"
              target="_blank"
              rel="noreferrer"
              className="text-white/80 hover:text-white hover:underline flex items-center gap-1"
            >
              AICTE Main Portal <ExternalLink className="w-2.5 h-2.5 text-white/40" />
            </a>
            <a
              href="https://scholarships.gov.in"
              target="_blank"
              rel="noreferrer"
              className="text-white/80 hover:text-white hover:underline flex items-center gap-1"
            >
              National Scholarship <ExternalLink className="w-2.5 h-2.5 text-white/40" />
            </a>
          </div>
        </div>

        {/* Row 2: Statutory Compliance, RTI & Citizen Policies */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-white/70">
          <a href="#main-content" className="hover:text-white hover:underline">
            Right to Information (RTI)
          </a>
          <span>•</span>
          <a href="#main-content" className="hover:text-white hover:underline">
            Citizen Charter
          </a>
          <span>•</span>
          <a href="#main-content" className="hover:text-white hover:underline">
            Grievance Redressal Mechanism Policy
          </a>
          <span>•</span>
          <a href="#main-content" className="hover:text-white hover:underline">
            Website Policies &amp; Privacy Statement
          </a>
          <span>•</span>
          <a href="#main-content" className="hover:text-white hover:underline">
            Hyperlinking Policy
          </a>
          <span>•</span>
          <a href="#main-content" className="hover:text-white hover:underline">
            Terms of Use &amp; Disclaimer
          </a>
          <span>•</span>
          <a href="#main-content" className="hover:text-white hover:underline">
            Accessibility Statement
          </a>
          <span>•</span>
          <a href="#main-content" className="hover:text-white hover:underline">
            Help &amp; Contact Desk
          </a>
        </div>

        {/* Row 3: Ownership, Hosting, GIGW Standards & Security */}
        <div className="pt-4 border-t border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[11px] text-white/60">
          <div className="space-y-1 max-w-3xl">
            <p>
              Website Content Managed by <strong>AICTE NIVARAN</strong> · All India Council for Technical Education (AICTE), Ministry of Education, Government of India.
            </p>
            <p>
              Designed, Developed and Hosted by <strong>National Informatics Centre (NIC)</strong> / Government Cloud Infrastructure.
            </p>
            <p className="text-[10px] text-white/40">
              Compliant with Guidelines for Indian Government Websites (GIGW 3.0) · ISO/IEC 27001 Certified Infrastructure.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end gap-1.5 font-mono text-[10.5px]">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>STQC Security Audit: Passed</span>
            </div>
            <div className="text-white/50">
              Last Updated: <strong>25 Oct 2026</strong>
            </div>
            <div className="text-white/50">
              Portal Visitors: <strong>2,418,920</strong>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};
