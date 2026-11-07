type OrnamentProps = {
  variant?: "botanical" | "sprig" | "rule" | "glyph" | "arc";
  className?: string;
  ariaHidden?: boolean;
};

export function Ornament({
  variant = "botanical",
  className,
  ariaHidden = true,
}: OrnamentProps) {
  const common = {
    "aria-hidden": ariaHidden,
    className,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 0.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (variant === "rule") {
    return (
      <svg viewBox="0 0 240 12" {...common}>
        <line x1="0" y1="6" x2="108" y2="6" />
        <path d="M120 1 l8 5 l-8 5 l-8 -5 z" />
        <line x1="132" y1="6" x2="240" y2="6" />
      </svg>
    );
  }

  if (variant === "glyph") {
    return (
      <svg viewBox="0 0 200 200" {...common}>
        <text
          x="100"
          y="155"
          textAnchor="middle"
          fontFamily="var(--font-fraunces), Georgia, serif"
          fontSize="220"
          fontStyle="italic"
          fontWeight="400"
          fill="currentColor"
          stroke="none"
          opacity="0.18"
        >
          &amp;
        </text>
      </svg>
    );
  }

  if (variant === "arc") {
    return (
      <svg viewBox="0 0 400 200" {...common}>
        <path d="M10 195 A 190 190 0 0 1 390 195" />
      </svg>
    );
  }

  if (variant === "sprig") {
    return (
      <svg viewBox="0 0 160 220" {...common}>
        <path d="M80 215 C 80 160 80 105 80 25" />
        {[40, 70, 105, 140, 175].map((y, i) => {
          const flip = i % 2 === 0 ? 1 : -1;
          return (
            <g key={y}>
              <path
                d={`M80 ${y} C ${80 + flip * 18} ${y - 14} ${80 + flip * 36} ${y - 8} ${80 + flip * 42} ${y + 4}`}
              />
              <path
                d={`M80 ${y} C ${80 + flip * 16} ${y + 4} ${80 + flip * 32} ${y + 6} ${80 + flip * 42} ${y + 4}`}
              />
            </g>
          );
        })}
        <circle cx="80" cy="22" r="3.5" />
      </svg>
    );
  }

  // botanical: open magnolia-ish branch, single long stroke + 3 blooms
  return (
    <svg viewBox="0 0 320 220" {...common}>
      <path d="M10 200 C 80 170, 130 130, 180 80 C 220 40, 260 25, 310 20" />
      <g>
        {/* bloom 1 */}
        <ellipse cx="60" cy="178" rx="14" ry="9" transform="rotate(-22 60 178)" />
        <ellipse cx="60" cy="178" rx="8" ry="5" transform="rotate(-22 60 178)" />
        {/* bloom 2 */}
        <ellipse cx="170" cy="92" rx="18" ry="11" transform="rotate(-38 170 92)" />
        <ellipse cx="170" cy="92" rx="10" ry="6" transform="rotate(-38 170 92)" />
        {/* bloom 3 */}
        <ellipse cx="280" cy="32" rx="13" ry="8" transform="rotate(-48 280 32)" />
        <ellipse cx="280" cy="32" rx="7" ry="4" transform="rotate(-48 280 32)" />
        {/* leaves */}
        <path d="M110 145 q 18 -10 28 -2 q -14 14 -28 2 z" />
        <path d="M220 60 q 18 -6 26 4 q -16 12 -26 -4 z" />
      </g>
    </svg>
  );
}
