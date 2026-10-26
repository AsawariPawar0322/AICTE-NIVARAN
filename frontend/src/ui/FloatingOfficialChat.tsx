// ==========================================================================
// NIVARAN · Floating Official Quick-Chat FAB (FloatingOfficialChat.tsx)
// Fixes Defect D1: Unmounted for visitors & closes immediately on logout
// Fixes Defect D5: Scoped disclaimer font size
// ==========================================================================

import React, { useState } from 'react';
import { useApp } from '../app/AppProviders';
import { addMessageToComplaint } from '../api/complaints';
import { Icon } from './Icon';
import { Button } from './Button';
import { DocketId } from './DocketId';
import styles from './ui.module.css';

export const FloatingOfficialChat: React.FC = () => {
  const { currentUser, complaints, isFloatingChatOpen, setIsFloatingChatOpen, refreshData } = useApp();
  const [activeCaseIndex, setActiveCaseIndex] = useState(0);
  const [inputText, setInputText] = useState('');

  // Fix D1: Never render for visitors or citizen accounts
  if (!currentUser || currentUser.portalType !== 'official') {
    return null;
  }

  const activeCases = complaints.slice(0, 4);
  const currentCase = activeCases[activeCaseIndex] || complaints[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    addMessageToComplaint(currentCase.id, {
      senderRole: 'officer',
      senderName: currentUser.name,
      content: inputText.trim(),
      isOfficialNote: true
    });

    setInputText('');
    refreshData();
  };

  return (
    <div style={{ position: 'fixed', bottom: 'var(--sp-6)', right: 'var(--sp-6)', zIndex: 9999 }}>
      {/* Chat Window */}
      {isFloatingChatOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: '64px',
            right: 0,
            width: '380px',
            height: '520px',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--rad-lg)',
            boxShadow: 'var(--shadow-3)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: 'var(--sp-3) var(--sp-4)',
              backgroundColor: 'var(--navy-900)',
              color: '#FFFFFF',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 'var(--fs-sm)' }}>Officer Redressal Dispatch</div>
              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.75)' }}>
                {currentUser.name} ({currentUser.bureau})
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsFloatingChatOpen(false)}
              style={{ color: '#FFFFFF', padding: '4px', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>

          {/* Active Docket Switcher */}
          <div
            style={{
              padding: 'var(--sp-2) var(--sp-3)',
              backgroundColor: 'var(--navy-50)',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              gap: 'var(--sp-2)',
              overflowX: 'auto'
            }}
          >
            {activeCases.map((c, idx) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveCaseIndex(idx)}
                style={{
                  padding: '2px 8px',
                  borderRadius: 'var(--rad-sm)',
                  backgroundColor: activeCaseIndex === idx ? 'var(--navy-900)' : 'var(--surface)',
                  color: activeCaseIndex === idx ? '#FFFFFF' : 'var(--text)',
                  border: '1px solid var(--border)',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {c.id}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div style={{ flex: 1, padding: 'var(--sp-4)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
            {currentCase.messages.map(m => (
              <div
                key={m.id}
                style={{
                  padding: 'var(--sp-2) var(--sp-3)',
                  borderRadius: 'var(--rad-sm)',
                  backgroundColor: m.senderRole === 'officer' ? 'var(--navy-50)' : 'var(--action-tint)',
                  border: '1px solid var(--border)',
                  fontSize: 'var(--fs-xs)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <strong>{m.senderName}</strong>
                  <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{m.timestamp}</span>
                </div>
                <p style={{ margin: 0 }}>{m.content}</p>
              </div>
            ))}
          </div>

          {/* Fix D5: Scoped official disclaimer box font-size at 0.7rem */}
          <div
            className="official-disclaimer-box"
            style={{
              padding: '4px var(--sp-3)',
              backgroundColor: 'var(--bg)',
              borderTop: '1px solid var(--border-light)'
            }}
          >
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.3 }}>
              Statutory inquiries logged here are visible in the docket timeline.
            </p>
          </div>

          {/* Input Box */}
          <form onSubmit={handleSendMessage} style={{ padding: 'var(--sp-3)', borderTop: '1px solid var(--border)', display: 'flex', gap: 'var(--sp-2)' }}>
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Type official dispatch..."
              className={styles.input}
              style={{ minHeight: '36px', fontSize: 'var(--fs-xs)' }}
              required
            />
            <Button variant="primary" size="sm">
              Send
            </Button>
          </form>
        </div>
      )}

      {/* 52px Circular FAB Trigger */}
      <button
        type="button"
        onClick={() => setIsFloatingChatOpen(!isFloatingChatOpen)}
        aria-label="Toggle official redressal chat"
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          backgroundColor: 'var(--navy-900)',
          color: '#FFFFFF',
          border: '2px solid var(--india-saffron)',
          boxShadow: 'var(--shadow-2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
      >
        <Icon name="chat" size={24} weight="fill" />
      </button>
    </div>
  );
};
