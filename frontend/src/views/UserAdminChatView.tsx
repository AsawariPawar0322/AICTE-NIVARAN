import React, { useState } from 'react';
import { translations, Language } from '../locales/translations';
import { ActiveTab } from '../components/Navbar';
import { Complaint, UserAdminMessage } from '../types';
import { Icon } from '../components/Icon';
import { Building } from '@phosphor-icons/react';

interface UserAdminChatViewProps {
  lang: Language;
  setActiveTab: (tab: ActiveTab) => void;
  complaint: Complaint;
  messages: UserAdminMessage[];
  onSendMessage: (msg: UserAdminMessage) => void;
}

export const UserAdminChatView: React.FC<UserAdminChatViewProps> = ({
  lang,
  setActiveTab,
  complaint,
  messages,
  onSendMessage
}) => {
  const t = translations[lang];
  const [inputText, setInputText] = useState('');
  const [isOfficerTyping, setIsOfficerTyping] = useState(false);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: UserAdminMessage = {
      id: `msg-${Date.now()}`,
      senderRole: 'complainant',
      senderName: `${complaint.complainantName} (You)`,
      content: text,
      timestamp: 'Just now'
    };

    onSendMessage(userMsg);
    if (!textToSend) setInputText('');

    // Simulate official nodal officer response
    setIsOfficerTyping(true);
    setTimeout(() => {
      setIsOfficerTyping(false);
      const officerReplies = [
        `Thank you for providing this clarification, ${complaint.complainantName}. This has been appended to the official hearing docket and served to the College Registrar.`,
        `We have verified your statement against the institutional records. The college nodal desk has been instructed to comply within statutory AICTE guidelines.`,
        `Noted. If you have any additional bank statement or receipt proof, please upload it to the Evidence Vault under the Track tab.`
      ];
      const randomReply = officerReplies[Math.floor(Math.random() * officerReplies.length)];

      const officerMsg: UserAdminMessage = {
        id: `msg-${Date.now() + 1}`,
        senderRole: 'officer',
        senderName: complaint.assignedOfficer.name,
        content: randomReply,
        timestamp: 'Just now',
        isOfficialNote: true
      };
      onSendMessage(officerMsg);
    }, 1800);
  };

  const quickPrompts = [
    'Sir, could you please confirm the next hearing date?',
    'I have uploaded the stamped seat withdrawal acknowledgement.',
    'Has the college nodal officer submitted the refund UTR number?',
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
                <Building size={22} weight="duotone" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="officer-title-name">{complaint.assignedOfficer.name}</h3>
                  <span className="verified-official-chip flex items-center gap-1">
                    <Icon e="✅" size={12} />
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
                <Icon e="→" size={12} />
              </button>
            </div>
          </div>

          {/* Official Notice Banner */}
          <div className="chat-legal-banner flex items-center gap-2">
            <Icon e="ℹ️" size={16} className="text-blue" />
            <span>
              <strong>Statutory Record:</strong> Communications in this channel constitute official representations under AICTE Redressal Norms and are permanently indexed in the central audit ledger.
            </span>
          </div>

          {/* Messages Flow Area */}
          <div className="chat-messages-area">
            {messages.map((m) => {
              const isUser = m.senderRole === 'complainant';
              const isSystem = m.senderRole === 'system';

              if (isSystem) {
                return (
                  <div key={m.id} className="system-message-row text-center">
                    <div className="system-bubble">
                      <span className="system-text">{m.content}</span>
                      <span className="system-time mono">{m.timestamp}</span>
                    </div>
                  </div>
                );
              }

              return (
                <div key={m.id} className={`message-bubble-row ${isUser ? 'user-row' : 'officer-row'}`}>
                  <div className="message-content-wrap">
                    <div className="message-sender-line flex items-center gap-2">
                      <strong className="sender-name">{m.senderName}</strong>
                      {m.isOfficialNote && (
                        <span className="official-note-tag">Official Remark</span>
                      )}
                      <span className="message-time mono">{m.timestamp}</span>
                    </div>

                    <div className={`message-bubble ${isUser ? 'user-bubble' : 'officer-bubble'}`}>
                      <p className="message-text">{m.content}</p>
                    </div>

                    {isUser && (
                      <div className="delivered-receipt flex items-center justify-end gap-1">
                        <Icon e="✓" size={14} className="text-blue" />
                        <span>Delivered & Logged</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isOfficerTyping && (
              <div className="officer-row typing-indicator-row">
                <div className="typing-bubble flex items-center gap-2">
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-text">{complaint.assignedOfficer.name} is reviewing & replying...</span>
                </div>
              </div>
            )}
          </div>

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

          {/* Message Composer */}
          <div className="chat-composer-bar flex items-center gap-2">
            <button
              type="button"
              className="btn btn-outline btn-icon-round"
              title="Attach Supplementary Document / Receipt"
              onClick={() => alert('Attachment dialog: select fee receipt or photo proof to upload.')}
            >
              <Icon e="📎" size={18} />
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
              disabled={!inputText.trim()}
            >
              <Icon e="➤" size={18} />
              <span className="hide-on-mobile">Send</span>
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
          color: var(--color-brand-blue-600);
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

        .chat-messages-area {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: #FAFBFD;
        }

        .system-message-row {
          margin: 4px 0;
        }
        .system-bubble {
          display: inline-block;
          background: #F1F5F9;
          border: 1px solid #E2E8F0;
          border-radius: var(--radius-md);
          padding: 8px 16px;
          max-width: 80%;
          font-size: 0.8125rem;
          color: #475569;
        }
        .system-time {
          display: block;
          font-size: 0.7rem;
          color: #94A3B8;
          margin-top: 2px;
        }

        .message-bubble-row {
          display: flex;
          width: 100%;
        }
        .user-row {
          justify-content: flex-end;
        }
        .officer-row {
          justify-content: flex-start;
        }
        .message-content-wrap {
          max-width: 75%;
        }
        .message-sender-line {
          font-size: 0.75rem;
          margin-bottom: 4px;
        }
        .user-row .message-sender-line {
          justify-content: flex-end;
        }
        .sender-name {
          color: var(--color-navy-900);
        }
        .official-note-tag {
          font-size: 0.68rem;
          font-weight: 700;
          background: #FEF3C7;
          color: #B45309;
          padding: 1px 5px;
          border-radius: 2px;
        }
        .message-time {
          color: #94A3B8;
          font-size: 0.7rem;
        }

        .message-bubble {
          padding: 12px 16px;
          border-radius: var(--radius-md);
          font-size: 0.9rem;
          line-height: 1.45;
        }
        .user-bubble {
          background-color: var(--color-action-600);
          color: #FFFFFF;
          border-bottom-right-radius: 2px;
        }
        .officer-bubble {
          background-color: #FFFFFF;
          border: 1px solid #CBD5E1;
          color: var(--color-neutral-900);
          border-bottom-left-radius: 2px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .delivered-receipt {
          font-size: 0.7rem;
          color: #64748B;
          margin-top: 2px;
        }

        .typing-bubble {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          padding: 8px 14px;
          border-radius: var(--radius-pill);
          font-size: 0.8rem;
          color: var(--color-neutral-600);
        }
        .typing-dot {
          width: 6px;
          height: 6px;
          background: var(--color-action-600);
          border-radius: 50%;
          animation: typingPulse 1.2s infinite;
        }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typingPulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
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
