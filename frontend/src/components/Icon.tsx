/**
 * Icon.tsx — Thin wrapper around @phosphor-icons/react
 * Maps short emoji-style keys to verified Phosphor SVG components.
 * All icon names confirmed present in @phosphor-icons/react v2.1.10
 */
import React from 'react';
import {
  MagnifyingGlass, House, GraduationCap, ChatCircle, ChatCircleDots,
  ShieldCheck, ShieldWarning, LockKey, LockSimple, Globe, Key,
  Building, Bank, Microphone, ArrowRight, ArrowLeft, CaretRight, CaretDown,
  Sparkle, Lightning, Warning, Phone, CreditCard, Siren, UsersThree,
  Flask, Scroll, FileText, LinkSimple, User, FolderOpen, Timer, Trash,
  CloudArrowUp, PaperPlaneRight, Paperclip, ChartBar, Info,
  IdentificationCard, DeviceMobile, ArrowClockwise, Eye, EyeSlash,
  Minus, X, Check, CheckCircle, MicrophoneSlash, PhoneSlash, Headphones,
  Radio, PlusCircle, Smiley, Hash, ArrowUpRight, DownloadSimple,
  ClipboardText, Notepad, Gear, Scales, Medal, Certificate, Question,
  DiscordLogo,
  type IconProps as PhosphorIconProps
} from '@phosphor-icons/react';

type Comp = React.FC<PhosphorIconProps>;

const MAP: Record<string, Comp> = {
  // ── Navigation ──────────────────────────────────────────
  '🔍': MagnifyingGlass,
  '🏠': House,
  '→':  ArrowRight,
  '←':  ArrowLeft,
  '›':  CaretRight,
  '▾':  CaretDown,
  '↗️': ArrowUpRight,
  // ── Roles & portals ─────────────────────────────────────
  '🎓': GraduationCap,
  '🛡️': ShieldCheck,
  '👤': User,
  '👥': UsersThree,
  '🪪': IdentificationCard,
  // ── Communication ────────────────────────────────────────
  '💬': ChatCircle,
  '💭': ChatCircleDots,
  '💻': DiscordLogo,
  // ── Security & verification ──────────────────────────────
  '✅': CheckCircle,
  '🔒': LockSimple,
  '🔐': LockKey,
  '🔑': Key,
  '⚠️': Warning,
  '⚖️': Scales,
  '👮': ShieldWarning,
  // ── Institutions & files ─────────────────────────────────
  '🏛️': Building,
  '🏫': Bank,
  '🏢': Building,
  '📄': FileText,
  '📝': Notepad,
  '📋': ClipboardText,
  '📂': FolderOpen,
  '🗑️': Trash,
  '➕': PlusCircle,
  // ── Evidence vault & upload ──────────────────────────────
  '☁️': CloudArrowUp,
  '📎': Paperclip,
  '🔗': LinkSimple,
  // ── Time & status ────────────────────────────────────────
  '⏱️': Timer,
  '🔄': ArrowClockwise,
  '✓':  Check,
  // ── Device & accessibility ───────────────────────────────
  '📱': DeviceMobile,
  '👁️': Eye,
  '🙈': EyeSlash,
  '🔊': Microphone,
  '🔇': MicrophoneSlash,
  '📵': PhoneSlash,
  '🎧': Headphones,
  '📻': Radio,
  '⚙️': Gear,
  // ── Misc UI ──────────────────────────────────────────────
  '—':  Minus,
  '✕':  X,
  '➤':  PaperPlaneRight,
  'ℹ️': Info,
  '✨': Sparkle,
  '⚡': Lightning,
  '🌐': Globe,
  '😊': Smiley,
  '#':  Hash,
  '⬇️': DownloadSimple,
  '📞': Phone,
  '💳': CreditCard,
  '🚨': Siren,
  '🔬': Flask,
  '📜': Scroll,
  '📊': ChartBar,
  '🏅': Medal,
  '📑': Certificate,
  '❓': Question,
};

export interface IconProps {
  e: string;
  size?: number;
  label?: string;
  className?: string;
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
}

export const Icon: React.FC<IconProps> = ({
  e,
  size = 18,
  label,
  className,
  weight = 'regular',
}) => {
  const Comp = MAP[e] ?? Info;
  return (
    <Comp
      size={size}
      weight={weight}
      color="currentColor"
      className={className}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
};
