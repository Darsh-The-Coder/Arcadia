import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/features/caregiver/components/error-boundary';
import { Toaster } from '@/features/caregiver/components/ui/toaster';
import { TooltipProvider } from '@/features/caregiver/components/ui/tooltip';
import { CareDataProvider } from '@/features/caregiver/state/care-context';
import DashboardPage from '@/features/caregiver/pages/dashboard';
import LocationSafetyPage from '@/features/caregiver/pages/location-safety';
import AlertsPage from '@/features/caregiver/pages/alerts';
import RemindersPage from '@/features/caregiver/pages/reminders';
import MedicalReportsPage from '@/features/caregiver/pages/medical-reports';
import DailyProgressPage from '@/features/caregiver/pages/daily-progress';
import ConnectPage from '@/features/caregiver/pages/connect';
import ElderlyProfilePage from '@/features/caregiver/pages/elderly-profile';
import MyDayPage from '@/features/caregiver/pages/my-day';
import NotFound from '@/features/caregiver/pages/not-found';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from '@/features/caregiver/navigation';

const queryClient = new QueryClient();

function Router() {
  return (
    // Keep a shared shell outside the boundary so it survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={DashboardPage} />
        <Route path="/location" component={LocationSafetyPage} />
        <Route path="/alerts" component={AlertsPage} />
        <Route path="/reminders" component={RemindersPage} />
        <Route path="/medical" component={MedicalReportsPage} />
        <Route path="/progress" component={DailyProgressPage} />
        <Route path="/my-day" component={MyDayPage} />
        <Route path="/connect" component={ConnectPage} />
        <Route path="/profile" component={ElderlyProfilePage} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CareDataProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <Toaster />
        </CareDataProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
