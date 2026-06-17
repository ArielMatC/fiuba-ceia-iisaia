interface Props {
  className?: string
}

/**
 * Stylized "Great Wave off Kanagawa" mark: a deep wave-blue body with crystal-blue
 * inner curl lines, fuji-white foam claws, and a pale carp-yellow sun disc.
 * Colors are baked to the Kanagawa palette (see STYLEGUIDE.md §7).
 */
function WaveLogo({ className }: Props) {
  return (
    <svg
      viewBox="0 0 64 44"
      className={className}
      role="img"
      aria-label="Great Wave logo"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Sun disc */}
      <circle cx="47" cy="13" r="6.5" fill="#e6c384" opacity="0.9" />

      {/* Deep wave body */}
      <path
        d="M2 39 C 11 22, 25 14, 39 18 C 51 21, 57 31, 50 38 C 45 43, 37 42, 35 36 C 33 31, 39 28, 43 31 C 41 24, 31 23, 25 29 C 18 36, 12 39, 3 39 Z"
        fill="#2d4f67"
      />

      {/* Crystal-blue inner curl lines */}
      <g fill="none" stroke="#7e9cd8" strokeWidth="2" strokeLinecap="round">
        <path d="M9 37 C 16 24, 28 18, 38 23" />
        <path d="M37 35 C 33 33, 33 28, 37 28" />
      </g>

      {/* Foam claws / dots */}
      <g fill="#dcd7ba">
        <circle cx="40" cy="16" r="1.7" />
        <circle cx="45" cy="18" r="1.4" />
        <circle cx="33" cy="20" r="1.3" />
        <circle cx="50" cy="22" r="1.2" />
      </g>
    </svg>
  )
}

export default WaveLogo
