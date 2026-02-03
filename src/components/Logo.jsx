export default function Logo({ size = 32 }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Background Red Circle */}
            <circle cx="50" cy="50" r="50" fill="#D32F2F" />

            {/* Big Black P */}
            {/* Stem */}
            <rect x="20" y="20" width="15" height="60" fill="black" />
            {/* Head */}
            <path d="M35 20 H60 C75 20, 80 30, 80 40 C80 50, 75 60, 60 60 H35 V20 Z" fill="black" />
            {/* Counter (Back to Red) */}
            <circle cx="55" cy="40" r="8" fill="#D32F2F" />

            {/* White m */}
            <text
                x="55"
                y="80"
                fontFamily="Arial, sans-serif"
                fontWeight="bold"
                fontSize="50"
                fill="white"
                style={{ userSelect: 'none' }}
            >
                m
            </text>
        </svg>
    );
}
