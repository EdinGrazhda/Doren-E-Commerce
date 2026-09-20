import type { ImgHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

const logoSources = {
    transparent: '/logo/doren-black-logo-removebg-preview.png',
    dark: '/Images/doren-black-logo.jpeg',
    light: '/Images/doren-white-logo.jpeg',
} as const;

type BrandLogoProps = ImgHTMLAttributes<HTMLImageElement> & {
    variant?: keyof typeof logoSources;
};

export default function BrandLogo({
    variant = 'transparent',
    alt = 'Doren Menswear',
    className,
    ...props
}: BrandLogoProps) {
    return (
        <img
            src={logoSources[variant]}
            alt={alt}
            className={cn('object-contain', className)}
            decoding="async"
            {...props}
        />
    );
}
