import React, { useState } from 'react';
import { Button } from '../design-system/Button';
import { useApp } from '../context/AppContext';
import {
  FileCode2,
  Copy,
  Check,
  Download,
  Server,
  ArrowRightLeft,
  ShieldCheck,
  Layers,
} from 'lucide-react';

export const ApiSpecViewer: React.FC = () => {
  const { addToast } = useApp();
  const [copied, setCopied] = useState(false);

  const specMarkdown = `# AICTE Unified Grievance Coordination System · REST API Contract
Base URL: https://api.grievance.aicte-india.org/api/v1
Authentication: Authorization: Bearer <JWT_TOKEN>

Core Integration Endpoints:
--------------------------------------------------------------------------------
1. POST /complaints
   - Called by: User Panel (Complainant)
   - Function: Creates grievance, calculates SLA deadline, emits AICTE-YYYY-GRV-XXXX ID.

2. GET /complaints
   - Called by: Admin Panel (All Cases, Dashboard)
   - Query: status, bureau, urgency, query, isOverdue, dueSoon, page, limit.

3. POST /complaints/{id}/verify
   - Called by: Admin Verification Queue
   - Action: APPROVE | REJECT | REQUEST_INFO.

4. POST /complaints/{id}/transfer
   - Jurisdiction re-assignment to another specialized technical bureau.

5. POST /complaints/{id}/escalate
   - Escalates to Level 2 (Member Secretary) or Regional Inspection Director.

6. POST /complaints/{id}/decision
   - Sanctions formal RESOLVED or REJECTED statutory order.

7. POST /coordination/link
   - Coordinates related complaints without merging IDs or individual SLA deadlines.

8. POST /resolution-proofs/{id}/review
   - Action: ACCEPTED | DISPUTED | REJECTED.

9. POST /pools/{id}/vote
   - Records affinity votes without establishing automatic validity.
--------------------------------------------------------------------------------`;

  const handleCopy = () => {
    navigator.clipboard.writeText(specMarkdown);
    setCopied(true);
    addToast({
      type: 'success',
      title: 'Copied to Clipboard',
      message: 'API Contract specification copied.',
    });
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="bg-white border border-[#CBD2DC] rounded-[8px] p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-[#C2570C]" />
            <h2 className="text-lg font-bold text-[#0B2A5B]">
              Shared Backend API Integration Contract &amp; Schemas
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={copied ? <Check className="w-3.5 h-3.5 text-[#166534]" /> : <Copy className="w-3.5 h-3.5" />}
              onClick={handleCopy}
            >
              {copied ? 'Copied' : 'Copy API Spec'}
            </Button>
          </div>
        </div>

        <p className="text-xs text-[#4B5565] max-w-3xl leading-relaxed">
          Defines the contract bridging the Complainant User Panel (currently developed in parallel) with this Official Admin Coordination Dashboard. Grievances submitted in the User Panel immediately populate this Admin Panel's verification queue.
        </p>

        <div className="p-3 bg-[#E6EEF9] border border-[#93C5FD] rounded-[6px] text-xs text-[#1F5FBF] flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4 flex-shrink-0" />
          <span>
            <strong>Full Specification File:</strong> Detailed REST documentation is saved in <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded">docs/API_INTEGRATION_SPEC.md</code>.
          </span>
        </div>
      </div>

      <div className="bg-[#0B2A5B] border border-[#CBD2DC] rounded-[8px] p-5 text-white font-mono text-xs overflow-x-auto shadow-inner">
        <pre className="leading-relaxed">{specMarkdown}</pre>
      </div>
    </div>
  );
};
