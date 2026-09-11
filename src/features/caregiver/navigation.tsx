import { Children, isValidElement, type AnchorHTMLAttributes, type ComponentType, type ReactNode } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';

// Preserve Priya's logical page links inside Arcadia's existing router.
export function useLocation(): [string, (href: string) => void] {
  const view = useRouterState({ select: state => (state.location.search as { view?: string }).view || '/' });
  const navigate = useNavigate();
  return [view.split('?')[0] || '/', href => { void navigate({ to: '/caregiver', search: { view: href } }); }];
}
export function useSearch() {
  const view = useRouterState({ select: state => (state.location.search as { view?: string }).view || '/' });
  return view.includes('?') ? view.slice(view.indexOf('?') + 1) : '';
}
export function Link({ href = '/', children, onClick, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const navigate = useNavigate();
  return <a href={`/caregiver?view=${encodeURIComponent(href)}`} {...props} onClick={event => {
    onClick?.(event);
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || (props.target && props.target !== '_self')) return;
    event.preventDefault();
    void navigate({ to: '/caregiver', search: { view: href } });
  }}>{children}</a>;
}
export function Router({ children }: { children: ReactNode; base?: string }) { return <>{children}</>; }
export function Route({ component: Component }: { path?: string; component: ComponentType }) { return <Component />; }
export function Switch({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const routes = Children.toArray(children).filter(isValidElement<{ path?: string }>);
  return routes.find(route => route.props.path === location) || routes.find(route => !route.props.path) || null;
}
