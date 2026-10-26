// ==========================================================================
// NIVARAN · Screen 1 & 5: Citizen Dashboard & "My Complaints" (MyComplaintsView.tsx)
// "Needs your response" card first, status tabs with counts, card/table toggle
// ==========================================================================

import React, { useState, useMemo } from 'react';
import { useApp } from '../../app/AppProviders';
import { Complaint } from '../../domain/types';
import { Button } from '../../ui/Button';
import { DocketId } from '../../ui/DocketId';
import { StatusChip } from '../../ui/StatusChip';
import { SlaBadge } from '../../ui/SlaBadge';
import { StageTimeline } from '../../ui/StageTimeline';
import { Tabs, TabItem } from '../../ui/NavigationAndDisclosure';
import { DataTable, Column } from '../../ui/DataTable';
import { Icon } from '../../ui/Icon';
import styles from '../../ui/ui.module.css';

export const MyComplaintsView: React.FC = () => {
  const { currentUser, complaints, navigateToTab } = useApp();
  const [activeTabFilter, setActiveTabFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Filter complaints belonging to current user (or demo citizen cases)
  const userComplaints = useMemo(() => {
    if (!currentUser) return complaints.slice(0, 4);
    // In demo mode, match name or show first set
    const matched = complaints.filter(
      c => c.complainantName.toLowerCase() === currentUser.name.toLowerCase() ||
           c.contactEmail === currentUser.email
    );
    return matched.length > 0 ? matched : complaints.slice(0, 4);
  }, [complaints, currentUser]);

  // Urgent action items (Awaiting Confirmation or Information Request)
  const needsResponseList = useMemo(() => {
    return userComplaints.filter(c => c.currentStage === 'AWAITING_CONFIRMATION');
  }, [userComplaints]);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      all: userComplaints.length,
      active: userComplaints.filter(c => c.currentStage !== 'CLOSED').length,
      awaiting: userComplaints.filter(c => c.currentStage === 'AWAITING_CONFIRMATION').length,
      disputed: userComplaints.filter(c => c.currentStage === 'DISPUTED').length,
      closed: userComplaints.filter(c => c.currentStage === 'CLOSED').length
    };
  }, [userComplaints]);

  const tabs: TabItem[] = [
    { id: 'all', label: 'All Dockets', count: tabCounts.all },
    { id: 'active', label: 'Active', count: tabCounts.active },
    { id: 'awaiting', label: 'Awaiting My Confirmation', count: tabCounts.awaiting },
    { id: 'disputed', label: 'Disputed', count: tabCounts.disputed },
    { id: 'closed', label: 'Closed & Verified', count: tabCounts.closed }
  ];

  const filteredComplaints = useMemo(() => {
    return userComplaints.filter(c => {
      if (activeTabFilter === 'active' && c.currentStage === 'CLOSED') return false;
      if (activeTabFilter === 'awaiting' && c.currentStage !== 'AWAITING_CONFIRMATION') return false;
      if (activeTabFilter === 'disputed' && c.currentStage !== 'DISPUTED') return false;
      if (activeTabFilter === 'closed' && c.currentStage !== 'CLOSED') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          c.id.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.institutionName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [userComplaints, activeTabFilter, searchQuery]);

  // Columns for Table mode
  const columns: Column<Complaint>[] = [
    {
      key: 'id',
      header: 'Docket ID',
      render: item => <DocketId id={item.id} />,
      sortable: true
    },
    {
      key: 'title',
      header: 'Grievance Title',
      render: item => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--navy-900)' }}>{item.title}</div>
          <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>{item.institutionName}</div>
        </div>
      )
    },
    {
      key: 'categoryLabel',
      header: 'Category',
      sortable: true
    },
    {
      key: 'currentStage',
      header: 'Current Stage',
      render: item => <StatusChip stage={item.currentStage} />
    },
    {
      key: 'slaClock',
      header: 'SLA Status',
      render: item => <SlaBadge clock={item.slaClock} />
    },
    {
      key: 'actions',
      header: 'Action',
      render: item => (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigateToTab('complaint-detail', { complaintId: item.id })}
        >
          View Details
        </Button>
      )
    }
  ];

  return (
    <div style={{ maxWidth: '1280px', margin: 'var(--sp-8) auto', padding: '0 var(--sp-6)' }}>
      {/* ── 1. Header Greeting & Primary Action ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--sp-4)',
          marginBottom: 'var(--sp-6)'
        }}
      >
        <div>
          <h2 style={{ fontSize: 'var(--fs-3xl)', color: 'var(--navy-900)', fontWeight: 800 }}>
            Welcome back, {currentUser?.name || 'Citizen Complainant'}
          </h2>
          <p style={{ fontSize: 'var(--fs-md)', color: 'var(--text-muted)', marginTop: '2px' }}>
            {currentUser?.institutionName || 'AICTE Technical Grievance Portal'} · Student Redressal Dashboard
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          icon={<Icon name="plus" size={20} />}
          onClick={() => navigateToTab('submit')}
        >
          File a Complaint
        </Button>
      </div>

      {/* ── 2. "Needs Your Response" Alert Card (Screen 1 Feature) ── */}
      {needsResponseList.length > 0 && (
        <div
          style={{
            backgroundColor: 'var(--warn-surface)',
            border: '2px solid var(--warn-border)',
            borderRadius: 'var(--rad-md)',
            padding: 'var(--sp-5)',
            marginBottom: 'var(--sp-6)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginBottom: 'var(--sp-2)' }}>
            <Icon name="warning" size={22} color="var(--warn)" weight="fill" />
            <h3 style={{ fontSize: 'var(--fs-lg)', color: 'var(--warn)', fontWeight: 700 }}>
              Action Required: Resolution Proof Submitted for Your Confirmation
            </h3>
          </div>
          <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text)', marginBottom: 'var(--sp-4)' }}>
            The institution has uploaded an Action Taken Report (ATR). Please inspect the proof document and confirm resolution or submit a formal dispute.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
            {needsResponseList.map(item => (
              <div
                key={item.id}
                style={{
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--rad-sm)',
                  padding: 'var(--sp-4)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 'var(--sp-3)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginBottom: '4px' }}>
                    <DocketId id={item.id} />
                    <span style={{ fontWeight: 700, fontSize: 'var(--fs-md)', color: 'var(--navy-900)' }}>
                      {item.title}
                    </span>
                  </div>
                  <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
                    Claimed Action: {item.resolutionDetails?.claimedAction || 'Refund or administrative rectification initiated.'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Icon name="check-circle" size={16} />}
                    onClick={() => navigateToTab('resolution-confirm', { complaintId: item.id })}
                  >
                    Review & Confirm Resolution
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 3. Tabs and View Controls ── */}
      <Tabs tabs={tabs} activeTab={activeTabFilter} onChange={setActiveTabFilter} />

      {/* Search and Card/Table toggle */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 'var(--sp-4)',
          marginBottom: 'var(--sp-4)',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 300px' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by Docket ID, Subject, or College..."
            className={styles.input}
            style={{ minHeight: '40px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
          <Button
            variant={viewMode === 'cards' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('cards')}
            icon={<Icon name="folder" size={16} />}
          >
            Card View
          </Button>
          <Button
            variant={viewMode === 'table' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
            icon={<Icon name="list" size={16} />}
          >
            Table View
          </Button>
        </div>
      </div>

      {/* ── 4. Complaints Render (Cards vs Table) ── */}
      {viewMode === 'table' ? (
        <DataTable
          data={filteredComplaints}
          columns={columns}
          keyExtractor={c => c.id}
          onRowClick={c => navigateToTab('complaint-detail', { complaintId: c.id })}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          {filteredComplaints.length === 0 ? (
            <div
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--rad-md)',
                padding: 'var(--sp-8)',
                textAlign: 'center'
              }}
            >
              <h4 style={{ color: 'var(--navy-900)', fontSize: 'var(--fs-lg)', marginBottom: 'var(--sp-2)' }}>
                No Grievances in this Category
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-sm)', marginBottom: 'var(--sp-4)' }}>
                You currently have no complaints matching the selected filter.
              </p>
              <Button variant="primary" size="md" onClick={() => navigateToTab('submit')}>
                File a Grievance
              </Button>
            </div>
          ) : (
            filteredComplaints.map(complaint => (
              <div
                key={complaint.id}
                style={{
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--rad-md)',
                  padding: 'var(--sp-5)',
                  boxShadow: 'var(--shadow-0)',
                  transition: 'border-color var(--transition-fast)'
                }}
              >
                {/* Header row */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: 'var(--sp-2)',
                    marginBottom: 'var(--sp-3)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
                    <DocketId id={complaint.id} />
                    <StatusChip stage={complaint.currentStage} />
                    <SlaBadge clock={complaint.slaClock} />
                    {complaint.parentCaseId && (
                      <span
                        style={{
                          backgroundColor: 'var(--navy-50)',
                          color: 'var(--navy-900)',
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 'var(--rad-sm)'
                        }}
                      >
                        Joined Docket (Lead: {complaint.parentCaseId})
                      </span>
                    )}
                  </div>

                  <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
                    Filed: {complaint.submittedAt}
                  </span>
                </div>

                {/* Complaint Title & Institution */}
                <h3
                  style={{
                    fontSize: 'var(--fs-lg)',
                    color: 'var(--navy-900)',
                    marginBottom: 'var(--sp-2)',
                    cursor: 'pointer'
                  }}
                  onClick={() => navigateToTab('complaint-detail', { complaintId: complaint.id })}
                >
                  {complaint.title}
                </h3>
                <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginBottom: 'var(--sp-4)' }}>
                  {complaint.institutionName} (PID: {complaint.aictePermanentId}) · {complaint.categoryLabel}
                </div>

                {/* Compact Stage Timeline */}
                <StageTimeline currentStage={complaint.currentStage} compact />

                {/* Footer Actions */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 'var(--sp-4)',
                    paddingTop: 'var(--sp-3)',
                    borderTop: '1px solid var(--border-light)'
                  }}
                >
                  <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
                    Allocated: {complaint.assignedOfficer.name} ({complaint.assignedOfficer.designation})
                  </span>

                  <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                    {complaint.currentStage === 'AWAITING_CONFIRMATION' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigateToTab('resolution-confirm', { complaintId: complaint.id })}
                      >
                        Review ATR Proof
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigateToTab('complaint-detail', { complaintId: complaint.id })}
                    >
                      View Details →
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
