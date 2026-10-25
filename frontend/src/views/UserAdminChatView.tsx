import React, { useEffect, useRef, useState } from 'react';
import { translations, Language } from '../locales/translations';
import { ActiveTab } from '../components/Navbar';
import { MessageThread } from '../components/chat/MessageThread';
import { Complaint, ConversationReader, EvidenceFile, UserAdminMessage } from '../types';
import { toEvidenceFiles } from '../lib/evidence';
import {
  Send,
  Paperclip,
  ShieldCheck,
  Info,
  ArrowRight,
  FileText,
  X
} from 'lucide-react';

interface UserAdminChatViewProps {
  lang: Language;
  setActiveTab: (tab: ActiveTab) => void;
  complaint: Complaint;
  messages: UserAdminMessage[];
  onSendMessage: (complaintId: string, msg: UserAdminMessage) => void;
  onFulfillDocumentRequest: (complaintId: string, requestId: string, files: EvidenceFile[], senderName: string) => void;
  onMarkThreadRead: (complaintId: string, reader: ConversationReader) => void;
}

export const UserAdminChatView: React.FC<UserAdminChatViewProps> = ({
  lang,
  setActiveTab,
  complaint,
  messages,
  onSendMessage,
  onFulfillDocumentRequest,
  onMarkThreadRead
}) => {
  const t = translations[lang];
  const [inputText, setInputText] = useState('');
  const [pendingFiles, setPendingFiles] = useState<EvidenceFile[]>([]);
  const [isHashing, setIsHashing] = useState(false);
  const [uploadingRequestId, setUploadingRequestId] = useState<string | null>(null);
  const attachInputRef = useRef<HTMLInputElement>(null);

  // Opening the thread (and any new officer message while open) marks it read
  const hasUnread = messages.some(m => !m.readByComplainant);
  useEffect(() => {
    if (hasUnread) onMarkThreadRead(complaint.id, 'complainant');
  }, [complaint.id, hasUnread, onMarkThreadRead]);

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text && pendingFiles.length === 0) return;

    onSendMessage(complaint.id, {
      id: `msg-${Date.now()}`,
      complaintId: complaint.id,
      kind: 'text',
      senderRole: 'complainant',
      senderName: complaint.complainantName,
      content: text || `Shared ${pendingFiles.length} supporting document(s).`,
      timestamp: 'Just now',
      attachments: pendingFiles.length > 0 ? pendingFiles : undefined,
      readByOfficer: false,
      readByComplainant: true
    });

    if (!textToSend) setInputText('');
    setPendingFiles([]);
  };

  const handleAttachFiles = async (files: FileList) => {
    setIsHashing(true);
    try {
      const evidence = await toEvidenceFiles(files);
      setPendingFiles(prev => [...prev, ...evidence]);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not read the selected files.');
    } finally {
      setIsHashing(false);
    }
  };

  const handleUploadForRequest = async (requestId: string, files: FileList) => {
    setUploadingRequestId(requestId);
    try {
      const evidence = await toEvidenceFiles(files);
      onFulfillDocumentRequest(complaint.id, requestId, evidence, complaint.complainantName);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not read the selected files.');
    } finally {
      setUploadingRequestId(null);
    }
  };

  const quickPrompts = [
    'Could you please confirm the next hearing date?',
    'Has the institute responded to the notice yet?',
    'I have shared the requested documents.',
    'Please confirm if my complaint is being treated confidentially.'
  ];

  return (
    <div className="chatbox-page-container" id="main-content">
      <div className="container max-w-900">
        <div className="card chat-master-card flex flex-col">
          {/* Official Chat Header */}
          <div className="chat-header flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="officer-badge-avatar">
                🏛️
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="officer-title-name">{complaint.assignedOfficer.name}</h3>
                  <span className="verified-official-chip flex items-center gap-1">
                    <ShieldCheck size={12} />
                    Verified AICTE Officer
                  </span>
                </div>
                <p className="officer-sub-text">
                  {complaint.assignedOfficer.designation} · {complaint.assignedOfficer.bureau}
                </p>
              </div>
            </div>

            <div className="case-ref-box flex items-center gap-2">
              <span className="case-ref-label">Regarding Case:</span>
              <button
                type="button"
                className="case-ref-pill mono"
                onClick={() => setActiveTab('track')}
                title="Click to view stage tracking"
              >
                {complaint.id}
                <ArrowRight size={12} />
              </button>
            </div>
          </div>

          {/* Official Notice Banner */}
          <div className="chat-legal-banner flex items-center gap-2">
            <Info size={16} className="text-blue" />
            <span>
              <strong>Statutory Record:</strong> Communications in this channel constitute official representations under AICTE Redressal Norms and are permanently indexed in the central audit ledger.
            </span>
          </div>

          {/* Messages Flow Area */}
          <MessageThread
            lang={lang}
            messages={messages}
            viewer="complainant"
            onUploadForRequest={handleUploadForRequest}
            uploadingRequestId={uploadingRequestId}
          />

          {/* Quick Inquiry Prompts Bar */}
          <div className="quick-prompts-bar">
            <span className="prompts-label">Quick Prompts:</span>
            <div className="prompts-slider flex items-center gap-2">
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="prompt-chip"
                  onClick={() => handleSend(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Staged attachments */}
          {(pendingFiles.length > 0 || isHashing) && (
            <div className="pending-attachments-bar flex items-center gap-2">
              {pendingFiles.map(f => (
                <span key={f.id} className="pending-file-chip flex items-center gap-1">
                  <FileText size={12} />
                  <span>{f.name}</span>
                  <button
                    type="button"
                    className="pending-file-remove"
                    aria-label={`Remove ${f.name}`}
                    onClick={() => setPendingFiles(prev => prev.filter(p => p.id !== f.id))}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              {isHashing && <span className="pending-file-chip">{t.uploading}</span>}
            </div>
          )}

          {/* Message Composer */}
          <div className="chat-composer-bar flex items-center gap-2">
            <input
              ref={attachInputRef}
              type="file"
              multiple
              className="visually-hidden-input"
              tabIndex={-1}
              aria-hidden="true"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) handleAttachFiles(e.target.files);
                e.target.value = '';
              }}
            />
            <button
              type="button"
              className="btn btn-outline btn-icon-round"
              title={t.attachFiles}
              aria-label={t.attachFiles}
              onClick={() => attachInputRef.current?.click()}
            >
              <Paperclip size={18} />
            </button>

            <input
              type="text"
              className="input-control chat-input"
              placeholder={`Message ${complaint.assignedOfficer.name}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
            />

            <button
              type="button"
              className="btn btn-primary btn-send-chat"
              onClick={() => handleSend()}
              disabled={(!inputText.trim() && pendingFiles.length === 0) || isHashing}
            >
              <Send size={18} />
              <span className="hide-on-mobile">{t.send}</span>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .chatbox-page-container {
          padding: 32px 0 64px 0;
        }
        .max-w-900 {
          max-width: 900px;
          margin: 0 auto;
        }
        .chat-master-card {
          padding: 0;
          overflow: hidden;
          background: #FFFFFF;
          height: 680px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-neutral-300);
        }

        .chat-header {
          padding: 16px 20px;
          background: #F8FAFC;
          border-bottom: 1px solid var(--color-neutral-300);
        }
        .officer-badge-avatar {
          width: 44px;
          height: 44px;
          background: #EFF6FF;
          border: 2px solid #BFDBFE;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
        }
        .officer-title-name {
          font-size: 1.05rem;
          color: var(--color-navy-900);
        }
        .verified-official-chip {
          font-size: 0.72rem;
          font-weight: 700;
          color: #166534;
          background: #DCFCE7;
          border: 1px solid #86EFAC;
          padding: 1px 6px;
          border-radius: var(--radius-pill);
        }
        .officer-sub-text {
          font-size: 0.8rem;
          color: var(--color-neutral-600);
        }
        .case-ref-label {
          font-size: 0.8rem;
          color: var(--color-neutral-600);
        }
        .case-ref-pill {
          background: #EFF6FF;
          border: 1px solid #BFDBFE;
          color: var(--color-brand-blue-600);
          font-size: 0.8rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .chat-legal-banner {
          background: #EFF6FF;
          border-bottom: 1px solid #DBEAFE;
          padding: 8px 16px;
          font-size: 0.78rem;
          color: #1E40AF;
        }

        .quick-prompts-bar {
          padding: 8px 16px;
          background: #F1F5F9;
          border-top: 1px solid var(--color-neutral-200);
          display: flex;
          align-items: center;
          gap: 8px;
          overflow-x: auto;
        }
        .prompts-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--color-neutral-600);
          white-space: nowrap;
        }
        .prompt-chip {
          background: #FFFFFF;
          border: 1px solid #CBD5E1;
          color: var(--color-neutral-700);
          font-size: 0.75rem;
          padding: 3px 10px;
          border-radius: var(--radius-pill);
          cursor: pointer;
          white-space: nowrap;
          transition: background-color 0.1s ease;
        }
        .prompt-chip:hover {
          background-color: var(--color-brand-blue-100);
          border-color: var(--color-brand-blue-600);
          color: var(--color-brand-blue-600);
        }

        .pending-attachments-bar {
          padding: 8px 16px 0 16px;
          flex-wrap: wrap;
          background: #FFFFFF;
          border-top: 1px solid var(--color-neutral-200);
        }
        .pending-file-chip {
          font-size: 0.75rem;
          background: var(--color-brand-blue-100);
          color: var(--color-brand-blue-600);
          border: 1px solid #BFDBFE;
          border-radius: var(--radius-pill);
          padding: 2px 8px;
        }
        .pending-file-remove {
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
          display: inline-flex;
          padding: 0;
        }

        .chat-composer-bar {
          padding: 12px 16px;
          background: #FFFFFF;
          border-top: 1px solid var(--color-neutral-300);
        }
        .btn-icon-round {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .chat-input {
          flex: 1;
          border-radius: var(--radius-pill);
          padding-left: 16px;
          padding-right: 16px;
        }
        .btn-send-chat {
          border-radius: var(--radius-pill);
          padding: 8px 18px;
        }
      `}</style>
    </div>
  );
};
