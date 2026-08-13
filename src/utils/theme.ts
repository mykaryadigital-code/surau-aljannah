import { SurauInfo } from '../types';

export type ThemeColor = 'emerald' | 'blue' | 'teal' | 'amber' | 'slate';

export interface ThemeOption {
  id: ThemeColor;
  name: string;
  subtitle: string;
  icon: string;
  badgeBg: string;
  badgeText: string;
  previewBg: string;
  borderAccent: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'emerald',
    name: '🌿 Emerald Hijau',
    subtitle: 'Tema Rasmi & Tradisional',
    icon: '🌿',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    previewBg: 'bg-emerald-800',
    borderAccent: 'border-emerald-500',
  },
  {
    id: 'blue',
    name: '🕌 Biru Masjidi',
    subtitle: 'Tema Diraja / Masjid Negara',
    icon: '🕌',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-800',
    previewBg: 'bg-blue-800',
    borderAccent: 'border-blue-500',
  },
  {
    id: 'teal',
    name: '🌊 Teal Islamik',
    subtitle: 'Tema Cerah & Moden',
    icon: '🌊',
    badgeBg: 'bg-teal-100',
    badgeText: 'text-teal-800',
    previewBg: 'bg-teal-800',
    borderAccent: 'border-teal-500',
  },
  {
    id: 'amber',
    name: '👑 Amber Gold',
    subtitle: 'Tema Eksklusif Murni',
    icon: '👑',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800',
    previewBg: 'bg-amber-700',
    borderAccent: 'border-amber-500',
  },
  {
    id: 'slate',
    name: '🌙 Slate Gelap',
    subtitle: 'Tema Gelap Eye-Safe',
    icon: '🌙',
    badgeBg: 'bg-slate-800',
    badgeText: 'text-slate-200',
    previewBg: 'bg-slate-900',
    borderAccent: 'border-slate-500',
  },
];

