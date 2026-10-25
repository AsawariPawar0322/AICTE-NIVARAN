import React, { useEffect, useRef } from 'react';
import { translations, Language } from '../../locales/translations';
import { ConversationReader, DocumentRequest, EvidenceFile, UserAdminMessage } from '../../types';
import { formatFileSize } from '../../lib/evidence';
import { CheckCheck, Check, FileText, FileUp, ClipboardList, CalendarClock, Paperclip } from 'lucide-react';

interface MessageThreadProps {
  lang: Language;
  messages: UserAdminMessage[];
  viewer: ConversationReader;
  onUploadForRequest?: (requestId: string, files: FileList) => void;
  uploadingRequestId?: string | null;
  emptyText?: string;
}

const AttachmentList: React.FC<{ files: EvidenceFile[] }> = ({ files }) => (
  <ul className="msg-attachment-list">
    {files.map(f => (
      <li key={f.id} className="msg-attachment flex items-center gap-2">
        <FileText size={14} />
        <span className="msg-attachment-name">{f.name}</span>
        <span className="msg-attachment-meta">{formatFileSize(f.size)}</span>
        <code className="mono msg-attachment-hash" title={f.sha256Hash}>{f.sha256Hash.slice(0, 12)}…</code>
      </li>
    ))}
  </ul>
);

interface RequestCardProps {
  lang: Language;
  request: DocumentRequest;
  canUpload: boolean;
  isUploading: boolean;
  onUpload?: (requestId: string, files: FileList) => void;
}

const DocumentRequestCard: React.FC<RequestCardProps> = ({ lang, request, canUpload, isUploading, onUpload }) => {
  const t = translations[lang];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isPending = request.status === 'pending';

  return (
    <div className={`doc-request-card ${isPending ? 'doc-pending' : 'doc-fulfilled'}`}>
      <div className="doc-request-head flex items-center justify-between gap-2">
        <strong className="flex items-center gap-1">
          <ClipboardList size={16} />
          {t.requestDocsTitle}
        </strong>
        <span className={`status-chip ${isPending ? 'chip-warning' : 'chip-success'}`}>
          {isPending ? t.requestPending : t.requestFulfilled}
        </span>
      </div>
      <ul className="doc-request-items">
        {request.items.map(item => <li key={item}>{item}</li>)}
      </ul>
      {request.note && <p className="doc-request-note">{request.note}</p>}
      {request.dueDate && (
        <p className="doc-request-due flex items-center gap-1">
          <CalendarClock size={13} />
          {t.dueDate}: <strong>{request.dueDate}</strong>
        </p>
      )}
      {!isPending && request.fulfilledAt && (
        <p className="doc-request-due">
          {t.requestFulfilled}: {request.fulfilledAt} · {request.fulfilledFileIds?.length || 0} file(s)
        </p>
      )}
      {isPending && canUpload && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="visually-hidden-input"
            tabIndex={-1}
            aria-hidden="true"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) onUpload?.(request.id, e.target.files);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            className="btn btn-primary btn-sm mt-2 flex items-center gap-1"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <FileUp size={14} />
            <span>{isUploading ? t.uploading : t.uploadRequested}</span>
          </button>
        </>
      )}
    </div>
  );
};

