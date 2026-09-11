import { ArrowLeft } from 'lucide-react';
import { Link } from '@/features/caregiver/navigation';
import type { ReactNode } from 'react';
import { Logo } from '@/features/caregiver/components/layout/logo';

export function DetailScreenHeader({
  title,
  icon,
  backHref = '/',
  action,
}: {
  title: string;
  icon?: ReactNode;
  backHref?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex items-center gap-3 border-b border-[var(--border)] px-5 py-4 sm:px-8 lg:px-12">
      <Logo className="h-12 w-12 shrink-0 sm:h-14 sm:w-14" />
      <Link
        href={backHref}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--foreground)] transition hover:bg-[var(--muted)]"
        aria-label="Back"
        data-testid="button-back"
      >
        <ArrowLeft size={20} />
      </Link>
      {icon && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--muted)] text-[var(--foreground)]">
          {icon}
        </div>
      )}
      <h1 className="min-w-0 flex-1 truncate font-serif text-xl text-[var(--foreground)] sm:text-2xl">
        {title}
      </h1>
      {action}
    </header>
  );
}
