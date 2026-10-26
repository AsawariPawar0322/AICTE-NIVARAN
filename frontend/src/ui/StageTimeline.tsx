// ==========================================================================
// NIVARAN · Shared StageTimeline Component (StageTimeline.tsx)
// Horizontal on desktop, vertical on mobile, pulses on active step
// ==========================================================================

import React from 'react';
import { StageKey, STAGE_CONFIG } from '../domain/types';
import { ORDERED_STAGES, getStageStep } from '../domain/stages';
import { Icon } from './Icon';
import styles from './ui.module.css';

interface StageTimelineProps {
  currentStage: StageKey;
  compact?: boolean;
  className?: string;
}

export const StageTimeline: React.FC<StageTimelineProps> = ({
  currentStage,
  compact = false,
  className = ''
}) => {
  const currentStepNum = getStageStep(currentStage);

  return (
    <div
      className={`${styles.timelineTrack} ${className}`}
      style={{
        flexDirection: compact ? 'row' : undefined,
        gap: compact ? 'var(--sp-1)' : undefined
      }}
    >
      {/* Background Connecting Bar */}
      <div
        style={{
          position: 'absolute',
          top: '30px',
          left: '5%',
          right: '5%',
          height: '2px',
          backgroundColor: 'var(--border)',
          zIndex: 1
        }}
      />

      {ORDERED_STAGES.map(stage => {
        const meta = STAGE_CONFIG[stage];
        const stepNum = meta.step;
        const isPast = stepNum < currentStepNum;
        const isCurrent = stepNum === currentStepNum;

        return (
          <div key={stage} className={styles.timelineStep}>
            <div
              className={`${styles.timelineCircle} ${
                isPast
                  ? styles.timelineCircleDone
                  : isCurrent
                  ? styles.timelineCircleActive
                  : ''
              }`}
              title={`${stepNum}. ${meta.label}`}
            >
              {isPast ? <Icon name="check" size={14} weight="bold" /> : stepNum}
            </div>

            {!compact && (
              <>
                <div
                  className={styles.timelineStepLabel}
                  style={{
                    color: isCurrent ? 'var(--navy-900)' : undefined,
                    fontWeight: isCurrent ? 700 : 500
                  }}
                >
                  {meta.label}
                </div>
                <div className={styles.timelineStepDesc}>
                  {isCurrent ? 'Current Stage' : isPast ? 'Completed' : 'Pending'}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};
