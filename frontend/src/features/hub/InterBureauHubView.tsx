// ==========================================================================
// NIVARAN · Inter-Bureau Coordination Hub (InterBureauHubView.tsx)
// Calm, trustworthy government console for cross-bureau coordination
// ==========================================================================

import React, { useState } from 'react';
import { useApp } from '../../app/AppProviders';
import { Icon } from '../../ui/Icon';
import { Button } from '../../ui/Button';
import styles from '../../ui/ui.module.css';

interface BureauChannel {
  id: string;
  name: string;
  bureau: string;
  description: string;
  unreadCount?: number;
}

const CHANNELS: BureauChannel[] = [
  {
    id: 'ch-pgrc-general',
    name: '#pgrc-central-triage',
    bureau: 'Central PGRC Bureau',
    description: 'Central intake triage, statutory jurisdiction checks, and SLA oversight'
  },
  {
    id: 'ch-wro-mumbai',
    name: '#western-regional-office',
    bureau: 'Western Regional Office (WRO)',
    description: 'Regional inquiries for Maharashtra and Goa technical institutes',
    unreadCount: 2
  },
  {
    id: 'ch-cro-bhopal',
    name: '#central-regional-office',
    bureau: 'Central Regional Office (CRO)',
    description: 'Bhopal region marksheet withholding inquiries and field inspections'
  },
  {
    id: 'ch-approvals-quality',
    name: '#approvals-quality-cell',
    bureau: 'Quality Assurance & Approvals',
    description: 'Lab equipment calibration checks, NABL verification, faculty ratios'
  },
  {
    id: 'ch-scholarship-desk',
    name: '#pragati-saksham-welfare',
    bureau: 'Student Welfare & Scholarships',
    description: 'PFMS portal Aadhaar bridge payments and stipend approvals'
  }
];

interface ChatMessage {
  id: string;
  sender: string;
  role: string;
  bureau: string;
  timestamp: string;
  text: string;
  isNotice?: boolean;
}

const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  'ch-pgrc-general': [
    {
      id: 'm1',
      sender: 'Dr. Ramesh Chandra Verma',
      role: 'Director',
      bureau: 'PGRC Central HQ',
      timestamp: 'Today, 10:15 AM',
      text: 'Good morning colleagues. Please review the 4 potential overlap clusters flagged over the weekend. ABC Institute of Technology (DEMO-001) has dual complaints under PGRC and Western Regional Office.',
      isNotice: true
    },
    {
      id: 'm2',
      sender: 'Dr. S. Meenakshi',
      role: 'Assistant Director',
      bureau: 'Western Regional Office',
      timestamp: 'Today, 10:22 AM',
      text: 'Acknowledged Dr. Verma. Western Regional Office is tracking case NIV-2026-1098 (MCA candidate development fee deduction). We agree to designate PGRC as the Lead Bureau for consolidated ATR.'
    }
  ],
  'ch-wro-mumbai': [
    {
      id: 'm3',
      sender: 'Dr. S. Meenakshi',
      role: 'Assistant Director',
      bureau: 'Western Regional Office',
      timestamp: 'Yesterday, 04:45 PM',
      text: 'Show cause notice dispatched to Accounts Registrar at ABC Institute regarding non-compliance with AICTE Circular 2026/FEE/14.'
    }
  ]
};

