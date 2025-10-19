/**
 * Premium Effects & Micro-interactions
 * Elite visual enhancements for world-class dark mode
 */

/**
 * Card hover effects with elevation
 */
export const cardHoverEffect =
  "transition-all hover:-translate-y-0.5 hover:shadow-lg dark:hover:shadow-dark-lg";

/**
 * Button hover effects with scale
 */
export const buttonHoverEffect =
  "transition-all hover:scale-105 active:scale-95";

/**
 * Glow effect for focus states
 */
export const focusGlowEffect =
  "focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-zinc-950";

/**
 * Premium input focus effect
 */
export const inputFocusEffect =
  "focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20";

/**
 * Shimmer loading effect
 */
export const shimmerEffect =
  "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent";

/**
 * Success pulse animation
 */
export const successPulse = "animate-pulse";

/**
 * Smooth fade in animation
 */
export const fadeIn = "animate-fade-in";

/**
 * Slide up entrance
 */
export const slideUp = "animate-slide-up";

/**
 * Scale in entrance
 */
export const scaleIn = "animate-scale-in";

/**
 * Interactive element base
 */
export const interactive =
  "cursor-pointer transition-all hover:-translate-y-0.5 active:translate-y-0";

/**
 * Premium gradient backgrounds
 */
export const gradients = {
  blue: "bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600",
  green:
    "bg-gradient-to-br from-green-500 to-green-700 dark:from-green-400 dark:to-green-600",
  purple:
    "bg-gradient-to-br from-purple-500 to-purple-700 dark:from-purple-400 dark:to-purple-600",
  red: "bg-gradient-to-br from-red-500 to-red-700 dark:from-red-400 dark:to-red-600",
  zinc: "bg-gradient-to-br from-zinc-800 to-zinc-900 dark:from-zinc-900 dark:to-zinc-950",
};

/**
 * Glass morphism effect
 */
export const glassmorphism =
  "bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-gray-200/50 dark:border-zinc-800/50";

/**
 * Elevated surface with shadow
 */
export const elevated =
  "bg-white dark:bg-zinc-900 shadow-md dark:shadow-dark-md border border-gray-200 dark:border-zinc-800";

/**
 * Status badge effects
 */
export const statusBadge = {
  active:
    "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20",
  inactive:
    "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700",
  pending:
    "bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/20",
  error:
    "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20",
};

/**
 * Premium notification styles
 */
export const notification = {
  success: "border-l-4 border-l-green-500 bg-white dark:bg-zinc-900 shadow-lg",
  error: "border-l-4 border-l-red-500 bg-white dark:bg-zinc-900 shadow-lg",
  warning: "border-l-4 border-l-yellow-500 bg-white dark:bg-zinc-900 shadow-lg",
  info: "border-l-4 border-l-blue-500 bg-white dark:bg-zinc-900 shadow-lg",
};

/**
 * Premium tooltip styles
 */
export const tooltip =
  "px-3 py-2 text-xs font-medium text-white bg-zinc-900 dark:bg-zinc-800 rounded-lg shadow-lg";

/**
 * Badge with dot indicator
 */
export const badgeWithDot = "inline-flex items-center gap-1.5";

/**
 * Avatar glow effect for online status
 */
export const avatarGlow =
  "ring-2 ring-green-400 dark:ring-green-500 shadow-green-500/50";

/**
 * Card reveal animation
 */
export const cardReveal = "opacity-0 translate-y-4 transition-all duration-500";

/**
 * Skeleton loading (premium shimmer)
 */
export const skeletonLoading =
  "bg-gray-200 dark:bg-zinc-800 animate-pulse rounded";

/**
 * Premium link hover
 */
export const linkHover =
  "text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors hover:underline";

/**
 * Icon button hover
 */
export const iconButtonHover =
  "p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all hover:scale-110";

export const effects = {
  cardHover: cardHoverEffect,
  buttonHover: buttonHoverEffect,
  focusGlow: focusGlowEffect,
  inputFocus: inputFocusEffect,
  shimmer: shimmerEffect,
  successPulse,
  fadeIn,
  slideUp,
  scaleIn,
  interactive,
  gradients,
  glassmorphism,
  elevated,
  statusBadge,
  notification,
  tooltip,
  badgeWithDot,
  avatarGlow,
  cardReveal,
  skeletonLoading,
  linkHover,
  iconButtonHover,
} as const;

export type Effects = typeof effects;
