import React, { useEffect, useState } from 'react';
import { translations, Language } from '../locales/translations';
import { MessageThread } from '../components/chat/MessageThread';
import {
  Complaint,
  ConversationMap,
  ConversationReader,
  DocumentRequest,
  StageKey,
  UserAdminMessage
} from '../types';
import {
  Inbox,
  Search,
  Send,
  ClipboardList,
  MessageSquareQuote,
  Reply,
  ArrowLeft,
  ArrowRight,
  Building2,
  Clock,
  FileText,
  User
} from 'lucide-react';

interface AdminInboxViewProps {
  lang: Language;
  complaints: Complaint[];
  conversations: ConversationMap;
  selectedComplaintId: string | null;
  officialName: string | null;
  onSelectComplaint: (complaintId: string) => void;
  onOpenFullCase: (complaintId: string) => void;
  onSendMessage: (complaintId: string, msg: UserAdminMessage) => void;
  onRequestDocuments: (
    complaintId: string,
    officerName: string,
    request: Omit<DocumentRequest, 'id' | 'status'>,
    message: string
  ) => void;
  onAddClarification: (complaintId: string, officerName: string, text: string) => void;
  onMarkThreadRead: (complaintId: string, reader: ConversationReader) => void;
  // Rendered inside another page's container (Administration portal)
  embedded?: boolean;
}

type InboxFilter = 'ALL' | 'UNREAD' | 'AWAITING' | 'DOCS_PENDING';
type ComposerMode = 'reply' | 'request' | 'clarify';

const STAGE_LABELS: Record<StageKey, string> = {
  REGISTERED: 'Registered',
  ALLOTTED: 'Bureau Allotment',
  INVESTIGATION: 'Inquiry & Evidence',
  RESOLUTION_PROPOSED: 'ATR Resolution',
  PENDING_OTP: 'Citizen OTP Verify',
  RESOLVED: 'Resolved',
  ESCALATED: 'Escalated'
};

const stageChipClass = (stage: StageKey) => {
  if (stage === 'RESOLVED') return 'chip-success';
  if (stage === 'ESCALATED') return 'chip-danger';
  if (stage === 'PENDING_OTP') return 'chip-warning';
  return 'chip-info';
};

const DOCUMENT_TYPES = [
  'Fee payment receipt',
  'Bank statement / passbook',
  'Identity proof (Aadhaar / college ID)',
  'Admission / allotment letter',
  'Seat surrender acknowledgement',
  'Written reply received from institute'
];

const QUICK_REPLIES = [
  'Thank you, this has been noted and forwarded to the institute nodal officer.',
  'Your case is under active review. You will receive an update within the SLA window.',
  'Could you share any written communication you received from the institute?'
];

const defaultDueDateIso = () => {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  return d.toISOString().slice(0, 10);
};

const formatDueDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

