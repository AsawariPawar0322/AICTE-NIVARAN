import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../locales/translations';
import { Complaint, ConversationMap, ConversationReader, EvidenceFile, UserAdminMessage } from '../types';
import { MessageThread } from './chat/MessageThread';
import { toEvidenceFiles } from '../lib/evidence';
import { Icon } from './Icon';
import { Building } from '@phosphor-icons/react';

interface FloatingOfficialChatProps {
  lang: Language;
  complaints: Complaint[];
  selectedComplaint: Complaint | null;
  onSelectComplaint: (complaint: Complaint) => void;
  conversations: ConversationMap;
  unreadCount: number;
  onSendMessage: (complaintId: string, msg: UserAdminMessage) => void;
  onFulfillDocumentRequest: (complaintId: string, requestId: string, files: EvidenceFile[], senderName: string) => void;
  onMarkThreadRead: (complaintId: string, reader: ConversationReader) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const FloatingOfficialChat: React.FC<FloatingOfficialChatProps> = ({
  lang,
  complaints,
  selectedComplaint,
  onSelectComplaint,
  conversations,
  unreadCount,
  onSendMessage,
  onFulfillDocumentRequest,
  onMarkThreadRead,
  isOpen,
  setIsOpen
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isAttaching, setIsAttaching] = useState(false);
  const [uploadingRequestId, setUploadingRequestId] = useState<string | null>(null);
  const attachInputRef = useRef<HTMLInputElement>(null);

  const activeCase = selectedComplaint || complaints[0];
  const messages = activeCase ? conversations[activeCase.id] || [] : [];

  // Reading the open thread clears the complainant's unread messages for that case
  const hasUnread = messages.some(m => !m.readByComplainant);
  useEffect(() => {
    if (isOpen && !isMinimized && activeCase && hasUnread) {
      onMarkThreadRead(activeCase.id, 'complainant');
    }
  }, [isOpen, isMinimized, activeCase, hasUnread, onMarkThreadRead]);

  const sendMessage = (content: string, attachments?: EvidenceFile[]) => {
    if (!activeCase) return;
    onSendMessage(activeCase.id, {
      id: `msg-float-${Date.now()}`,
      complaintId: activeCase.id,
      kind: 'text',
      senderRole: 'complainant',
      senderName: activeCase.complainantName,
      content,
      timestamp: 'Just now',
      attachments,
      readByOfficer: false,
      readByComplainant: true
    });
  };

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;
    sendMessage(text);
    if (!textToSend) setInputText('');
  };

  const handleAttach = async (files: FileList) => {
    setIsAttaching(true);
    try {
      const evidence = await toEvidenceFiles(files);
      sendMessage(`Shared ${evidence.length} supporting document(s).`, evidence);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not read the selected files.');
    } finally {
      setIsAttaching(false);
    }
  };

  const handleUploadForRequest = async (requestId: string, files: FileList) => {
    if (!activeCase) return;
    setUploadingRequestId(requestId);
    try {
      const evidence = await toEvidenceFiles(files);
      onFulfillDocumentRequest(activeCase.id, requestId, evidence, activeCase.complainantName);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not read the selected files.');
    } finally {
      setUploadingRequestId(null);
    }
  };

  const quickChips = [
    'Check case status',
    'How does OTP closure work?',
    'Has college sent refund proof?',
    'SLA time remaining?'
  ];

