import {
  BadgeCheck, BookOpen, Check, ClipboardList, Clock, FileCheck, GraduationCap, Hourglass, Lock,
  MessageCircle, Minus, ShieldCheck, Tag, Target, type LucideIcon,
} from "lucide-react";

// Icons for the candidate side. Every icon is decorative and always sits next to its word.
const SKILL_ICONS: Record<string, LucideIcon> = {
  "Price & Detail Accuracy": Tag,
  "Taglish Tone Judgment": MessageCircle,
  "Prompt Judgment": Target,
};

export function skillIcon(skill: string): LucideIcon {
  return SKILL_ICONS[skill] ?? Target;
}

// A skill name with its icon in front.
export function SkillLabel({ skill, className = "" }: { skill: string; className?: string }) {
  const Icon = skillIcon(skill);
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <Icon aria-hidden className="h-4 w-4 shrink-0" strokeWidth={2} />
      {skill}
    </span>
  );
}

// Sorting status icons, shared by the Pool badges.
export const SORT_ICONS = { ready: BadgeCheck, trainable: GraduationCap, not_yet: Clock } as const;
export const OFFER_ICONS = { guaranteed: ShieldCheck, waitlist: Hourglass } as const;

// The five journey steps, in order.
export const JOURNEY_ICONS = {
  assessment: ClipboardList,
  gap: Target,
  module: BookOpen,
  test: FileCheck,
  offer: BadgeCheck,
} as const;

export { BadgeCheck, BookOpen, Check, Clock, FileCheck, Hourglass, Lock, Minus, Target };
