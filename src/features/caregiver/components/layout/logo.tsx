export function Logo({ className = 'h-14 w-14' }: { className?: string }) {
  return (
    <img
      src="/caregiver/logo.jpeg"
      alt="SmritiSetu"
      className={`${className} object-contain`}
      data-testid="img-smritisetu-logo"
    />
  );
}