export const InterBureauHubView: React.FC = () => {
  const { currentUser } = useApp();
  const [activeChannelId, setActiveChannelId] = useState('ch-pgrc-general');
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');

  const currentChannel = CHANNELS.find(c => c.id === activeChannelId) || CHANNELS[0];
  const channelMessages = messages[activeChannelId] || [];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: currentUser?.name || 'Dr. Ramesh Chandra Verma',
      role: currentUser?.designation || 'Redressal Officer',
      bureau: currentUser?.bureau || 'PGRC',
      timestamp: 'Just now',
      text: inputText.trim()
    };

    setMessages(prev => ({
      ...prev,
      [activeChannelId]: [...(prev[activeChannelId] || []), newMsg]
    }));
    setInputText('');
  };

  return (
    <div style={{ maxWidth: '1440px', margin: 'var(--sp-6) auto', padding: '0 var(--sp-6)', height: 'calc(100vh - 220px)', minHeight: '580px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 'var(--sp-4)' }}>
        <h2 style={{ fontSize: 'var(--fs-2xl)', color: 'var(--navy-900)', fontWeight: 800 }}>
          Inter-Bureau Grievance Coordination Hub
        </h2>
        <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
          Secure, role-authenticated channel network for cross-bureau overlap resolution, inquiry coordination, and ATR audits.
        </p>
      </div>

      <div
        style={{
          flex: 1,
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--rad-md)',
          boxShadow: 'var(--shadow-1)',
          display: 'grid',
          gridTemplateColumns: '280px 1fr',
          overflow: 'hidden'
        }}
      >
        {/* Left: Bureau Channels Rail */}
        <aside
          style={{
            backgroundColor: 'var(--navy-900)',
            color: '#FFFFFF',
            borderRight: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{ padding: 'var(--sp-4)', borderBottom: '1px solid rgba(255, 255, 255, 0.15)' }}>
            <span style={{ fontSize: 'var(--fs-xs)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--india-saffron)', fontWeight: 700 }}>
              AICTE Bureaus & Cells
            </span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--sp-2)' }}>
            {CHANNELS.map(ch => {
              const isSelected = ch.id === activeChannelId;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setActiveChannelId(ch.id)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: 'var(--sp-3)',
                    borderRadius: 'var(--rad-sm)',
                    backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                    color: isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.75)',
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: 'var(--fs-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    cursor: 'pointer',
                    marginBottom: '4px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{ch.name}</span>
                    {ch.unreadCount && (
                      <span
                        style={{
                          backgroundColor: 'var(--action)',
                          color: '#FFFFFF',
                          fontSize: '10px',
                          padding: '1px 6px',
                          borderRadius: 'var(--rad-full)'
                        }}
                      >
                        {ch.unreadCount}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.55)' }}>
                    {ch.bureau}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right: Channel Room */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--surface)' }}>
          {/* Room Header */}
          <div
            style={{
              padding: 'var(--sp-4)',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'var(--navy-50)'
            }}
          >
            <div>
              <h3 style={{ fontSize: 'var(--fs-md)', color: 'var(--navy-900)', fontWeight: 700 }}>
                {currentChannel.name}
              </h3>
              <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
                {currentChannel.description}
              </p>
            </div>
            <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--ok)', fontWeight: 600 }}>
              ● 8 Officers Active
            </span>
          </div>

          {/* Messages Feed */}
          <div style={{ flex: 1, padding: 'var(--sp-5)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
            {channelMessages.map(msg => (
              <div
                key={msg.id}
                style={{
                  padding: 'var(--sp-3) var(--sp-4)',
                  borderRadius: 'var(--rad-sm)',
                  backgroundColor: msg.isNotice ? 'var(--warn-surface)' : 'var(--bg)',
                  border: `1px solid ${msg.isNotice ? 'var(--warn-border)' : 'var(--border-light)'}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                    <span style={{ fontWeight: 700, fontSize: 'var(--fs-sm)', color: 'var(--navy-900)' }}>
                      {msg.sender}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      ({msg.role} · {msg.bureau})
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {msg.timestamp}
                  </span>
                </div>
                <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text)', lineHeight: 1.5 }}>
                  {msg.text}
                </p>
              </div>
            ))}
          </div>

          {/* Message Input Box */}
          <form
            onSubmit={handleSend}
            style={{
              padding: 'var(--sp-4)',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              gap: 'var(--sp-3)',
              backgroundColor: 'var(--surface)'
            }}
          >
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder={`Post statutory directive or inquiry update to ${currentChannel.name}...`}
              className={styles.input}
              required
            />
            <Button variant="primary" size="md">
              Send
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
