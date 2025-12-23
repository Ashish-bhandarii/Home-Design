import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" fill="none">
            {/* House structure */}
            <path
                d="M24 4L6 16V42H18V30H30V42H42V16L24 4Z"
                fill="currentColor"
                opacity="0.9"
            />
            {/* Roof accent */}
            <path
                d="M24 4L42 16H6L24 4Z"
                fill="url(#homeGradient)"
                opacity="0.7"
            />
            {/* Window */}
            <rect x="20" y="20" width="8" height="6" rx="1" fill="#fff" opacity="0.3" />
            {/* Door */}
            <rect x="21" y="32" width="6" height="10" rx="1" fill="#fff" opacity="0.4" />
            <defs>
                <linearGradient id="homeGradient" x1="6" y1="4" x2="42" y2="16" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#ff5722" />
                    <stop offset="50%" stopColor="#ff9800" />
                    <stop offset="100%" stopColor="#ffc107" />
                </linearGradient>
            </defs>
        </svg>
    );
}
