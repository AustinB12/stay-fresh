export type TagColorKey =
  | 'slate'
  | 'red'
  | 'orange'
  | 'amber'
  | 'lime'
  | 'green'
  | 'teal'
  | 'sky'
  | 'blue'
  | 'violet'
  | 'pink';

export interface TagColorClasses {
  badge: string;
  dot: string;
}

export const TAG_COLOR_KEYS: TagColorKey[] = [
  'slate',
  'red',
  'orange',
  'amber',
  'lime',
  'green',
  'teal',
  'sky',
  'blue',
  'violet',
  'pink',
];

export const TAG_COLORS: Record<TagColorKey, TagColorClasses> = {
  slate: {
    badge:
      'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700',
    dot: 'bg-slate-400',
  },
  red: {
    badge:
      'bg-red-100 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-400 dark:border-red-800',
    dot: 'bg-red-500',
  },
  orange: {
    badge:
      'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-800',
    dot: 'bg-orange-500',
  },
  amber: {
    badge:
      'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800',
    dot: 'bg-amber-500',
  },
  lime: {
    badge:
      'bg-lime-100 text-lime-700 border-lime-300 dark:bg-lime-950 dark:text-lime-400 dark:border-lime-800',
    dot: 'bg-lime-500',
  },
  green: {
    badge:
      'bg-green-100 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-400 dark:border-green-800',
    dot: 'bg-green-500',
  },
  teal: {
    badge:
      'bg-teal-100 text-teal-700 border-teal-300 dark:bg-teal-950 dark:text-teal-400 dark:border-teal-800',
    dot: 'bg-teal-500',
  },
  sky: {
    badge:
      'bg-sky-100 text-sky-700 border-sky-300 dark:bg-sky-950 dark:text-sky-400 dark:border-sky-800',
    dot: 'bg-sky-500',
  },
  blue: {
    badge:
      'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800',
    dot: 'bg-blue-500',
  },
  violet: {
    badge:
      'bg-violet-100 text-violet-700 border-violet-300 dark:bg-violet-950 dark:text-violet-400 dark:border-violet-800',
    dot: 'bg-violet-500',
  },
  pink: {
    badge:
      'bg-pink-100 text-pink-700 border-pink-300 dark:bg-pink-950 dark:text-pink-400 dark:border-pink-800',
    dot: 'bg-pink-500',
  },
};

/** Returns the badge className for a given colour key, or undefined for the default style. */
export function getTagBadgeClass(
  color: string | undefined | null,
): string | undefined {
  if (!color) return undefined;
  return TAG_COLORS[color as TagColorKey]?.badge;
}
