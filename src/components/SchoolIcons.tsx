interface IconProps {
  className?: string;
}

export function ChalkboardIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="3" y="4" width="18" height="12" rx="1.5" fill="#234b3a" />
      <path
        d="M7.5 10l2.5 2.5L16 6.5"
        fill="none"
        stroke="#f5f5f4"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M5 19.5h14" fill="none" stroke="#92400e" strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
}

export function AppleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 20.5c-4.5 0-6.5-3.7-6.5-7 0-2.8 1.8-4.5 3.8-4.1 1.1.2 2 .9 2.7 1.8.7-.9 1.6-1.6 2.7-1.8 2-.4 3.8 1.3 3.8 4.1 0 3.3-2 7-6.5 7z"
        fill="#e11d48"
        stroke="#be123c"
        strokeWidth={1}
        strokeLinejoin="round"
      />
      <path d="M12 12.2V7.5" stroke="#78350f" strokeWidth={2} strokeLinecap="round" />
      <ellipse
        cx="14.7"
        cy="6.6"
        rx="1.9"
        ry="1.1"
        transform="rotate(35 14.7 6.6)"
        fill="#16a34a"
      />
    </svg>
  );
}

export function CrayonsIcon({ className }: IconProps) {
  const crayon = (x: number) => `M${x} 4 ${x + 1.6} 7v11a1.6 1.6 0 0 1-3.2 0V7z`;
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <g transform="rotate(-8 9 12)">
        <path d={crayon(9)} fill="#f97316" />
      </g>
      <g transform="rotate(8 15 12)">
        <path d={crayon(15)} fill="#8b5cf6" />
      </g>
    </svg>
  );
}
