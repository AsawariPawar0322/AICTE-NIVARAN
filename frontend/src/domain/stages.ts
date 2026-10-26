// ==========================================================================
// NIVARAN · Stage Tracking & Progression Engine (stages.ts)
// ==========================================================================

import { StageKey, STAGE_CONFIG } from './types';

export const ORDERED_STAGES: StageKey[] = [
  'SUBMITTED',
  'VERIFICATION',
  'ASSIGNED',
  'UNDER_ACTION',
  'RESOLUTION_PROPOSED',
  'AWAITING_CONFIRMATION',
  'DISPUTED',
  'CLOSED'
];

export function getStageStep(stage: StageKey): number {
  return STAGE_CONFIG[stage]?.step ?? 1;
}

export function isStageComplete(currentStage: StageKey, testStage: StageKey): boolean {
  return getStageStep(currentStage) > getStageStep(testStage);
}

export function isStageCurrent(currentStage: StageKey, testStage: StageKey): boolean {
  return currentStage === testStage;
}

export function getNextPossibleStages(currentStage: StageKey): StageKey[] {
  switch (currentStage) {
    case 'SUBMITTED':
      return ['VERIFICATION'];
    case 'VERIFICATION':
      return ['ASSIGNED'];
    case 'ASSIGNED':
      return ['UNDER_ACTION'];
    case 'UNDER_ACTION':
      return ['RESOLUTION_PROPOSED'];
    case 'RESOLUTION_PROPOSED':
      return ['AWAITING_CONFIRMATION', 'UNDER_ACTION'];
    case 'AWAITING_CONFIRMATION':
      return ['CLOSED', 'DISPUTED'];
    case 'DISPUTED':
      return ['UNDER_ACTION', 'CLOSED'];
    case 'CLOSED':
      return [];
    default:
      return [];
  }
}
