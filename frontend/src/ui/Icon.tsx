// ==========================================================================
// NIVARAN · Typed Phosphor Icon Component (Icon.tsx)
// Replaces emoji/ad-hoc icons with consistent Duotone / Regular SVGs
// ==========================================================================

import React from 'react';
import {
  CurrencyInr,
  FileText,
  ShieldCheck,
  GenderIntersex,
  GraduationCap,
  UsersThree,
  Building,
  Question,
  CheckCircle,
  Clock,
  Warning,
  XCircle,
  MagnifyingGlass,
  Plus,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  Funnel,
  DownloadSimple,
  CaretDown,
  CaretUp,
  SignOut,
  User,
  Shield,
  ChatDots,
  Bell,
  Eye,
  Info,
  Sliders,
  FolderOpen,
  ArrowClockwise,
  UploadSimple,
  Buildings,
  ChartBar,
  ChartLine,
  Trash,
  Lock,
  ListBullets
} from '@phosphor-icons/react';

export type IconName =
  | 'fee-refund'
  | 'certificate'
  | 'anti-ragging'
  | 'safety'
  | 'scholarship'
  | 'faculty'
  | 'admission'
  | 'other'
  | 'check-circle'
  | 'clock'
  | 'warning'
  | 'danger'
  | 'search'
  | 'plus'
  | 'arrow-right'
  | 'arrow-left'
  | 'copy'
  | 'check'
  | 'filter'
  | 'download'
  | 'caret-down'
  | 'caret-up'
  | 'sign-out'
  | 'user'
  | 'shield'
  | 'chat'
  | 'bell'
  | 'eye'
  | 'info'
  | 'sliders'
  | 'folder'
  | 'refresh'
  | 'upload'
  | 'building'
  | 'chart-bar'
  | 'chart-line'
  | 'trash'
  | 'lock'
  | 'list';

interface IconProps {
  name: IconName;
  size?: number;
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
  className?: string;
  color?: string;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 20,
  weight = 'regular',
  className = '',
  color
}) => {
  const iconProps = { size, weight, className, color };

  switch (name) {
    case 'fee-refund':
      return <CurrencyInr {...iconProps} />;
    case 'certificate':
      return <FileText {...iconProps} />;
    case 'anti-ragging':
      return <ShieldCheck {...iconProps} />;
    case 'safety':
      return <GenderIntersex {...iconProps} />;
    case 'scholarship':
      return <GraduationCap {...iconProps} />;
    case 'faculty':
      return <UsersThree {...iconProps} />;
    case 'admission':
      return <Building {...iconProps} />;
    case 'other':
      return <Question {...iconProps} />;
    case 'check-circle':
      return <CheckCircle {...iconProps} />;
    case 'clock':
      return <Clock {...iconProps} />;
    case 'warning':
      return <Warning {...iconProps} />;
    case 'danger':
      return <XCircle {...iconProps} />;
    case 'search':
      return <MagnifyingGlass {...iconProps} />;
    case 'plus':
      return <Plus {...iconProps} />;
    case 'arrow-right':
      return <ArrowRight {...iconProps} />;
    case 'arrow-left':
      return <ArrowLeft {...iconProps} />;
    case 'copy':
      return <Copy {...iconProps} />;
    case 'check':
      return <Check {...iconProps} />;
    case 'filter':
      return <Funnel {...iconProps} />;
    case 'download':
      return <DownloadSimple {...iconProps} />;
    case 'caret-down':
      return <CaretDown {...iconProps} />;
    case 'caret-up':
      return <CaretUp {...iconProps} />;
    case 'sign-out':
      return <SignOut {...iconProps} />;
    case 'user':
      return <User {...iconProps} />;
    case 'shield':
      return <Shield {...iconProps} />;
    case 'chat':
      return <ChatDots {...iconProps} />;
    case 'bell':
      return <Bell {...iconProps} />;
    case 'eye':
      return <Eye {...iconProps} />;
    case 'info':
      return <Info {...iconProps} />;
    case 'sliders':
      return <Sliders {...iconProps} />;
    case 'folder':
      return <FolderOpen {...iconProps} />;
    case 'refresh':
      return <ArrowClockwise {...iconProps} />;
    case 'upload':
      return <UploadSimple {...iconProps} />;
    case 'building':
      return <Buildings {...iconProps} />;
    case 'chart-bar':
      return <ChartBar {...iconProps} />;
    case 'chart-line':
      return <ChartLine {...iconProps} />;
    case 'trash':
      return <Trash {...iconProps} />;
    case 'lock':
      return <Lock {...iconProps} />;
    case 'list':
      return <ListBullets {...iconProps} />;
    default:
      return <Info {...iconProps} />;
  }
};
