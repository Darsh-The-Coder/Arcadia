import { ChevronRight } from 'lucide-react';
import { Link } from '@/features/caregiver/navigation';
import type { ReactNode } from 'react';

export function DashboardCard({
  href,
  icon,
  title,
  className = '',
  children,
  testId,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  className?: string;
  children?: ReactNode;
  testId: string;
}) {
  return (
    <div
      className={`group panel-shadow relative flex flex-col rounded-[1.6rem] border border-[var(--border)] bg-[var(--card)] p-5 text-left transition duration-300 hover:-translate-y-1 hover:border-[hsl(44_74%_63%/0.65)] hover:shadow-xl focus-visible:outline focus-visible:outline-3 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-[-3px] ${className}`}
    >
      <Link href={href} aria-label={title} data-testid={testId} className="absolute inset-0 z-10 rounded-[1.6rem] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"><span className="sr-only">{title}</span></Link>
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--muted)] text-[var(--foreground)]">
          {icon}
        </div>
        <span className="pointer-events-none flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--muted-foreground)] transition group-hover:border-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-[var(--primary)]">
          <ChevronRight size={16} />
        </span>
      </div>
      <h3 className="mt-5 font-serif text-xl text-[var(--foreground)]">{title}</h3>
      <div className="mt-3 flex-1">{children}</div>
    </div>
  );
}