export const AdminInboxView: React.FC<AdminInboxViewProps> = ({
  lang,
  complaints,
  conversations,
  selectedComplaintId,
  officialName,
  onSelectComplaint,
  onOpenFullCase,
  onSendMessage,
  onRequestDocuments,
  onAddClarification,
  onMarkThreadRead,
  embedded = false
}) => {
  const t = translations[lang];
  const [filter, setFilter] = useState<InboxFilter>('ALL');
  const [search, setSearch] = useState('');
  const [mobileView, setMobileView] = useState<'list' | 'thread'>('list');

  const [mode, setMode] = useState<ComposerMode>('reply');
  const [replyText, setReplyText] = useState('');
  const [clarifyText, setClarifyText] = useState('');
  const [docItems, setDocItems] = useState<string[]>([]);
  const [otherDoc, setOtherDoc] = useState('');
  const [docNote, setDocNote] = useState('');
  const [dueDateIso, setDueDateIso] = useState(defaultDueDateIso());

  // One summary per complaint conversation
  const summaries = complaints.map((c, order) => {
    const thread = conversations[c.id] || [];
    const lastFromParty = [...thread].reverse().find(m => m.senderRole !== 'system');
    return {
      complaint: c,
      order,
      lastMessage: thread[thread.length - 1],
      unread: thread.filter(m => !m.readByOfficer).length,
      awaitingReply: lastFromParty?.senderRole === 'complainant',
      pendingRequests: thread.filter(m => m.documentRequest?.status === 'pending').length
    };
  });

  const counts = {
    ALL: summaries.length,
    UNREAD: summaries.filter(s => s.unread > 0).length,
    AWAITING: summaries.filter(s => s.awaitingReply).length,
    DOCS_PENDING: summaries.filter(s => s.pendingRequests > 0).length
  };

  const q = search.trim().toLowerCase();
  const visible = summaries
    .filter(s => {
      if (filter === 'UNREAD') return s.unread > 0;
      if (filter === 'AWAITING') return s.awaitingReply;
      if (filter === 'DOCS_PENDING') return s.pendingRequests > 0;
      return true;
    })
    .filter(s =>
      !q ||
      s.complaint.id.toLowerCase().includes(q) ||
      s.complaint.complainantName.toLowerCase().includes(q) ||
      s.complaint.institutionName.toLowerCase().includes(q)
    )
    .sort((a, b) =>
      Number(b.unread > 0) - Number(a.unread > 0) ||
      Number(b.awaitingReply) - Number(a.awaitingReply) ||
      a.order - b.order
    );

  const selected = complaints.find(c => c.id === selectedComplaintId) || null;
  const thread = selected ? conversations[selected.id] || [] : [];
  const officerName = officialName ?? selected?.assignedOfficer.name ?? 'AICTE Officer';
  const pendingRequests = thread.filter(m => m.documentRequest?.status === 'pending');

  // Opening a thread (or receiving a message while it is open) marks it read for the officer
  const selectedHasUnread = thread.some(m => !m.readByOfficer);
  useEffect(() => {
    if (selectedComplaintId && selectedHasUnread) onMarkThreadRead(selectedComplaintId, 'officer');
  }, [selectedComplaintId, selectedHasUnread, onMarkThreadRead]);

  const openConversation = (complaintId: string) => {
    onSelectComplaint(complaintId);
    setMobileView('thread');
  };

  const handleSendReply = (text?: string) => {
    const content = (text ?? replyText).trim();
    if (!selected || !content) return;
    onSendMessage(selected.id, {
      id: `msg-${Date.now()}`,
      complaintId: selected.id,
      kind: 'text',
      senderRole: 'officer',
      senderName: officerName,
      content,
      timestamp: 'Just now',
      readByOfficer: true,
      readByComplainant: false
    });
    if (text === undefined) setReplyText('');
  };

  const handleSendClarification = () => {
    const content = clarifyText.trim();
    if (!selected || !content) return;
    onAddClarification(selected.id, officerName, content);
    setClarifyText('');
  };

  const requestedItems = [...docItems, ...(otherDoc.trim() ? [otherDoc.trim()] : [])];

  const handleSendRequest = () => {
    if (!selected || requestedItems.length === 0) return;
    onRequestDocuments(
      selected.id,
      officerName,
      {
        items: requestedItems,
        note: docNote.trim() || undefined,
        dueDate: dueDateIso ? formatDueDate(dueDateIso) : undefined
      },
      'Please upload the documents listed below so that we can proceed with your case.'
    );
    setDocItems([]);
    setOtherDoc('');
    setDocNote('');
    setDueDateIso(defaultDueDateIso());
  };

  const toggleDocItem = (item: string) => {
    setDocItems(prev => (prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]));
  };

  const filterButtons: { key: InboxFilter; label: string }[] = [
    { key: 'ALL', label: t.filterAll },
    { key: 'UNREAD', label: t.filterUnread },
    { key: 'AWAITING', label: t.filterAwaiting },
    { key: 'DOCS_PENDING', label: t.filterDocsPending }
  ];

  return (
    <div className={`inbox-page-container ${embedded ? 'is-embedded' : ''}`} id={embedded ? undefined : 'main-content'}>
      <div className={embedded ? undefined : 'container'}>
        <div className="inbox-page-head flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="inbox-head-icon"><Inbox size={22} /></div>
            <div>
              <h2 className="inbox-title">{t.inboxTitle}</h2>
              <p className="inbox-subtitle">{t.inboxSubtitle}</p>
            </div>
          </div>
          <span className="inbox-signed-in flex items-center gap-1">
            <User size={14} />
            {officialName ?? 'Assigned case officers'}
          </span>
        </div>

        <div className="inbox-layout" data-mobile-view={mobileView}>
          {/* Conversation List */}
          <section className="inbox-list-col" aria-label={t.inboxTitle}>
            <div className="inbox-search-wrap">
              <Search size={15} className="inbox-search-icon" />
              <input
                type="search"
                className="input-control inbox-search-input"
                placeholder={t.inboxSearch}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label={t.inboxSearch}
              />
            </div>
            <div className="inbox-filter-row flex flex-wrap gap-1" role="group" aria-label="Filter conversations">
              {filterButtons.map(f => (
                <button
                  key={f.key}
                  type="button"
                  className={`inbox-filter-chip ${filter === f.key ? 'active' : ''}`}
                  aria-pressed={filter === f.key}
                  onClick={() => setFilter(f.key)}
                >
                  {f.label} <span className="inbox-filter-count">{counts[f.key]}</span>
                </button>
              ))}
            </div>

            <ul className="inbox-conversation-list">
              {visible.length === 0 && <li className="inbox-empty">{t.noResults}</li>}
              {visible.map(s => {
                const c = s.complaint;
                const isActive = c.id === selectedComplaintId;
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      className={`inbox-row ${isActive ? 'active' : ''} ${s.unread > 0 ? 'has-unread' : ''}`}
                      aria-current={isActive ? 'true' : undefined}
                      onClick={() => openConversation(c.id)}
                    >
                      <div className="inbox-row-top flex items-center justify-between gap-2">
                        <strong className="inbox-row-name">
                          {s.unread > 0 && <span className="unread-dot" aria-hidden="true" />}
                          {c.complainantName}
                        </strong>
                        <span className="inbox-row-time mono">{s.lastMessage?.timestamp || ''}</span>
                      </div>
                      <div className="inbox-row-meta flex items-center gap-2">
                        <code className="mono">{c.id.slice(-5)}</code>
                        <span className={`status-chip ${stageChipClass(c.currentStage)}`}>{STAGE_LABELS[c.currentStage]}</span>
                        {s.pendingRequests > 0 && (
                          <span className="inbox-docs-pill" title={t.pendingRequestsLabel}>
                            <ClipboardList size={11} /> {s.pendingRequests}
                          </span>
                        )}
                      </div>
                      <div className="inbox-row-bottom flex items-center justify-between gap-2">
                        <span className="inbox-row-preview">
                          {s.lastMessage ? s.lastMessage.content : t.noMessagesYet}
                        </span>
                        {s.unread > 0 && (
                          <span className="inbox-unread-count" aria-label={`${s.unread} ${t.filterUnread}`}>
                            {s.unread}
                          </span>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Thread + Composer */}
          <section className="inbox-thread-col" aria-label="Conversation">
            {selected ? (
              <>
                <div className="inbox-thread-head flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="btn btn-outline btn-sm inbox-back-btn"
                      onClick={() => setMobileView('list')}
                    >
                      <ArrowLeft size={14} />
                      <span>{t.backToList}</span>
                    </button>
                    <div>
                      <strong className="inbox-thread-name">{selected.complainantName}</strong>
                      <span className="inbox-thread-sub mono">{selected.id}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm flex items-center gap-1"
                    onClick={() => onOpenFullCase(selected.id)}
                  >
                    <span>{t.openFullCase}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

                <MessageThread lang={lang} messages={thread} viewer="officer" />

                {/* Composer */}
                <div className="inbox-composer">
                  <div className="composer-mode-tabs flex gap-1" role="tablist" aria-label="Message type">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={mode === 'reply'}
                      className={`composer-mode-tab ${mode === 'reply' ? 'active' : ''}`}
                      onClick={() => setMode('reply')}
                    >
                      <Reply size={14} /> {t.modeReply}
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={mode === 'request'}
                      className={`composer-mode-tab ${mode === 'request' ? 'active' : ''}`}
                      onClick={() => setMode('request')}
                    >
                      <ClipboardList size={14} /> {t.modeRequestDocs}
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={mode === 'clarify'}
                      className={`composer-mode-tab ${mode === 'clarify' ? 'active' : ''}`}
                      onClick={() => setMode('clarify')}
                    >
                      <MessageSquareQuote size={14} /> {t.modeClarify}
                    </button>
                  </div>

                  {mode === 'reply' && (
                    <div className="composer-body">
                      <div className="composer-quick-row flex items-center gap-2">
                        <span className="composer-quick-label">{t.quickReplies}:</span>
                        {QUICK_REPLIES.map(r => (
                          <button key={r} type="button" className="composer-quick-chip" onClick={() => handleSendReply(r)}>
                            {r}
                          </button>
                        ))}
                      </div>
                      <div className="composer-input-row flex gap-2">
                        <textarea
                          className="input-control composer-textarea"
                          rows={2}
                          placeholder={t.typeMessage}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSendReply();
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn-primary flex items-center gap-1"
                          disabled={!replyText.trim()}
                          onClick={() => handleSendReply()}
                        >
                          <Send size={16} />
                          <span>{t.send}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {mode === 'clarify' && (
                    <div className="composer-body">
                      <div className="composer-input-row flex gap-2">
                        <textarea
                          className="input-control composer-textarea"
                          rows={3}
                          placeholder="State the clarification to be recorded as an official remark..."
                          value={clarifyText}
                          onChange={(e) => setClarifyText(e.target.value)}
                        />
                        <button
                          type="button"
                          className="btn btn-primary flex items-center gap-1"
                          disabled={!clarifyText.trim()}
                          onClick={handleSendClarification}
                        >
                          <MessageSquareQuote size={16} />
                          <span>{t.issueClarification}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {mode === 'request' && (
                    <div className="composer-body">
                      <fieldset className="doc-type-grid">
                        <legend className="visually-hidden-input">{t.modeRequestDocs}</legend>
                        {DOCUMENT_TYPES.map(item => (
                          <label key={item} className="doc-type-option flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={docItems.includes(item)}
                              onChange={() => toggleDocItem(item)}
                            />
                            <span>{item}</span>
                          </label>
                        ))}
                      </fieldset>
                      <div className="doc-extra-row grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          className="input-control"
                          placeholder={t.otherDoc}
                          aria-label={t.otherDoc}
                          value={otherDoc}
                          onChange={(e) => setOtherDoc(e.target.value)}
                        />
                        <label className="doc-due-label flex items-center gap-2">
                          <span>{t.dueDate}</span>
                          <input
                            type="date"
                            className="input-control"
                            value={dueDateIso}
                            onChange={(e) => setDueDateIso(e.target.value)}
                          />
                        </label>
                      </div>
                      <div className="composer-input-row flex gap-2">
                        <textarea
                          className="input-control composer-textarea composer-textarea-sm"
                          rows={1}
                          placeholder={t.docNote}
                          aria-label={t.docNote}
                          value={docNote}
                          onChange={(e) => setDocNote(e.target.value)}
                        />
                        <button
                          type="button"
                          className="btn btn-primary flex items-center gap-1"
                          disabled={requestedItems.length === 0}
                          onClick={handleSendRequest}
                        >
                          <ClipboardList size={16} />
                          <span>{t.sendRequest}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <p className="inbox-no-selection">{t.noConversation}</p>
            )}
          </section>

          {/* Complaint Summary Panel */}
          {selected && (
            <aside className="inbox-panel-col" aria-label={t.caseSummary}>
              <h3 className="panel-title">{t.caseSummary}</h3>
              <code className="mono panel-case-id">{selected.id}</code>
              <p className="panel-case-title">{selected.title}</p>

              <div className="panel-chip-row flex flex-wrap gap-1">
                <span className={`status-chip ${stageChipClass(selected.currentStage)}`}>
                  {selected.currentStage !== 'ESCALATED' ? `${selected.stageNumber}. ` : ''}
                  {STAGE_LABELS[selected.currentStage]}
                </span>
                <span className="status-chip chip-info">{selected.categoryLabel}</span>
              </div>

              <dl className="panel-facts">
                <div>
                  <dt><User size={13} /> Complainant</dt>
                  <dd>{selected.complainantName} · {selected.complainantRole}</dd>
                </div>
                <div>
                  <dt><Building2 size={13} /> Institution</dt>
                  <dd>{selected.institutionName} <code className="mono">({selected.aictePermanentId})</code></dd>
                </div>
                <div>
                  <dt><Clock size={13} /> SLA</dt>
                  <dd>{selected.currentStage === 'RESOLVED' ? 'Closed' : `${selected.slaHoursRemaining} hours remaining`}</dd>
                </div>
              </dl>

              <h4 className="panel-sub-title">{t.evidenceLabel} ({selected.evidenceList.length})</h4>
              <ul className="panel-evidence-list">
                {selected.evidenceList.map(ev => (
                  <li key={ev.id} className="flex items-center gap-1">
                    <FileText size={12} />
                    <span title={ev.sha256Hash}>{ev.name}</span>
                  </li>
                ))}
              </ul>

              {pendingRequests.length > 0 && (
                <>
                  <h4 className="panel-sub-title">{t.pendingRequestsLabel} ({pendingRequests.length})</h4>
                  <ul className="panel-evidence-list">
                    {pendingRequests.map(m => (
                      <li key={m.id}>
                        {m.documentRequest?.items.join(', ')}
                        {m.documentRequest?.dueDate ? ` · ${t.dueDate}: ${m.documentRequest.dueDate}` : ''}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <h4 className="panel-sub-title">{t.recentActivity}</h4>
              <ol className="panel-timeline">
                {selected.timeline.slice(-3).reverse().map(evt => (
                  <li key={evt.id}>
                    <strong>{evt.title}</strong>
                    <span>{evt.actor} · {evt.timestamp}</span>
                  </li>
                ))}
              </ol>

              <button
                type="button"
                className="btn btn-secondary btn-sm panel-open-btn flex items-center gap-1"
                onClick={() => onOpenFullCase(selected.id)}
              >
                <span>{t.openFullCase}</span>
                <ArrowRight size={14} />
              </button>
            </aside>
          )}
        </div>
      </div>

      <style>{`
        .inbox-page-container {
          padding: 28px 0 64px 0;
        }
        .inbox-page-container.is-embedded {
          padding: 8px 0 0 0;
        }
        .inbox-page-container .flex-wrap {
          flex-wrap: wrap;
        }
        .inbox-page-container .btn-sm {
          min-height: 32px;
          padding: 4px 10px;
          font-size: 0.8rem;
        }
        .inbox-page-head {
          margin-bottom: 16px;
        }
        .inbox-head-icon {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--color-brand-blue-100);
          color: var(--color-brand-blue-600);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .inbox-title {
          color: var(--color-navy-900);
        }
        .inbox-subtitle {
          font-size: 0.85rem;
          color: var(--color-neutral-600);
        }
        .inbox-signed-in {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--color-navy-900);
          background: #FFFFFF;
          border: 1px solid var(--color-neutral-300);
          border-radius: var(--radius-pill);
          padding: 4px 10px;
        }

        .inbox-layout {
          display: grid;
          grid-template-columns: 300px minmax(0, 1fr) 280px;
          background: #FFFFFF;
          border: 1px solid var(--color-neutral-300);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }
        .inbox-list-col,
        .inbox-thread-col,
        .inbox-panel-col {
          height: 680px;
          min-width: 0;
        }
        .inbox-list-col {
          display: flex;
          flex-direction: column;
          border-right: 1px solid var(--color-neutral-300);
          background: #FFFFFF;
        }
        .inbox-search-wrap {
          position: relative;
          padding: 12px 12px 8px 12px;
        }
        .inbox-search-icon {
          position: absolute;
          left: 22px;
          top: 50%;
          transform: translateY(-30%);
          color: var(--color-neutral-400);
        }
        .inbox-search-input {
          width: 100%;
          padding-left: 32px;
          font-size: 0.85rem;
        }
        .inbox-filter-row {
          padding: 0 12px 10px 12px;
          border-bottom: 1px solid var(--color-neutral-200);
        }
        .inbox-filter-chip {
          font-size: 0.75rem;
          font-weight: 600;
          background: var(--color-neutral-100);
          border: 1px solid var(--color-neutral-300);
          color: var(--color-neutral-700);
          border-radius: var(--radius-pill);
          padding: 3px 9px;
          cursor: pointer;
          white-space: nowrap;
        }
        .inbox-filter-chip.active {
          background: var(--color-navy-900);
          border-color: var(--color-navy-900);
          color: #FFFFFF;
        }
        .inbox-filter-count {
          opacity: 0.75;
          margin-left: 2px;
        }
        .inbox-conversation-list {
          list-style: none;
          overflow-y: auto;
          flex: 1;
        }
        .inbox-empty {
          padding: 24px 16px;
          font-size: 0.85rem;
          color: var(--color-neutral-600);
          text-align: center;
        }
        .inbox-row {
          width: 100%;
          text-align: left;
          background: #FFFFFF;
          border: none;
          border-bottom: 1px solid var(--color-neutral-200);
          border-left: 3px solid transparent;
          padding: 10px 12px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-family: var(--font-sans);
        }
        .inbox-row:hover {
          background: var(--color-neutral-100);
        }
        .inbox-row.active {
          background: var(--color-brand-blue-100);
          border-left-color: var(--color-brand-blue-600);
        }
        .inbox-row-name {
          font-size: 0.875rem;
          color: var(--color-navy-900);
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .inbox-row:not(.has-unread) .inbox-row-name {
          font-weight: 600;
        }
        .unread-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--color-action-600);
          flex-shrink: 0;
        }
        .inbox-row-time {
          font-size: 0.68rem;
          color: var(--color-neutral-600);
          white-space: nowrap;
        }
        .inbox-row-meta {
          font-size: 0.72rem;
        }
        .inbox-row-meta .status-chip {
          font-size: 0.68rem;
          padding: 1px 6px;
        }
        .inbox-docs-pill {
          display: inline-flex;
          align-items: center;
          gap: 2px;
          font-size: 0.68rem;
          font-weight: 700;
          color: #B45309;
          background: #FEF3C7;
          border-radius: var(--radius-pill);
          padding: 1px 6px;
        }
        .inbox-row-preview {
          font-size: 0.78rem;
          color: var(--color-neutral-600);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          min-width: 0;
          flex: 1;
        }
        .has-unread .inbox-row-preview {
          color: var(--color-neutral-900);
          font-weight: 600;
        }
        .inbox-unread-count {
          background: var(--color-action-600);
          color: #FFFFFF;
          font-size: 0.68rem;
          font-weight: 800;
          border-radius: var(--radius-pill);
          padding: 1px 7px;
        }

        .inbox-thread-col {
          display: flex;
          flex-direction: column;
          background: #FAFBFD;
        }
        .inbox-thread-head {
          padding: 12px 16px;
          background: #F8FAFC;
          border-bottom: 1px solid var(--color-neutral-300);
        }
        .inbox-thread-name {
          display: block;
          color: var(--color-navy-900);
          font-size: 0.95rem;
        }
        .inbox-thread-sub {
          font-size: 0.75rem;
          color: var(--color-neutral-600);
        }
        .inbox-back-btn {
          display: none;
        }
        .inbox-no-selection {
          margin: auto;
          color: var(--color-neutral-600);
          font-size: 0.9rem;
        }

        .inbox-composer {
          border-top: 1px solid var(--color-neutral-300);
          background: #FFFFFF;
          padding: 8px 12px 12px 12px;
        }
        .composer-mode-tabs {
          margin-bottom: 8px;
          flex-wrap: wrap;
        }
        .composer-mode-tab {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.78rem;
          font-weight: 600;
          background: transparent;
          border: 1px solid var(--color-neutral-300);
          color: var(--color-neutral-700);
          border-radius: var(--radius-sm);
          padding: 4px 10px;
          cursor: pointer;
          font-family: var(--font-sans);
        }
        .composer-mode-tab.active {
          background: var(--color-brand-blue-600);
          border-color: var(--color-brand-blue-600);
          color: #FFFFFF;
        }
        .composer-body {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .composer-quick-row {
          overflow-x: auto;
          padding-bottom: 2px;
        }
        .composer-quick-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--color-neutral-600);
          white-space: nowrap;
        }
        .composer-quick-chip {
          background: var(--color-neutral-100);
          border: 1px solid var(--color-neutral-300);
          color: var(--color-neutral-700);
          font-size: 0.72rem;
          border-radius: var(--radius-pill);
          padding: 2px 9px;
          white-space: nowrap;
          cursor: pointer;
        }
        .composer-quick-chip:hover {
          border-color: var(--color-brand-blue-600);
          color: var(--color-brand-blue-600);
        }
        .composer-input-row {
          align-items: flex-end;
        }
        .composer-input-row .btn {
          flex-shrink: 0;
        }
        textarea.composer-textarea {
          flex: 1;
          resize: vertical;
          height: 64px;
          min-height: 44px;
          max-height: 160px;
          font-family: var(--font-sans);
          font-size: 0.875rem;
        }
        textarea.composer-textarea-sm {
          height: 44px;
        }
        .doc-type-grid {
          border: none;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 4px 12px;
        }
        .doc-type-option {
          font-size: 0.8rem;
          color: var(--color-neutral-900);
          cursor: pointer;
        }
        .doc-due-label {
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--color-neutral-700);
          white-space: nowrap;
        }
        .doc-due-label .input-control {
          flex: 1;
        }

        .inbox-panel-col {
          border-left: 1px solid var(--color-neutral-300);
          background: #F8FAFC;
          padding: 16px 16px 24px 16px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .panel-title {
          font-size: 0.95rem;
          color: var(--color-navy-900);
        }
        .panel-case-id {
          font-size: 0.8rem;
          color: var(--color-brand-blue-600);
          font-weight: 700;
        }
        .panel-case-title {
          font-size: 0.85rem;
          font-weight: 600;
          line-height: 1.35;
        }
        .panel-chip-row .status-chip {
          font-size: 0.7rem;
        }
        .panel-facts {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 0.8rem;
        }
        .panel-facts dt {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--color-neutral-600);
        }
        .panel-facts dd {
          color: var(--color-neutral-900);
        }
        .panel-sub-title {
          font-size: 0.78rem;
          color: var(--color-navy-900);
          margin-top: 6px;
        }
        .panel-evidence-list {
          list-style: none;
          font-size: 0.78rem;
          color: var(--color-neutral-700);
          display: flex;
          flex-direction: column;
          gap: 3px;
          word-break: break-word;
        }
        .panel-timeline {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 6px;
          border-left: 2px solid var(--color-neutral-300);
          padding-left: 10px;
        }
        .panel-timeline li {
          display: flex;
          flex-direction: column;
          font-size: 0.75rem;
        }
        .panel-timeline strong {
          color: var(--color-neutral-900);
        }
        .panel-timeline span {
          color: var(--color-neutral-600);
          font-size: 0.7rem;
        }
        .panel-open-btn {
          margin-top: 8px;
          align-self: flex-start;
        }

        @media (max-width: 1100px) {
          .inbox-layout {
            grid-template-columns: 260px minmax(0, 1fr);
          }
          .inbox-panel-col {
            grid-column: 1 / -1;
            height: auto;
            border-left: none;
            border-top: 1px solid var(--color-neutral-300);
          }
        }
        @media (max-width: 768px) {
          .inbox-layout {
            grid-template-columns: minmax(0, 1fr);
          }
          .inbox-list-col,
          .inbox-thread-col {
            height: 620px;
            border-right: none;
          }
          .inbox-layout[data-mobile-view="list"] .inbox-thread-col,
          .inbox-layout[data-mobile-view="list"] .inbox-panel-col {
            display: none;
          }
          .inbox-layout[data-mobile-view="thread"] .inbox-list-col {
            display: none;
          }
          .inbox-back-btn {
            display: inline-flex;
          }
          .doc-type-grid,
          .doc-extra-row {
            grid-template-columns: minmax(0, 1fr);
          }
        }
      `}</style>
    </div>
  );
};