  return (
    <div className="floating-official-chat-wrapper" aria-label="Official AICTE Helpdesk Chat">
      {/* Floating launcher button when closed or minimized */}
      {!isOpen && (
        <button
          type="button"
          className="floating-chat-trigger-btn flex items-center gap-2 shadow-modal"
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          title="Open Official AICTE Grievance Desk Chat"
        >
          <div className="trigger-badge-wrap">
            <span className="trigger-pulse-dot"></span>
            <div className="trigger-icon-box">
              <Icon e="??" size={20} className="trigger-icon" />
            </div>
          </div>
          <div className="trigger-text-cluster text-left hide-on-mobile">
            <span className="trigger-title">Official AICTE Desk</span>
            <span className="trigger-sub">Dr. R. C. Verma · PGRC Live</span>
          </div>
          {unreadCount > 0 && (
            <span className="trigger-unread-chip">{unreadCount}</span>
          )}
        </button>
      )}

      {/* Floating Chat Modal / Docked Panel */}
      {isOpen && (
        <div className={`floating-chat-window ${isMinimized ? 'minimized' : ''}`}>
          {/* Header */}
          <div className="floating-chat-header flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="floating-avatar-emblem">
                <Building size={18} weight="duotone" color="currentColor" />
                <span className="floating-live-dot" title="Active on duty"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="floating-officer-name">
                    {activeCase?.assignedOfficer?.name || 'Dr. Ramesh Chandra Verma'}
                  </h4>
                  <span title="Verified AICTE Grievance Officer">
                    <Icon e="?" size={14} className="text-warning-icon" />
                  </span>
                </div>
                <span className="floating-officer-role">
                  Director, PGRC · AICTE Head Office
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                className="floating-action-icon-btn"
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? 'Expand Chat' : 'Minimize Chat'}
              >
                <Icon e="�" size={16} />
              </button>
              <button
                type="button"
                className="floating-action-icon-btn"
                onClick={() => setIsOpen(false)}
                title="Close Chat"
              >
                <Icon e="?" size={16} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Case Context Selector Bar */}
              <div className="floating-case-bar flex items-center justify-between">
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <Icon e="???" size={14} className="text-muted flex-shrink-0" />
                  <span className="case-bar-label">Case:</span>
                  <select
                    className="case-selector-dropdown"
                    value={activeCase?.id || ''}
                    onChange={(e) => {
                      const match = complaints.find(c => c.id === e.target.value);
                      if (match) onSelectComplaint(match);
                    }}
                  >
                    {complaints.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.id} — {c.institutionName.slice(0, 24)}...
                      </option>
                    ))}
                  </select>
                </div>
                <span className="stage-pill-mini">
                  {activeCase?.currentStage?.replace('_', ' ')}
                </span>
              </div>

              {/* Messages Body */}
              <div className="floating-messages-body">
                <div className="official-disclaimer-box">
                  <span className="disclaimer-stamp">GOVERNMENT OF INDIA · AICTE RECORD</span>
                  <p>
                    This is an authorized grievance channel. Transcripts are cryptographically preserved for official inspection under Problem Statement SIH26264.
                  </p>
                </div>

                <MessageThread
                  lang={lang}
                  messages={messages}
                  viewer="complainant"
                  onUploadForRequest={handleUploadForRequest}
                  uploadingRequestId={uploadingRequestId}
                />
              </div>

              {/* Quick Prompt Chips */}
              <div className="floating-quick-chips flex items-center gap-1.5">
                <Icon e="?" size={12} className="text-warning flex-shrink-0" />
                <div className="chips-scroll flex items-center gap-1">
                  {quickChips.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="floating-chip-btn"
                      onClick={() => handleSend(chip)}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Footer */}
              <form
                className="floating-input-footer flex items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
              >
                <input
                  ref={attachInputRef}
                  type="file"
                  multiple
                  className="visually-hidden-input"
                  tabIndex={-1}
                  aria-hidden="true"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) handleAttach(e.target.files);
                    e.target.value = '';
                  }}
                />
                <button
                  type="button"
                  className="floating-attach-btn"
                  title="Attach verification receipt or fee challan (SHA-256 hashed)"
                  aria-label="Attach supporting documents"
                  disabled={isAttaching}
                  onClick={() => attachInputRef.current?.click()}
                >
                  <Icon e="??" size={16} />
                </button>
                <input
                  type="text"
                  className="floating-text-input"
                  placeholder="Type official message to officer..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                <button
                  type="submit"
                  className="floating-send-btn"
                  disabled={!inputText.trim()}
                  title="Send message"
                >
                  <Icon e="?" size={15} />
                </button>
              </form>
            </>
          )}
        </div>
      )}

      <style>{`
        .floating-official-chat-wrapper {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          font-family: var(--font-sans);
        }

        .floating-chat-trigger-btn {
          background: linear-gradient(135deg, #0B2A5B 0%, #103673 100%);
          color: #FFFFFF;
          border: 2px solid var(--color-brand-orange-500);
          border-radius: var(--radius-pill);
          padding: 8px 16px 8px 10px;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(11, 42, 91, 0.35);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .floating-chat-trigger-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(11, 42, 91, 0.45);
        }

        .trigger-badge-wrap {
          position: relative;
        }
        .trigger-icon-box {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(242, 137, 94, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-brand-orange-500);
        }
        .trigger-pulse-dot {
          position: absolute;
          top: 0;
          right: 0;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #10B981;
          border: 2px solid #0B2A5B;
          animation: pulseGreen 2s infinite;
        }
        @keyframes pulseGreen {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        .trigger-title {
          font-size: 0.85rem;
          font-weight: 700;
          color: #FFFFFF;
          display: block;
          line-height: 1.2;
        }
        .trigger-sub {
          font-size: 0.7rem;
          color: var(--color-brand-orange-500);
          display: block;
        }
        .trigger-unread-chip {
          background: var(--color-action-600);
          color: #FFFFFF;
          font-size: 0.7rem;
          font-weight: 800;
          padding: 2px 7px;
          border-radius: var(--radius-pill);
          margin-left: 4px;
        }

        /* Floating Chat Window */
        .floating-chat-window {
          width: 380px;
          max-width: calc(100vw - 32px);
          height: 540px;
          max-height: calc(100vh - 80px);
          background: #FFFFFF;
          border-radius: 14px;
          box-shadow: 0 16px 40px rgba(11, 42, 91, 0.3);
          border: 1px solid var(--color-neutral-300);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: floatIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .floating-chat-window.minimized {
          height: auto;
        }
        @keyframes floatIn {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .floating-chat-header {
          background: linear-gradient(135deg, #0B2A5B 0%, #103673 100%);
          color: #FFFFFF;
          padding: 12px 14px;
          border-bottom: 2px solid var(--color-brand-orange-500);
        }
        .floating-avatar-emblem {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          position: relative;
        }
        .floating-live-dot {
          position: absolute;
          bottom: -1px;
          right: -1px;
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #10B981;
          border: 2px solid #0B2A5B;
        }
        .floating-officer-name {
          font-size: 0.9rem;
          font-weight: 700;
          color: #FFFFFF;
          line-height: 1.2;
        }
        .text-warning-icon {
          color: var(--color-brand-orange-500);
        }
        .floating-officer-role {
          font-size: 0.68rem;
          color: #CBD5E1;
          display: block;
        }
        .floating-action-icon-btn {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: #E2E8F0;
          width: 28px;
          height: 28px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .floating-action-icon-btn:hover {
          background: rgba(255, 255, 255, 0.25);
          color: #FFFFFF;
        }

        /* Case bar */
        .floating-case-bar {
          background: #F8FAFC;
          border-bottom: 1px solid var(--color-neutral-200);
          padding: 6px 12px;
          font-size: 0.75rem;
        }
        .case-bar-label {
          font-weight: 600;
          color: var(--color-neutral-600);
        }
        .case-selector-dropdown {
          border: 1px solid var(--color-neutral-300);
          background: #FFFFFF;
          border-radius: 4px;
          padding: 2px 6px;
          font-size: 0.72rem;
          font-weight: 600;
          max-width: 170px;
          outline: none;
          color: var(--color-navy-900);
        }
        .stage-pill-mini {
          background: var(--color-info-bg);
          color: var(--color-info-text);
          font-size: 0.65rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: var(--radius-pill);
          white-space: nowrap;
        }

        /* Messages Body */
        .floating-messages-body .thread-messages-area {
          padding: 0;
          background: transparent;
          overflow: visible;
          flex: none;
        }
        .floating-messages-body .thread-content-wrap {
          max-width: 88%;
        }
        .floating-messages-body {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
          background: #F8FAFC;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .official-disclaimer-box {
          background: #EFF6FF;
          border: 1px dashed #93C5FD;
          border-radius: 6px;
          padding: 6px 10px;
          text-align: center;
        }
        .disclaimer-stamp {
          font-size: 0.62rem;
          font-weight: 800;
          color: #1E40AF;
          letter-spacing: 0.5px;
          display: block;
          margin-bottom: 2px;
        }
        .official-disclaimer-box p {
          font-size: 0.68rem;
          color: #1E3A8A;
          line-height: 1.35;
          margin: 0;
        }

        .floating-msg-row {
          display: flex;
          gap: 8px;
          align-items: flex-end;
        }
        .user-msg-row {
          justify-content: flex-end;
        }
        .officer-msg-row {
          justify-content: flex-start;
        }
        .officer-mini-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #0B2A5B;
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .floating-msg-bubble {
          max-width: 82%;
          padding: 8px 12px;
          border-radius: 12px;
          font-size: 0.8125rem;
          line-height: 1.4;
        }
        .bubble-user {
          background: var(--color-brand-blue-600);
          color: #FFFFFF;
          border-bottom-right-radius: 2px;
        }
        .bubble-user .bubble-sender-name {
          color: #BAE6FD;
          font-size: 0.65rem;
          font-weight: 700;
        }
        .bubble-user .bubble-timestamp {
          color: #E0F2FE;
          font-size: 0.62rem;
        }
        .bubble-officer {
          background: #FFFFFF;
          color: var(--color-neutral-900);
          border: 1px solid var(--color-neutral-300);
          border-bottom-left-radius: 2px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .bubble-officer .bubble-sender-name {
          color: var(--color-navy-900);
          font-size: 0.68rem;
          font-weight: 700;
        }
        .bubble-officer .bubble-timestamp {
          color: var(--color-neutral-400);
          font-size: 0.62rem;
        }
        .bubble-content {
          margin-top: 2px;
          word-break: break-word;
        }
        .bubble-official-tag {
          font-size: 0.65rem;
          color: #059669;
          font-weight: 600;
          margin-top: 4px;
          border-top: 1px solid rgba(0,0,0,0.06);
          padding-top: 2px;
        }

        .officer-typing-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .typing-bubble {
          background: #FFFFFF;
          border: 1px solid var(--color-neutral-300);
          padding: 6px 10px;
          border-radius: 12px;
          display: flex;
          gap: 4px;
          align-items: center;
        }
        .typing-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #64748B;
          animation: typingDot 1.4s infinite;
        }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typingDot {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }

        /* Quick chips */
        .floating-quick-chips {
          background: #FFFFFF;
          border-top: 1px solid var(--color-neutral-200);
          padding: 6px 10px;
          overflow-x: auto;
        }
        .chips-scroll {
          overflow-x: auto;
          white-space: nowrap;
        }
        .floating-chip-btn {
          background: #F1F5F9;
          border: 1px solid #CBD5E1;
          color: #1E293B;
          font-size: 0.68rem;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: var(--radius-pill);
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .floating-chip-btn:hover {
          background: #E2E8F0;
          border-color: #94A3B8;
        }

        /* Input footer */
        .floating-input-footer {
          background: #FFFFFF;
          border-top: 1px solid var(--color-neutral-200);
          padding: 8px 10px;
        }
        .floating-attach-btn {
          background: none;
          border: none;
          color: #64748B;
          cursor: pointer;
          padding: 6px;
          border-radius: 4px;
        }
        .floating-attach-btn:hover {
          background: #F1F5F9;
          color: #0F172A;
        }
        .floating-text-input {
          flex: 1;
          background: #F8FAFC;
          border: 1px solid var(--color-neutral-300);
          border-radius: 6px;
          padding: 6px 10px;
          font-size: 0.8125rem;
          outline: none;
        }
        .floating-text-input:focus {
          border-color: var(--color-focus);
          background: #FFFFFF;
        }
        .floating-send-btn {
          background: var(--color-action-600);
          color: #FFFFFF;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .floating-send-btn:hover:not(:disabled) {
          background: var(--color-action-700);
        }
        .floating-send-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};
