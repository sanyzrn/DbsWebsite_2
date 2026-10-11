/** Small provisional octopus mark; replace with the final brand asset when supplied. */
export default function NexMark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path d="M18 34V25a14 14 0 0 1 28 0v9" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="5" strokeLinecap="round">
        <path d="M20 32c-8 0-12 3-12 9s-5 6-5 1M23 33c-8 3-9 8-9 13s-6 7-8 2M27 33c-5 6-6 13-4 18s-4 7-6 3M31 33v18c0 6-5 8-7 5M33 33v18c0 6 5 8 7 5M37 33c5 6 6 13 4 18s4 7 6 3M41 33c8 3 9 8 9 13s6 7 8 2M44 32c8 0 12 3 12 9s5 6 5 1" />
      </g>
      <g fill="var(--nx-card, #fff)"><circle cx="27" cy="25" r="2" /><circle cx="37" cy="25" r="2" /></g>
    </svg>
  );
}
