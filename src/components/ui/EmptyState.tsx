import Link from 'next/link'

type Props = {
  /** Single emoji or short glyph, matching the existing convention in this codebase (no icon library dependency). */
  icon?: string
  title: string
  description?: string
  action?: {
    href: string
    label: string
  }
  /** Use 'card' (bordered, matches list-item cards) or 'plain' (no border, for nesting inside an existing card). */
  variant?: 'card' | 'plain'
}

/**
 * Standard empty state for first-use / zero-data screens across modules.
 * Replaces the ad-hoc "no hay nada todavía" blocks that used to be
 * hand-rolled per page with slightly different markup each time.
 */
export function EmptyState({ icon = '📭', title, description, action, variant = 'card' }: Props) {
  return (
    <div
      className={
        variant === 'card'
          ? 'text-center py-12 px-6 bg-card border border-border rounded-2xl'
          : 'text-center py-10 px-4'
      }
    >
      <p className="text-3xl mb-3" aria-hidden>
        {icon}
      </p>
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      {action && (
        <Link
          href={action.href}
          className="text-sm text-foreground underline mt-3 inline-block"
        >
          {action.label}
        </Link>
      )}
    </div>
  )
}
