import React, { useState, useRef, useEffect } from 'react';
import { translations, Language } from '../locales/translations';
import { ActiveTab } from '../components/Navbar';
import { DiscordServer, DiscordChannel, DiscordMessage, DiscordMember } from '../types';
import {
  mockDiscordServers,
  mockDiscordChannels,
  mockDiscordMessages,
  mockDiscordMembers
} from '../data/mockData';
import { Icon } from '../components/Icon';

interface DiscordReplicaViewProps {
  lang: Language;
  setActiveTab: (tab: ActiveTab) => void;
}

export const DiscordReplicaView: React.FC<DiscordReplicaViewProps> = ({
  lang,
  setActiveTab
}) => {
  const [selectedServer, setSelectedServer] = useState<DiscordServer>(mockDiscordServers[0]);
  const [selectedChannel, setSelectedChannel] = useState<DiscordChannel>(mockDiscordChannels[2]); // #fee-and-scholarships
  const [messagesMap, setMessagesMap] = useState<Record<string, DiscordMessage[]>>(mockDiscordMessages);
  const [inputContent, setInputContent] = useState('');
  const [isVoiceConnected, setIsVoiceConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [showMembers, setShowMembers] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentMessages = messagesMap[selectedChannel.id] || [];

  const filteredMessages = currentMessages.filter(m => {
    if (!searchFilter.trim()) return true;
    return m.content.toLowerCase().includes(searchFilter.toLowerCase()) ||
      m.author.name.toLowerCase().includes(searchFilter.toLowerCase());
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChannel.id, messagesMap]);

  const handleSendMessage = (contentToSend?: string) => {
    const text = contentToSend || inputContent;
    if (!text.trim()) return;

    // Check for slash commands
    if (text.startsWith('/status')) {
      const botMsg: DiscordMessage = {
        id: `m-bot-${Date.now()}`,
        channelId: selectedChannel.id,
        author: {
          name: 'AICTE Circular Bot',
          roleTag: 'SYSTEM BOT',
          roleColor: '#5865F2',
          avatarBg: '#5865F2'
        },
        timestamp: 'Today at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: `🔍 **Grievance Status Lookup for AICTE-2026-GRV-84920:**`,
        embedCard: {
          title: 'Case AICTE-2026-GRV-84920 · Delhi Technological University (DTU)',
          description: 'Grievance Stage: **Stage 5 - Pending Citizen OTP Acknowledgment**\nAssigned Officer: Dr. Ramesh Chandra Verma (PGRC AICTE HQ)\nAction: College accounts uploaded net refund receipt for ₹44,000.',
          color: '#10B981',
          fields: [
            { name: 'SLA Status', value: '18h Remaining' },
            { name: 'Next Step', value: 'Input 6-Digit OTP in portal tracker' },
            { name: 'Linked Cases', value: '1 Related Seat Surrender Case Linked' }
          ]
        }
      };
      setMessagesMap(prev => ({
        ...prev,
        [selectedChannel.id]: [...(prev[selectedChannel.id] || []), botMsg]
      }));
      setInputContent('');
      return;
    }

    if (text.startsWith('/helpline')) {
      const botMsg: DiscordMessage = {
        id: `m-bot-${Date.now()}`,
        channelId: selectedChannel.id,
        author: {
          name: 'AICTE Circular Bot',
          roleTag: 'SYSTEM BOT',
          roleColor: '#5865F2',
          avatarBg: '#5865F2'
        },
        timestamp: 'Today at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: `🚨 **AICTE National 24x7 Emergency Helplines:**\n• **Anti-Ragging Squad:** \`1800-180-5522\` (Toll-Free, Mandatory 24h FIR)\n• **Women Safety Helpline (ICC):** \`1091\`\n• **Tele-MANAS Mental Health:** \`14416\`\n• **National Cyber Crime:** \`1930\`\n• **AICTE PGRC HQ Desk:** \`011-29581000\``
      };
      setMessagesMap(prev => ({
        ...prev,
        [selectedChannel.id]: [...(prev[selectedChannel.id] || []), botMsg]
      }));
      setInputContent('');
      return;
    }

    if (text.startsWith('/rules')) {
      const botMsg: DiscordMessage = {
        id: `m-bot-${Date.now()}`,
        channelId: selectedChannel.id,
        author: {
          name: 'AICTE Circular Bot',
          roleTag: 'SYSTEM BOT',
          roleColor: '#5865F2',
          avatarBg: '#5865F2'
        },
        timestamp: 'Today at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: `📜 **AICTE Redressal Directives (Chapter 10 & 2026 Regulations):**\n1. **Fee Refunds:** Max deduction of ₹1,000 permitted if seat is vacated within prescribed cutoff.\n2. **Original Documents:** Colleges strictly barred from retaining student certificates.\n3. **72h SLA:** First response from institute nodal cell mandated within 72 hours.`
      };
      setMessagesMap(prev => ({
        ...prev,
        [selectedChannel.id]: [...(prev[selectedChannel.id] || []), botMsg]
      }));
      setInputContent('');
      return;
    }

    const newMsg: DiscordMessage = {
      id: `m-${Date.now()}`,
      channelId: selectedChannel.id,
      author: {
        name: 'Aarav Sharma',
        roleTag: 'Student Rep',
        roleColor: '#23A55A',
        avatarBg: '#1F5FBF'
      },
      timestamp: 'Today at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: text
    };

    setMessagesMap(prev => ({
      ...prev,
      [selectedChannel.id]: [...(prev[selectedChannel.id] || []), newMsg]
    }));
    if (!contentToSend) setInputContent('');
  };

  return (
    <div className="discord-app-root" id="main-content">
      {/* Top Breadcrumb & Synergy Bar */}
      <div className="discord-top-bar flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="discord-pill">DISCORD COMMUNITY REPLICA</span>
          <span className="text-white-sub">AICTE NIVARAN · Multi-University Student & Bureau Coordination Hub</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn btn-outline btn-sm-back"
            onClick={() => setActiveTab('citizen')}
          >
            ← Return to Citizen Portal
          </button>
          <button
            type="button"
            className="btn btn-outline btn-sm-back"
            onClick={() => setActiveTab('admin')}
          >
            <Icon e="🏛️" size={15} /> Administration Portal
          </button>
        </div>
      </div>

      <div className="discord-viewport">
        {/* 1. Leftmost Server Rail */}
        <div className="discord-servers-strip" role="navigation" aria-label="Coordination Servers">
          {/* AICTE Main Server */}
          <div className="server-icon-wrapper">
            <div className={`server-pill-indicator ${selectedServer.id === 'server-aicte' ? 'active' : ''}`}></div>
            <div 
              className={`server-icon-btn aicte-home-icon ${selectedServer.id === 'server-aicte' ? 'active-server' : ''}`}
              title="AICTE NIVARAN Central Hub"
              onClick={() => setSelectedServer(mockDiscordServers[0])}
            >
              <img src="/aicte-nivaran-logo.png" alt="AICTE NIVARAN" className="discord-server-logo" />
            </div>
          </div>

          <div className="server-divider"></div>

          {mockDiscordServers.map((srv) => (
            <div key={srv.id} className="server-icon-wrapper">
              <div className={`server-pill-indicator ${selectedServer.id === srv.id ? 'active' : ''}`}></div>
              <div
                className={`server-icon-btn ${selectedServer.id === srv.id ? 'active-server' : ''}`}
                title={srv.name}
                onClick={() => setSelectedServer(srv)}
              >
                <span className="server-icon-text">{srv.iconText}</span>
                {srv.unreadCount && srv.unreadCount > 0 && (
                  <span className="server-unread-badge">{srv.unreadCount}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 2. Channel Sidebar */}
        <div className="discord-channel-sidebar">
          {/* Server Title Header */}
          <div className="server-sidebar-header flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <span className="server-header-title truncate">{selectedServer.name}</span>
              <span className="server-verified-star" title="Official AICTE Verified Server">✓</span>
            </div>
            <Icon e="▾" size={18} className="text-muted flex-shrink-0" />
          </div>

          {/* Channels List */}
          <div className="channels-scroll-area">
            <div className="channel-category-label flex items-center justify-between">
              <span>TEXT CHANNELS</span>
            </div>

            {mockDiscordChannels.filter(c => c.type === 'text').map((ch) => (
              <div
                key={ch.id}
                className={`channel-item flex items-center gap-2 ${selectedChannel.id === ch.id ? 'active-channel' : ''}`}
                onClick={() => setSelectedChannel(ch)}
              >
                <Icon e="#" size={18} className="channel-hash-icon" />
                <span className="channel-name-text truncate">{ch.name}</span>
              </div>
            ))}

            <div className="channel-category-label flex items-center justify-between mt-3">
              <span>VOICE ROOMS</span>
            </div>

            {mockDiscordChannels.filter(c => c.type === 'voice').map((ch) => (
              <div
                key={ch.id}
                className={`channel-item flex items-center justify-between ${selectedChannel.id === ch.id ? 'active-channel' : ''}`}
                onClick={() => {
                  setSelectedChannel(ch);
                  setIsVoiceConnected(true);
                }}
              >
                <div className="flex items-center gap-2 truncate">
                  <Icon e="??" size={18} className="channel-hash-icon text-voice" />
                  <span className="channel-name-text truncate">{ch.name}</span>
                </div>
                {isVoiceConnected && selectedChannel.id === ch.id && (
                  <span className="voice-connected-dot" title="Voice Connected"></span>
                )}
              </div>
            ))}

            {/* Voice Connection Status Box if connected */}
            {isVoiceConnected && (
              <div className="voice-connection-status card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon e="??" size={16} className="text-voice animate-pulse" />
                    <div>
                      <strong className="voice-room-title">Voice Connected</strong>
                      <span className="voice-room-sub">Grievance Advisory Lounge / 64kbps</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-disconnect-voice"
                    onClick={() => setIsVoiceConnected(false)}
                    title="Disconnect Voice"
                  >
                    <Icon e="??" size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Footer */}
          <div className="discord-user-footer flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <div className="user-disc-avatar">
                AS
                <span className="presence-dot online"></span>
              </div>
              <div className="user-disc-meta truncate">
                <strong className="user-disc-name truncate">Aarav Sharma</strong>
                <span className="user-disc-tag">#4129 · Student</span>
              </div>
            </div>

            <div className="user-disc-controls flex items-center">
              <button
                type="button"
                className={`disc-ctrl-btn ${isMuted ? 'btn-danger-active' : ''}`}
                onClick={() => setIsMuted(!isMuted)}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <Icon e="??" size={16} className="text-danger" /> : <Icon e="??" size={16} />}
              </button>
              <button
                type="button"
                className={`disc-ctrl-btn ${isDeafened ? 'btn-danger-active' : ''}`}
                onClick={() => setIsDeafened(!isDeafened)}
                title={isDeafened ? 'Undeafen' : 'Deafen'}
              >
                <Icon e="??" size={16} />
              </button>
              <button type="button" className="disc-ctrl-btn" title="Settings">
                <Icon e="??" size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* 3. Main Messages Area */}
        <div className="discord-chat-main">
          {/* Header Bar */}
          <div className="chat-channel-header flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              {selectedChannel.type === 'text' ? (
                <Icon e="#" size={22} className="header-hash text-muted" />
              ) : (
                <Icon e="??" size={22} className="header-hash text-voice" />
              )}
              <strong className="header-channel-title truncate">{selectedChannel.name}</strong>
              <span className="channel-desc-divider">|</span>
              <span className="channel-desc-preview hide-on-mobile truncate">{selectedChannel.description}</span>
            </div>

            <div className="channel-header-actions flex items-center gap-2">
              <div className="discord-search-box flex items-center gap-1.5">
                <Icon e="??" size={14} className="text-muted" />
                <input
                  type="text"
                  placeholder="Search channel..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="discord-search-input"
                />
              </div>

              <button
                type="button"
                className="btn-discord-action"
                title="AICTE Case Status Lookup"
                onClick={() => handleSendMessage('/status AICTE-2026-GRV-84920')}
              >
                <Icon e="✨" size={14} />
                <span>/status</span>
              </button>

              <button
                type="button"
                className={`btn-discord-icon ${showMembers ? 'active' : ''}`}
                title="Toggle Members List"
                onClick={() => setShowMembers(!showMembers)}
              >
                <Icon e="??" size={18} />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="messages-feed-area">
            <div className="channel-welcome-banner">
              <div className="welcome-hash-circle">
                <Icon e="#" size={36} />
              </div>
              <h2 className="welcome-title">Welcome to #{selectedChannel.name}!</h2>
              <p className="welcome-desc">
                This is the official channel for {selectedChannel.name}. Connect with verified student representatives and AICTE nodal bureau delegates.
              </p>
            </div>

            {filteredMessages.map((msg) => (
              <div key={msg.id} className="discord-message-row">
                <div className="msg-avatar-circle" style={{ backgroundColor: msg.author.avatarBg }}>
                  {msg.author.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="msg-content-block">
                  <div className="msg-author-header flex items-center gap-2">
                    <strong className="author-name" style={{ color: msg.author.roleColor }}>
                      {msg.author.name}
                    </strong>
                    <span className="role-badge-tag" style={{ backgroundColor: msg.author.roleColor }}>
                      {msg.author.roleTag}
                    </span>
                    <span className="msg-timestamp">{msg.timestamp}</span>
                  </div>

                  <div className="msg-text-content">
                    {msg.content}
                  </div>

                  {msg.embedCard && (
                    <div className="discord-embed-card" style={{ borderLeftColor: msg.embedCard.color }}>
                      <strong className="embed-title">{msg.embedCard.title}</strong>
                      <p className="embed-desc">{msg.embedCard.description}</p>
                      {msg.embedCard.fields && (
                        <div className="embed-fields-grid grid grid-cols-2 gap-2 mt-2">
                          {msg.embedCard.fields.map((f, i) => (
                            <div key={i} className="embed-field-box">
                              <span className="field-name">{f.name}</span>
                              <span className="field-val">{f.value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Slash Commands Strip */}
          <div className="discord-quick-pills flex items-center gap-2">
            <span className="slash-label">Quick Commands:</span>
            <button
              type="button"
              className="slash-pill"
              onClick={() => handleSendMessage('/status AICTE-2026-GRV-84920')}
            >
              /status AICTE-2026-GRV-84920
            </button>
            <button
              type="button"
              className="slash-pill"
              onClick={() => handleSendMessage('/helpline')}
            >
              /helpline
            </button>
            <button
              type="button"
              className="slash-pill"
              onClick={() => handleSendMessage('/rules')}
            >
              /rules
            </button>
          </div>

          {/* Input Bar */}
          <div className="discord-input-container">
            <form
              className="discord-input-inner flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
            >
              <button
                type="button"
                className="input-attachment-btn"
                title="Attach evidence or image"
                onClick={() => alert('Attachments can be verified via the AICTE Evidence Vault.')}
              >
                <Icon e="➕" size={20} />
              </button>

              <input
                type="text"
                className="discord-text-input"
                placeholder={`Message #${selectedChannel.name} (type /status or /helpline for bot)`}
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
              />

              <button
                type="button"
                className="input-action-btn"
                title="Add emoji"
                onClick={() => setInputContent(prev => prev + ' 🇮🇳')}
              >
                <Icon e="??" size={20} />
              </button>

              <button
                type="submit"
                className="discord-send-btn"
                disabled={!inputContent.trim()}
              >
                <Icon e="➤" size={16} />
              </button>
            </form>
          </div>
        </div>

        {/* 4. Right Members Sidebar */}
        {showMembers && (
          <div className="discord-members-sidebar">
            <div className="members-group-title">OFFICIAL AICTE BOTS — 1</div>
            {mockDiscordMembers.filter(m => m.roleTag.includes('BOT')).map((m) => (
              <div key={m.id} className="member-row flex items-center gap-2">
                <div className="member-avatar bot-avatar">
                  BOT
                  <span className="presence-dot online"></span>
                </div>
                <div>
                  <strong className="member-name text-bot">{m.name}</strong>
                  <span className="member-status-sub">{m.statusText}</span>
                </div>
              </div>
            ))}

            <div className="members-group-title mt-3">AICTE NODAL OFFICERS — 1</div>
            {mockDiscordMembers.filter(m => m.roleTag.includes('Officer')).map((m) => (
              <div key={m.id} className="member-row flex items-center gap-2">
                <div className="member-avatar">
                  RV
                  <span className="presence-dot online"></span>
                </div>
                <div>
                  <strong className="member-name" style={{ color: m.roleColor }}>{m.name}</strong>
                  <span className="member-status-sub">{m.statusText}</span>
                </div>
              </div>
            ))}

            <div className="members-group-title mt-3">STUDENT REPRESENTATIVES — 2</div>
            {mockDiscordMembers.filter(m => m.roleTag.includes('Student')).map((m) => (
              <div key={m.id} className={`member-row flex items-center gap-2 ${!m.isOnline ? 'offline' : ''}`}>
                <div className="member-avatar">
                  {m.name.slice(0, 2).toUpperCase()}
                  <span className={`presence-dot ${m.isOnline ? 'online' : 'offline'}`}></span>
                </div>
                <div>
                  <strong className="member-name" style={{ color: m.roleColor }}>{m.name}</strong>
                  <span className="member-status-sub">{m.statusText}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .discord-app-root {
          background-color: var(--discord-bg);
          color: var(--discord-text-primary);
          height: calc(100vh - 105px);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          font-family: var(--font-sans);
        }

        .discord-top-bar {
          background-color: #1E1F22;
          padding: 8px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 0.8125rem;
          flex-shrink: 0;
        }
        .discord-pill {
          background-color: #5865F2;
          color: #FFFFFF;
          font-weight: 800;
          font-size: 0.72rem;
          padding: 2px 8px;
          border-radius: var(--radius-pill);
          letter-spacing: 0.5px;
        }
        .text-white-sub {
          color: #949BA4;
        }
        .btn-sm-back {
          font-size: 0.75rem;
          padding: 4px 10px;
          color: #DBDEE1;
          border-color: #4E5058;
          min-height: 28px;
        }
        .btn-sm-back:hover {
          background-color: #35373C;
          color: #FFFFFF;
        }

        .discord-viewport {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        /* 1. Server Rail */
        .discord-servers-strip {
          width: 72px;
          background-color: #1E1F22;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 12px 0;
          gap: 8px;
          overflow-y: auto;
          flex-shrink: 0;
        }
        .server-icon-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
        }
        .server-pill-indicator {
          position: absolute;
          left: 0;
          width: 4px;
          height: 0;
          background-color: #FFFFFF;
          border-radius: 0 4px 4px 0;
          transition: height 0.15s ease;
        }
        .server-icon-wrapper:hover .server-pill-indicator {
          height: 20px;
        }
        .server-pill-indicator.active {
          height: 40px !important;
        }

        .server-icon-btn {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background-color: #313338;
          color: #DBDEE1;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
          transition: border-radius 0.2s ease, background-color 0.2s ease;
        }
        .server-icon-btn:hover, .server-icon-btn.active-server {
          border-radius: 16px;
          background-color: #5865F2;
          color: #FFFFFF;
        }
        .aicte-home-icon {
          background-color: #FFFFFF;
          border: 2px solid var(--color-brand-orange-500);
          overflow: hidden;
          padding: 2px;
        }
        .discord-server-logo {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 50%;
        }
        .server-icon-btn.active-server .discord-server-logo {
          border-radius: 12px;
        }
        .server-icon-text {
          font-weight: 800;
          font-size: 0.75rem;
        }
        .server-divider {
          width: 32px;
          height: 2px;
          background-color: #35363C;
          margin: 2px 0;
        }
        .server-unread-badge {
          position: absolute;
          bottom: -2px;
          right: -2px;
          background: #F23F43;
          color: #FFFFFF;
          font-size: 0.65rem;
          font-weight: 800;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #1E1F22;
        }

        /* 2. Channel Sidebar */
        .discord-channel-sidebar {
          width: 240px;
          background-color: #2B2D31;
          display: flex;
          flex-direction: column;
          border-right: 1px solid rgba(0, 0, 0, 0.2);
          flex-shrink: 0;
        }
        .server-sidebar-header {
          height: 48px;
          padding: 0 16px;
          border-bottom: 1px solid #1F2023;
          font-weight: 700;
          font-size: 0.95rem;
          color: #F2F3F5;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .server-sidebar-header:hover {
          background-color: #35373C;
        }
        .server-verified-star {
          background: #5865F2;
          color: #FFFFFF;
          font-size: 0.65rem;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
        }

        .channels-scroll-area {
          flex: 1;
          padding: 12px 8px;
          overflow-y: auto;
        }
        .channel-category-label {
          font-size: 0.7rem;
          font-weight: 700;
          color: #949BA4;
          letter-spacing: 0.5px;
          padding: 6px 8px;
        }
        .channel-item {
          padding: 6px 10px;
          border-radius: 4px;
          color: #949BA4;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          transition: background-color 0.1s ease, color 0.1s ease;
          margin-bottom: 2px;
        }
        .channel-item:hover {
          background-color: #35373C;
          color: #DBDEE1;
        }
        .channel-item.active-channel {
          background-color: #404249;
          color: #FFFFFF;
          font-weight: 600;
        }
        .channel-hash-icon {
          color: #80848E;
          flex-shrink: 0;
        }
        .text-voice {
          color: #23A55A !important;
        }
        .voice-connected-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #23A55A;
        }

        .voice-connection-status {
          background: #111214;
          border: 1px solid #23A55A;
          border-radius: 6px;
          padding: 8px 12px;
          margin-top: 12px;
        }
        .voice-room-title {
          font-size: 0.8rem;
          color: #23A55A;
          display: block;
        }
        .voice-room-sub {
          font-size: 0.68rem;
          color: #949BA4;
          display: block;
        }
        .btn-disconnect-voice {
          background: #DA373C;
          color: #FFFFFF;
          border: none;
          padding: 4px 6px;
          border-radius: 4px;
          cursor: pointer;
        }

        .discord-user-footer {
          height: 52px;
          background: #232428;
          padding: 0 10px;
          flex-shrink: 0;
        }
        .user-disc-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #5865F2;
          color: #FFFFFF;
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          flex-shrink: 0;
        }
        .presence-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          position: absolute;
          bottom: -1px;
          right: -1px;
          border: 2px solid #232428;
        }
        .presence-dot.online { background: #23A55A; }
        .presence-dot.offline { background: #80848E; }

        .user-disc-name {
          font-size: 0.8125rem;
          color: #F2F3F5;
          display: block;
        }
        .user-disc-tag {
          font-size: 0.68rem;
          color: #949BA4;
          display: block;
        }
        .disc-ctrl-btn {
          background: none;
          border: none;
          color: #B5BAC1;
          padding: 6px;
          border-radius: 4px;
          cursor: pointer;
        }
        .disc-ctrl-btn:hover {
          background: #35373C;
          color: #FFFFFF;
        }
        .btn-danger-active {
          color: #DA373C !important;
        }

        /* 3. Chat Main */
        .discord-chat-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          background-color: #313338;
          overflow: hidden;
        }
        .chat-channel-header {
          height: 48px;
          padding: 0 16px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.2);
          box-shadow: 0 1px 2px rgba(0,0,0,0.15);
          flex-shrink: 0;
        }
        .header-channel-title {
          font-size: 1rem;
          color: #F2F3F5;
        }
        .channel-desc-divider {
          color: #4E5058;
          margin: 0 8px;
        }
        .channel-desc-preview {
          font-size: 0.8rem;
          color: #949BA4;
        }
        .discord-search-box {
          background: #1E1F22;
          padding: 4px 8px;
          border-radius: 4px;
        }
        .discord-search-input {
          background: transparent;
          border: none;
          outline: none;
          color: #DBDEE1;
          font-size: 0.75rem;
          width: 120px;
        }
        .btn-discord-action {
          background: #2B2D31;
          border: 1px solid #404249;
          color: #5865F2;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .btn-discord-action:hover {
          background: #35373C;
        }
        .btn-discord-icon {
          background: none;
          border: none;
          color: #B5BAC1;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
        }
        .btn-discord-icon:hover, .btn-discord-icon.active {
          color: #FFFFFF;
        }

        .messages-feed-area {
          flex: 1;
          overflow-y: auto;
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .channel-welcome-banner {
          margin-bottom: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        .welcome-hash-circle {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: #404249;
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
        }
        .welcome-title {
          font-size: 1.5rem;
          color: #F2F3F5;
          margin: 0;
        }
        .welcome-desc {
          font-size: 0.85rem;
          color: #949BA4;
          margin-top: 4px;
        }

        .discord-message-row {
          display: flex;
          gap: 14px;
        }
        .discord-message-row:hover {
          background-color: rgba(0, 0, 0, 0.08);
          margin: -4px -20px;
          padding: 4px 20px;
          border-radius: 4px;
        }
        .msg-avatar-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          color: #FFFFFF;
          font-weight: 700;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .msg-author-header {
          margin-bottom: 4px;
        }
        .author-name {
          font-size: 0.95rem;
        }
        .role-badge-tag {
          font-size: 0.65rem;
          font-weight: 800;
          color: #FFFFFF;
          padding: 1px 5px;
          border-radius: 3px;
        }
        .msg-timestamp {
          font-size: 0.72rem;
          color: #949BA4;
        }
        .msg-text-content {
          font-size: 0.9375rem;
          color: #DBDEE1;
          line-height: 1.45;
          white-space: pre-wrap;
        }
        .discord-embed-card {
          background: #2B2D31;
          border-left: 4px solid #5865F2;
          border-radius: 4px;
          padding: 12px 16px;
          margin-top: 8px;
          max-width: 540px;
        }
        .embed-title {
          font-size: 0.95rem;
          color: #FFFFFF;
          display: block;
        }
        .embed-desc {
          font-size: 0.85rem;
          color: #DBDEE1;
          margin-top: 4px;
          white-space: pre-line;
        }
        .embed-field-box {
          background: #1E1F22;
          padding: 6px 10px;
          border-radius: 4px;
        }
        .field-name {
          font-size: 0.7rem;
          color: #949BA4;
          text-transform: uppercase;
          display: block;
        }
        .field-val {
          font-size: 0.8rem;
          font-weight: 600;
          color: #F2F3F5;
        }

        .discord-quick-pills {
          padding: 6px 20px;
          background: #2B2D31;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 0.75rem;
          overflow-x: auto;
          flex-shrink: 0;
        }
        .slash-label {
          color: #949BA4;
          white-space: nowrap;
          font-weight: 600;
        }
        .slash-pill {
          background: #383A40;
          border: 1px solid #4E5058;
          color: #5865F2;
          font-family: var(--font-mono);
          font-size: 0.72rem;
          padding: 2px 8px;
          border-radius: 4px;
          cursor: pointer;
          white-space: nowrap;
        }
        .slash-pill:hover {
          background: #4E5058;
          color: #FFFFFF;
        }

        .discord-input-container {
          padding: 10px 20px 16px 20px;
          flex-shrink: 0;
        }
        .discord-input-inner {
          background: #383A40;
          border-radius: 8px;
          padding: 6px 14px;
        }
        .input-attachment-btn, .input-action-btn {
          background: none;
          border: none;
          color: #B5BAC1;
          cursor: pointer;
          padding: 4px;
        }
        .input-attachment-btn:hover, .input-action-btn:hover {
          color: #FFFFFF;
        }
        .discord-text-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #F2F3F5;
          font-size: 0.9375rem;
          font-family: var(--font-sans);
        }
        .discord-send-btn {
          background: #5865F2;
          border: none;
          color: #FFFFFF;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
        }
        .discord-send-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* 4. Members Sidebar */
        .discord-members-sidebar {
          width: 240px;
          background-color: #2B2D31;
          padding: 16px 12px;
          overflow-y: auto;
          border-left: 1px solid rgba(0, 0, 0, 0.2);
          flex-shrink: 0;
        }
        .members-group-title {
          font-size: 0.7rem;
          font-weight: 700;
          color: #949BA4;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }
        .member-row {
          padding: 6px 8px;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.1s ease;
        }
        .member-row:hover {
          background-color: #35373C;
        }
        .member-row.offline {
          opacity: 0.5;
        }
        .member-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #404249;
          color: #FFFFFF;
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          flex-shrink: 0;
        }
        .bot-avatar {
          background: #5865F2;
        }
        .member-name {
          font-size: 0.85rem;
          display: block;
        }
        .member-status-sub {
          font-size: 0.7rem;
          color: #949BA4;
          display: block;
        }
        .text-bot {
          color: #5865F2;
        }

        @media (max-width: 900px) {
          .discord-members-sidebar {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};