export function getThemeClasses(theme: ThemeColor = 'emerald') {
  switch (theme) {
    case 'blue':
      return {
        themeId: 'blue' as ThemeColor,
        headerBg: 'bg-blue-950',
        headerBorder: 'border-blue-800',
        headerBorderSubtle: 'border-blue-800/60',
        headerSubtext: 'text-blue-200/90',
        headerIcon: 'text-blue-400',
        headerBadgeBg: 'bg-blue-900/90',
        headerBadgeBorder: 'border-blue-700/60',
        headerBadgeText: 'text-blue-300',
        headerBtn: 'bg-blue-800 hover:bg-blue-700 text-amber-300 border-blue-600/60',
        headerBtnSecondary: 'bg-blue-900/80 hover:bg-blue-800 text-white border-blue-700/50',
        activeTab: 'bg-blue-900/90 text-amber-300 border-amber-400 shadow-inner',
        inactiveTab: 'text-blue-200/70 hover:text-white hover:bg-blue-900/40 border-transparent',
        accentText: 'text-blue-700',
        accentTextBold: 'text-blue-900',
        primaryBtn: 'bg-blue-800 hover:bg-blue-900 text-white',
        badgeBg: 'bg-blue-100 text-blue-800',
        cardHeader: 'bg-blue-950 text-white border-b border-blue-800',
        cardHeaderBadge: 'bg-blue-900 hover:bg-blue-800 text-blue-200',
        accentRing: 'focus:ring-blue-500 focus:border-blue-500',
        borderAccent: 'border-blue-500',
        lightBg: 'bg-blue-50/50',
      };

    case 'teal':
      return {
        themeId: 'teal' as ThemeColor,
        headerBg: 'bg-teal-950',
        headerBorder: 'border-teal-800',
        headerBorderSubtle: 'border-teal-800/60',
        headerSubtext: 'text-teal-200/90',
        headerIcon: 'text-teal-400',
        headerBadgeBg: 'bg-teal-900/90',
        headerBadgeBorder: 'border-teal-700/60',
        headerBadgeText: 'text-teal-300',
        headerBtn: 'bg-teal-800 hover:bg-teal-700 text-amber-300 border-teal-600/60',
        headerBtnSecondary: 'bg-teal-900/80 hover:bg-teal-800 text-white border-teal-700/50',
        activeTab: 'bg-teal-900/90 text-amber-300 border-amber-400 shadow-inner',
        inactiveTab: 'text-teal-200/70 hover:text-white hover:bg-teal-900/40 border-transparent',
        accentText: 'text-teal-700',
        accentTextBold: 'text-teal-900',
        primaryBtn: 'bg-teal-800 hover:bg-teal-900 text-white',
        badgeBg: 'bg-teal-100 text-teal-800',
        cardHeader: 'bg-teal-950 text-white border-b border-teal-800',
        cardHeaderBadge: 'bg-teal-900 hover:bg-teal-800 text-teal-200',
        accentRing: 'focus:ring-teal-500 focus:border-teal-500',
        borderAccent: 'border-teal-500',
        lightBg: 'bg-teal-50/50',
      };

    case 'amber':
      return {
        themeId: 'amber' as ThemeColor,
        headerBg: 'bg-stone-950',
        headerBorder: 'border-amber-900/70',
        headerBorderSubtle: 'border-amber-900/50',
        headerSubtext: 'text-amber-200/90',
        headerIcon: 'text-amber-400',
        headerBadgeBg: 'bg-amber-950/90',
        headerBadgeBorder: 'border-amber-700/60',
        headerBadgeText: 'text-amber-300',
        headerBtn: 'bg-amber-800 hover:bg-amber-700 text-amber-200 border-amber-600/60',
        headerBtnSecondary: 'bg-stone-900 hover:bg-stone-800 text-amber-100 border-amber-800/60',
        activeTab: 'bg-amber-900/90 text-amber-200 border-amber-400 shadow-inner',
        inactiveTab: 'text-amber-200/70 hover:text-white hover:bg-amber-900/40 border-transparent',
        accentText: 'text-amber-800',
        accentTextBold: 'text-amber-950',
        primaryBtn: 'bg-amber-700 hover:bg-amber-800 text-white',
        badgeBg: 'bg-amber-100 text-amber-900',
        cardHeader: 'bg-stone-950 text-amber-200 border-b border-amber-900',
        cardHeaderBadge: 'bg-amber-950 hover:bg-amber-900 text-amber-200',
        accentRing: 'focus:ring-amber-500 focus:border-amber-500',
        borderAccent: 'border-amber-500',
        lightBg: 'bg-amber-50/50',
      };

    case 'slate':
      return {
        themeId: 'slate' as ThemeColor,
        headerBg: 'bg-slate-950',
        headerBorder: 'border-slate-800',
        headerBorderSubtle: 'border-slate-800/80',
        headerSubtext: 'text-slate-300',
        headerIcon: 'text-slate-400',
        headerBadgeBg: 'bg-slate-900',
        headerBadgeBorder: 'border-slate-700',
        headerBadgeText: 'text-slate-200',
        headerBtn: 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-600',
        headerBtnSecondary: 'bg-slate-900 hover:bg-slate-800 text-white border-slate-700',
        activeTab: 'bg-slate-800 text-amber-300 border-amber-400 shadow-inner',
        inactiveTab: 'text-slate-400 hover:text-white hover:bg-slate-800/50 border-transparent',
        accentText: 'text-slate-700',
        accentTextBold: 'text-slate-900',
        primaryBtn: 'bg-slate-800 hover:bg-slate-900 text-white',
        badgeBg: 'bg-slate-200 text-slate-800',
        cardHeader: 'bg-slate-950 text-white border-b border-slate-800',
        cardHeaderBadge: 'bg-slate-800 hover:bg-slate-700 text-slate-200',
        accentRing: 'focus:ring-slate-500 focus:border-slate-500',
        borderAccent: 'border-slate-500',
        lightBg: 'bg-slate-100/50',
      };

    case 'emerald':
    default:
      return {
        themeId: 'emerald' as ThemeColor,
        headerBg: 'bg-emerald-950',
        headerBorder: 'border-emerald-800',
        headerBorderSubtle: 'border-emerald-800/60',
        headerSubtext: 'text-emerald-200/90',
        headerIcon: 'text-emerald-400',
        headerBadgeBg: 'bg-emerald-900/90',
        headerBadgeBorder: 'border-emerald-700/60',
        headerBadgeText: 'text-emerald-300',
        headerBtn: 'bg-emerald-800 hover:bg-emerald-700 text-amber-300 border-emerald-600/60',
        headerBtnSecondary: 'bg-emerald-900/80 hover:bg-emerald-800 text-white border-emerald-700/50',
        activeTab: 'bg-emerald-900/90 text-amber-300 border-amber-400 shadow-inner',
        inactiveTab: 'text-emerald-200/70 hover:text-white hover:bg-emerald-900/40 border-transparent',
        accentText: 'text-emerald-700',
        accentTextBold: 'text-emerald-900',
        primaryBtn: 'bg-emerald-800 hover:bg-emerald-900 text-white',
        badgeBg: 'bg-emerald-100 text-emerald-800',
        cardHeader: 'bg-emerald-950 text-white border-b border-emerald-800',
        cardHeaderBadge: 'bg-emerald-900 hover:bg-emerald-800 text-emerald-200',
        accentRing: 'focus:ring-emerald-500 focus:border-emerald-500',
        borderAccent: 'border-emerald-500',
        lightBg: 'bg-emerald-50/50',
      };
  }
}