export const MessageThread: React.FC<MessageThreadProps> = ({
  lang,
  messages,
  viewer,
  onUploadForRequest,
  uploadingRequestId,
  emptyText
}) => {
  const t = translations[lang];
  const bottomRef = useRef<HTMLDivElement>(null);
  const ownRole = viewer === 'complainant' ? 'complainant' : 'officer';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  return (
    <div className="thread-messages-area" aria-live="polite">
      {messages.length === 0 && (
        <p className="thread-empty-text">{emptyText || t.noMessagesYet}</p>
      )}

      {messages.map((m) => {
        if (m.kind === 'system' || m.senderRole === 'system') {
          return (
            <div key={m.id} className="thread-system-row">
              <div className="thread-system-bubble">
                <span>{m.content}</span>
                <span className="thread-time mono">{m.timestamp}</span>
              </div>
            </div>
          );
        }

        const isOwn = m.senderRole === ownRole;
        const seenByOther = viewer === 'complainant' ? m.readByOfficer : m.readByComplainant;

        return (
          <div key={m.id} className={`thread-row ${isOwn ? 'own-row' : 'other-row'}`}>
            <div className="thread-content-wrap">
              <div className="thread-sender-line flex items-center gap-2">
                <strong className="thread-sender-name">
                  {m.senderName}{isOwn ? ` (${t.youLabel})` : ''}
                </strong>
                {(m.kind === 'clarification' || m.isOfficialNote) && (
                  <span className="official-remark-tag">{t.officialRemark}</span>
                )}
                {m.kind === 'document_submission' && (
                  <span className="submission-tag flex items-center gap-1">
                    <Paperclip size={11} />
                    {t.requestFulfilled}
                  </span>
                )}
                <span className="thread-time mono">{m.timestamp}</span>
              </div>

              <div className={`thread-bubble ${isOwn ? 'own-bubble' : 'other-bubble'} ${m.kind === 'clarification' ? 'clarification-bubble' : ''}`}>
                {m.content && <p className="thread-text">{m.content}</p>}
                {m.attachments && m.attachments.length > 0 && <AttachmentList files={m.attachments} />}
              </div>

              {m.kind === 'document_request' && m.documentRequest && (
                <DocumentRequestCard
                  lang={lang}
                  request={m.documentRequest}
                  canUpload={viewer === 'complainant'}
                  isUploading={uploadingRequestId === m.documentRequest.id}
                  onUpload={onUploadForRequest}
                />
              )}

              {isOwn && (
                <div className="thread-receipt flex items-center justify-end gap-1">
                  {seenByOther ? <CheckCheck size={14} className="text-blue" /> : <Check size={14} />}
                  <span>{seenByOther ? t.msgSeen : t.msgDelivered}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />

      <style>{`
        .thread-messages-area {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: #FAFBFD;
          min-height: 0;
        }
        .thread-empty-text {
          margin: auto;
          color: var(--color-neutral-600);
          font-size: 0.875rem;
        }
        .thread-system-row {
          text-align: center;
          margin: 4px 0;
        }
        .thread-system-bubble {
          display: inline-block;
          background: #F1F5F9;
          border: 1px solid #E2E8F0;
          border-radius: var(--radius-md);
          padding: 8px 16px;
          max-width: 80%;
          font-size: 0.8125rem;
          color: #475569;
        }
        .thread-system-bubble .thread-time {
          display: block;
          margin-top: 2px;
        }
        .thread-row {
          display: flex;
          width: 100%;
        }
        .own-row {
          justify-content: flex-end;
        }
        .other-row {
          justify-content: flex-start;
        }
        .thread-content-wrap {
          max-width: 75%;
        }
        .thread-sender-line {
          font-size: 0.75rem;
          margin-bottom: 4px;
          flex-wrap: wrap;
        }
        .own-row .thread-sender-line {
          justify-content: flex-end;
        }
        .thread-sender-name {
          color: var(--color-navy-900);
        }
        .official-remark-tag {
          font-size: 0.68rem;
          font-weight: 700;
          background: #FEF3C7;
          color: #B45309;
          padding: 1px 5px;
          border-radius: 2px;
        }
        .submission-tag {
          font-size: 0.68rem;
          font-weight: 700;
          background: var(--color-success-bg);
          color: var(--color-success-text);
          padding: 1px 5px;
          border-radius: 2px;
        }
        .thread-time {
          color: #94A3B8;
          font-size: 0.7rem;
        }
        .thread-bubble {
          padding: 12px 16px;
          border-radius: var(--radius-md);
          font-size: 0.9rem;
          line-height: 1.45;
        }
        .own-bubble {
          background-color: var(--color-action-600);
          color: #FFFFFF;
          border-bottom-right-radius: 2px;
        }
        .other-bubble {
          background-color: #FFFFFF;
          border: 1px solid #CBD5E1;
          color: var(--color-neutral-900);
          border-bottom-left-radius: 2px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .clarification-bubble.other-bubble {
          border-color: #FCD34D;
          background-color: #FFFBEB;
        }
        .clarification-bubble.own-bubble {
          box-shadow: inset 4px 0 0 #FCD34D;
        }
        .thread-text {
          white-space: pre-wrap;
        }
        .msg-attachment-list {
          list-style: none;
          margin-top: 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .msg-attachment {
          font-size: 0.78rem;
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(148, 163, 184, 0.5);
          border-radius: var(--radius-sm);
          padding: 4px 8px;
          flex-wrap: wrap;
        }
        .other-bubble .msg-attachment {
          background: #F8FAFC;
        }
        .msg-attachment-name {
          font-weight: 600;
          word-break: break-all;
        }
        .msg-attachment-meta, .msg-attachment-hash {
          opacity: 0.8;
          font-size: 0.72rem;
        }
        .doc-request-card {
          margin-top: 8px;
          border-radius: var(--radius-md);
          padding: 12px 14px;
          font-size: 0.85rem;
          background: #FFFFFF;
          color: var(--color-neutral-900);
        }
        .doc-pending {
          border: 1px solid #FCD34D;
          border-left: 4px solid #F59E0B;
        }
        .doc-fulfilled {
          border: 1px solid var(--color-success-border);
          border-left: 4px solid var(--color-success-text);
        }
        .doc-request-card .btn-sm {
          min-height: 32px;
          padding: 4px 10px;
          font-size: 0.8rem;
        }
        .doc-request-head {
          color: var(--color-navy-900);
          margin-bottom: 6px;
        }
        .doc-request-items {
          margin: 4px 0 6px 20px;
        }
        .doc-request-note {
          color: var(--color-neutral-700);
          font-style: italic;
          margin-bottom: 4px;
        }
        .doc-request-due {
          color: var(--color-neutral-600);
          font-size: 0.78rem;
        }
        .thread-receipt {
          font-size: 0.7rem;
          color: #64748B;
          margin-top: 2px;
        }
        @media (max-width: 768px) {
          .thread-content-wrap {
            max-width: 90%;
          }
        }
      `}</style>
    </div>
  );
};
