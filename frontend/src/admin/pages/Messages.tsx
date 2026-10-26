import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiService } from '../services/api';
import { AdminMessage } from '../types';
import { Button } from '../design-system/Button';
import { useApp } from '../context/AppContext';
import { downloadSyntheticDocument } from '../utils/documentDownloader';
import {
  MessageSquare,
  Send,
  User,
  Building2,
  Paperclip,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Search,
  Download,
} from 'lucide-react';

export const Messages: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToast } = useApp();

  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('AICTE-2024-GRV-8102');
  const [replyText, setReplyText] = useState('');
  const [recipientRole, setRecipientRole] = useState<'INSTITUTION_NODAL' | 'COMPLAINANT'>('INSTITUTION_NODAL');
  const [isLoading, setIsLoading] = useState(true);

  const complaintParam = searchParams.get('complaintId');

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const allMsgs = await apiService.getMessages();
      setMessages(allMsgs);
      if (complaintParam) {
        setSelectedCaseId(complaintParam);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [complaintParam]);

  // Group messages by complaintId
  const conversationGroups = Array.from(new Set(messages.map((m) => m.complaintId)));
  const activeConversation = messages.filter((m) => m.complaintId === selectedCaseId);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      await apiService.sendMessage(selectedCaseId, replyText, recipientRole);
      setReplyText('');
      addToast({
        type: 'success',
        title: 'Directive Transmitted',
        message: `Message dispatched to ${recipientRole === 'INSTITUTION_NODAL' ? 'Institution Nodal Officer' : 'Complainant'}.`,
      });
      loadMessages();
    } catch (err: any) {
      addToast({ type: 'danger', title: 'Error', message: err.message });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-white border border-[#CBD2DC] rounded-[8px] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[#0B2A5B] flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#C2570C]" />
            Messages
          </h2>
          <p className="text-xs text-[#4B5565] mt-0.5">
            Direct communication with colleges and complainants for active cases.
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 bg-[#E6EEF9] text-[#1F5FBF] border border-[#93C5FD] rounded font-semibold self-start md:self-auto">
          Case Communication
        </span>
      </div>

      {/* Main Messages Interface Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[620px] bg-white border border-[#CBD2DC] rounded-[8px] overflow-hidden">
        {/* Left: Threads List (4 Cols) */}
        <div className="lg:col-span-4 border-r border-[#CBD2DC] flex flex-col h-full bg-[#F3F5F8]">
          <div className="p-3 border-b border-[#CBD2DC] bg-white">
            <span className="text-xs font-bold text-[#0B2A5B] uppercase tracking-wider">
              Active Case Threads ({conversationGroups.length})
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#CBD2DC]">
            {conversationGroups.map((caseId) => {
              const caseMsgs = messages.filter((m) => m.complaintId === caseId);
              const lastMsg = caseMsgs[caseMsgs.length - 1];
              const isSelected = caseId === selectedCaseId;

              return (
                <div
                  key={caseId}
                  onClick={() => {
                    setSelectedCaseId(caseId);
                    setSearchParams({ complaintId: caseId });
                  }}
                  className={`p-3.5 cursor-pointer transition-colors text-xs ${
                    isSelected ? 'bg-white border-l-4 border-l-[#1F5FBF]' : 'hover:bg-white/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-[#0B2A5B]">{caseId}</span>
                    <span className="text-[10px] text-[#4B5565] font-mono">
                      {lastMsg && new Date(lastMsg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs text-[#1A1F2B] font-medium truncate">
                    {lastMsg?.messageText || 'No messages yet'}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-[#4B5565] mt-1.5">
                    <span>{caseMsgs.length} messages</span>
                    <span className="text-[#C2570C] font-semibold">Active Thread</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Message Window & Reply Box (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col h-full bg-white">
          {/* Thread Header */}
          <div className="p-3.5 border-b border-[#CBD2DC] bg-[#F3F5F8] flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm text-[#0B2A5B]">{selectedCaseId}</span>
                <span className="text-[10px] px-2 py-0.5 bg-[#DCFCE7] text-[#166534] border border-[#86EFAC] rounded font-bold">
                  SLA Active
                </span>
              </div>
              <div className="text-[11px] text-[#4B5565] mt-0.5">
                Participants: AICTE Approval Bureau, College Nodal Authority, Complainant
              </div>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F3F5F8]/40">
            {activeConversation.map((msg) => {
              const isOfficer = msg.senderRole === 'AICTE_OFFICER';
              const isInstitution = msg.senderRole === 'INSTITUTION_NODAL';
              const isComplainant = msg.senderRole === 'COMPLAINANT';

              let cardBg = 'bg-white border-[#CBD2DC]';
              let badgeBg = 'bg-[#E6EEF9] text-[#1F5FBF]';
              let roleTitle = 'AICTE Regulatory Officer';

              if (isInstitution) {
                cardBg = 'bg-[#FEF3C7]/40 border-[#FCD34D]';
                badgeBg = 'bg-[#FEF3C7] text-[#92400E]';
                roleTitle = 'Respondent Institution Nodal Desk';
              } else if (isComplainant) {
                cardBg = 'bg-[#DCFCE7]/30 border-[#86EFAC]';
                badgeBg = 'bg-[#DCFCE7] text-[#166534]';
                roleTitle = 'Public Complainant';
              }

              return (
                <div
                  key={msg.id}
                  className={`p-3.5 rounded-[6px] border ${cardBg} max-w-2xl text-xs space-y-1.5 shadow-sm ${
                    isOfficer ? 'ml-auto' : 'mr-auto'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 pb-1 border-b border-[#CBD2DC]/60">
                    <span className={`text-[10px] px-2 py-0.2 rounded font-bold ${badgeBg}`}>
                      {roleTitle} · {msg.senderName}
                    </span>
                    <span className="text-[10px] text-[#4B5565] font-mono">
                      {new Date(msg.sentAt).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-[#1A1F2B] leading-relaxed whitespace-pre-line">
                    {msg.messageText}
                  </p>

                  {msg.hasAttachment && (
                    <div className="pt-1.5 flex items-center justify-between gap-2 border-t border-[#CBD2DC]/40">
                      <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#1F5FBF]">
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>Attachment: {msg.attachmentName}</span>
                      </span>
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<Download className="w-3 h-3" />}
                        onClick={() => {
                          downloadSyntheticDocument({
                            fileName: msg.attachmentName || 'Official_Attachment.pdf',
                            title: `Dispatched Attachment for ${msg.complaintId}`,
                            caseId: msg.complaintId,
                            details: msg.messageText,
                            uploadedAt: msg.sentAt,
                            uploaderRole: msg.senderName,
                          });
                          addToast({
                            type: 'success',
                            title: 'Attachment Downloaded',
                            message: `Downloaded ${msg.attachmentName}.`,
                          });
                        }}
                      >
                        Download
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Reply Form */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-[#CBD2DC] bg-[#F3F5F8] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#1A1F2B]">Dispatch To:</span>
                <select
                  value={recipientRole}
                  onChange={(e) => setRecipientRole(e.target.value as any)}
                  className="h-7 px-2 bg-white border border-[#CBD2DC] rounded text-xs text-[#1A1F2B]"
                >
                  <option value="INSTITUTION_NODAL">Respondent Institution Nodal Officer</option>
                  <option value="COMPLAINANT">Public Complainant</option>
                </select>
              </div>

              <span className="text-[11px] text-[#4B5565]">Official Record Mode</span>
            </div>

            <div className="flex gap-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type official directive, inquiry or compliance acknowledgement..."
                rows={2}
                className="flex-1 p-2 text-xs bg-white border border-[#CBD2DC] rounded-[4px] text-[#1A1F2B] placeholder-[#4B5565] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1D4ED8]"
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="self-end h-9"
                leftIcon={<Send className="w-3.5 h-3.5" />}
                disabled={!replyText.trim()}
              >
                Send
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
