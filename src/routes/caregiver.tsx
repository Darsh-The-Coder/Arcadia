import { useEffect, useState } from 'react';
import { createFileRoute, Navigate } from '@tanstack/react-router';
import CaregiverApp from '@/features/caregiver/App';
import { getStoredRole } from '@/lib/role';
import '@/features/caregiver/caregiver.css';

export const Route = createFileRoute('/caregiver')({
  validateSearch: (search: Record<string, unknown>) => ({ view: typeof search['view'] === 'string' && search['view'].startsWith('/') ? search['view'] : '/' }),
  head: () => ({ meta: [{ title: 'Caregiver Dashboard — SmritiSetu' }] }),
  component: CaregiverPortal,
});
function CaregiverPortal() {
  const [role, setRole] = useState<string | null | undefined>(undefined);
  useEffect(() => { setRole(getStoredRole()); }, []);
  if (role === undefined) return <div className="min-h-screen" />;
  if (role !== 'caregiver') return <Navigate to="/" />;
  return <div className="caregiver-portal"><CaregiverApp /></div>;
}
