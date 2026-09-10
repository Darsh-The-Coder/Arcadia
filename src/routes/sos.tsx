import { createFileRoute } from '@tanstack/react-router';
import SosPage from '../SosPage';

export const Route = createFileRoute('/sos')({
  component: SosPage,
});