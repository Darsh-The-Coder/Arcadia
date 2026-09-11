import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { CalendarClock, Plus } from 'lucide-react';
import { useSearch } from '@/features/caregiver/navigation';
import { DetailScreenHeader } from '@/features/caregiver/components/layout/detail-screen-header';
import { DetailScreenBody, DetailScreenShell } from '@/features/caregiver/components/layout/detail-screen-shell';
import { ReminderListItem } from '@/features/caregiver/components/reminders/reminder-list-item';
import { ReminderFormDialog, type ReminderFormValues } from '@/features/caregiver/components/reminders/reminder-form-dialog';
import { Button } from '@/features/caregiver/components/ui/button';
import { useToast } from '@/features/caregiver/hooks/use-toast';
import { useCareData } from '@/features/caregiver/state/care-context';
import type { ReminderRecord } from '@/features/caregiver/types/care';

export default function RemindersPage() {
  const navigate = useNavigate();
  const {
    state,
    addReminder,
    updateReminder,
    deleteReminder,
    pauseReminder,
    resumeReminder,
    completeReminder,
    missReminder,
  } = useCareData();
  const { toast } = useToast();
  const search = useSearch();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ReminderRecord | null>(null);

  useEffect(() => {
    if (new URLSearchParams(search).get('add') === '1') {
      setEditing(null);
      setFormOpen(true);
      void navigate({ to: '/caregiver', search: { view: '/reminders' }, replace: true });
    }
  }, [search, navigate]);

  const upcoming = state.reminders.filter((r) => r.status === 'upcoming' || r.status === 'paused');
  const past = state.reminders.filter((r) => r.status === 'completed' || r.status === 'missed');

  const handleSubmit = (values: ReminderFormValues) => {
    if (editing) {
      updateReminder(editing.id, values);
      toast({ title: '✓ Reminder updated' });
    } else {
      addReminder(values);
      toast({ title: '✓ Reminder added' });
    }
  };

  return (
    <DetailScreenShell>
      <DetailScreenHeader
        title="Reminders"
        icon={<CalendarClock size={18} />}
        action={
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            data-testid="button-add-reminder"
          >
            <Plus size={15} /> Add Reminder
          </Button>
        }
      />
      <DetailScreenBody>
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Upcoming</h2>
          <div className="mt-3 space-y-2">
            {upcoming.length > 0 ? (
              upcoming.map((reminder) => (
                <ReminderListItem
                  key={reminder.id}
                  reminder={reminder}
                  onComplete={() => completeReminder(reminder.id)}
                  onMiss={() => missReminder(reminder.id)}
                  onEdit={() => {
                    setEditing(reminder);
                    setFormOpen(true);
                  }}
                  onDelete={() => deleteReminder(reminder.id)}
                  onPause={() => pauseReminder(reminder.id)}
                  onResume={() => resumeReminder(reminder.id)}
                />
              ))
            ) : (
              <p className="text-sm text-[var(--muted-foreground)]">No upcoming reminders.</p>
            )}
          </div>
        </section>

        {past.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Today so far</h2>
            <div className="mt-3 space-y-2">
              {past.map((reminder) => (
                <ReminderListItem
                  key={reminder.id}
                  reminder={reminder}
                  onComplete={() => completeReminder(reminder.id)}
                  onMiss={() => missReminder(reminder.id)}
                  onEdit={() => {
                    setEditing(reminder);
                    setFormOpen(true);
                  }}
                  onDelete={() => deleteReminder(reminder.id)}
                  onPause={() => pauseReminder(reminder.id)}
                  onResume={() => resumeReminder(reminder.id)}
                />
              ))}
            </div>
          </section>
        )}
      </DetailScreenBody>

      <ReminderFormDialog open={formOpen} onOpenChange={setFormOpen} initial={editing} onSubmit={handleSubmit} />
    </DetailScreenShell>
  );
}
