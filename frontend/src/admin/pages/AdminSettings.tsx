import React, { useState } from 'react';
import { Button } from '../design-system/Button';
import { Input, Select } from '../design-system/FormControls';
import { useApp } from '../context/AppContext';
import {
  Settings,
  ShieldCheck,
  Clock,
  Bell,
  Users,
  ShieldAlert,
  Save,
  Check,
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { addToast } = useApp();

  const [ackSlaHours, setAckSlaHours] = useState('72');
  const [showCauseDays, setShowCauseDays] = useState('7');
  const [resolutionDays, setResolutionDays] = useState('30');
  const [autoEscalateBreachDays, setAutoEscalateBreachDays] = useState('4');

  const [enableSms, setEnableSms] = useState(true);
  const [enableEmail, setEnableEmail] = useState(true);
  const [enableDigiLocker, setEnableDigiLocker] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    addToast({
      type: 'success',
      title: 'Configuration Saved',
      message: 'SLA parameters and notification channels updated.',
    });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header Banner */}
      <div className="bg-white border border-[#CBD2DC] rounded-[8px] p-4">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-[#C2570C]" />
          <h2 className="text-base font-bold text-[#0B2A5B]">
            Settings
          </h2>
          <span className="text-xs px-2 py-0.5 bg-[#E6EEF9] text-[#1F5FBF] border border-[#93C5FD] rounded font-semibold">
            System Configuration
          </span>
        </div>
        <p className="text-xs text-[#4B5565] mt-1">
          Configure response deadlines, escalation alerts, and notification channels.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* SLA Escalation Rules */}
        <div className="bg-white border border-[#CBD2DC] rounded-[8px] p-5 space-y-4">
          <div className="pb-2 border-b border-[#CBD2DC] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#C2570C]" />
            <h3 className="text-sm font-bold text-[#0B2A5B] uppercase tracking-wide">
              Statutory SLA Windows &amp; Escalation Thresholds
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <Input
              label="Initial Complainant Acknowledgment Mandate (Hours)"
              type="number"
              value={ackSlaHours}
              onChange={(e) => setAckSlaHours(e.target.value)}
              helperText="Centralized Support System (CSS) guideline is 72 working hours."
              required
            />

            <Input
              label="Institution Show-Cause Notice Compliance Window (Days)"
              type="number"
              value={showCauseDays}
              onChange={(e) => setShowCauseDays(e.target.value)}
              helperText="Days allotted for college nodal officer to submit formal explanation."
              required
            />

            <Input
              label="Maximum Statutory Final Redressal Target (Days)"
              type="number"
              value={resolutionDays}
              onChange={(e) => setResolutionDays(e.target.value)}
              helperText="AICTE Grievance Regulations mandate closure within 30 days."
              required
            />

            <Input
              label="Automatic Level 2 Executive Escalation Trigger (Days Past SLA)"
              type="number"
              value={autoEscalateBreachDays}
              onChange={(e) => setAutoEscalateBreachDays(e.target.value)}
              helperText="Transmits alert directly to Member Secretary upon breach."
              required
            />
          </div>
        </div>

        {/* Role-Based Permissions Matrix Demo */}
        <div className="bg-white border border-[#CBD2DC] rounded-[8px] p-5 space-y-4">
          <div className="pb-2 border-b border-[#CBD2DC] flex items-center gap-2">
            <Users className="w-4 h-4 text-[#1F5FBF]" />
            <h3 className="text-sm font-bold text-[#0B2A5B] uppercase tracking-wide">
              Role-Based Access Control (RBAC) Entitlements
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-[#CBD2DC]">
              <thead className="bg-[#F3F5F8] text-[#4B5565] uppercase">
                <tr>
                  <th className="p-2.5 border-b border-[#CBD2DC]">Official Role</th>
                  <th className="p-2.5 border-b border-[#CBD2DC]">Triage Queue</th>
                  <th className="p-2.5 border-b border-[#CBD2DC]">Transfer Bureau</th>
                  <th className="p-2.5 border-b border-[#CBD2DC]">Escalate Level 2</th>
                  <th className="p-2.5 border-b border-[#CBD2DC]">Sanction Closure</th>
                  <th className="p-2.5 border-b border-[#CBD2DC]">View Confidential Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#CBD2DC]">
                <tr>
                  <td className="p-2.5 font-bold text-[#0B2A5B]">Super Admin / Chairman</td>
                  <td className="p-2.5 text-[#166534] font-bold"><Check className="w-4 h-4" /></td>
                  <td className="p-2.5 text-[#166534] font-bold"><Check className="w-4 h-4" /></td>
                  <td className="p-2.5 text-[#166534] font-bold"><Check className="w-4 h-4" /></td>
                  <td className="p-2.5 text-[#166534] font-bold"><Check className="w-4 h-4" /></td>
                  <td className="p-2.5 text-[#166534] font-bold"><Check className="w-4 h-4" /></td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-[#1F5FBF]">Bureau Regional Nodal Officer</td>
                  <td className="p-2.5 text-[#166534] font-bold"><Check className="w-4 h-4" /></td>
                  <td className="p-2.5 text-[#166534] font-bold"><Check className="w-4 h-4" /></td>
                  <td className="p-2.5 text-[#166534] font-bold"><Check className="w-4 h-4" /></td>
                  <td className="p-2.5 text-[#166534] font-bold"><Check className="w-4 h-4" /></td>
                  <td className="p-2.5 text-[#166534] font-bold"><Check className="w-4 h-4" /></td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-[#1A1F2B]">Central Intake Triage Officer</td>
                  <td className="p-2.5 text-[#166534] font-bold"><Check className="w-4 h-4" /></td>
                  <td className="p-2.5 text-[#166534] font-bold"><Check className="w-4 h-4" /></td>
                  <td className="p-2.5 text-[#B91C1C]">-</td>
                  <td className="p-2.5 text-[#B91C1C]">-</td>
                  <td className="p-2.5 text-[#B91C1C]">-</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-[#4B5565]">Institution Nodal Officer (College)</td>
                  <td className="p-2.5 text-[#B91C1C]">-</td>
                  <td className="p-2.5 text-[#B91C1C]">-</td>
                  <td className="p-2.5 text-[#B91C1C]">-</td>
                  <td className="p-2.5 text-[#B91C1C]">-</td>
                  <td className="p-2.5 text-[#B91C1C]">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Notification Gateways */}
        <div className="bg-white border border-[#CBD2DC] rounded-[8px] p-5 space-y-4">
          <div className="pb-2 border-b border-[#CBD2DC] flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#3730A3]" />
            <h3 className="text-sm font-bold text-[#0B2A5B] uppercase tracking-wide">
              Official Notification Channels
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center gap-2.5 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={enableSms}
                onChange={(e) => setEnableSms(e.target.checked)}
                className="rounded"
              />
              <span>NIC SMS Gateway for Complainant One-Time Passwords &amp; Status Directives</span>
            </label>

            <label className="flex items-center gap-2.5 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={enableEmail}
                onChange={(e) => setEnableEmail(e.target.checked)}
                className="rounded"
              />
              <span>AICTE Central SMTP Relay for Show-Cause Transmissions to Registrars</span>
            </label>

            <label className="flex items-center gap-2.5 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={enableDigiLocker}
                onChange={(e) => setEnableDigiLocker(e.target.checked)}
                className="rounded"
              />
              <span>National DigiLocker Certificate Vault API Integration (Beta)</span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <Button type="submit" variant="primary" size="md" leftIcon={<Save className="w-4 h-4" />}>
            Save Configuration Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
