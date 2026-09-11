export function Logo({ className = "h-12 w-32" }: { className?: string }) {
  return (
    <img
      src="assets/ssetu.png" // or your imported logo asset
      alt="SmritiSetu Logo"
      className={`h-full w-auto object-contain ${className}`}
    />
  );
}