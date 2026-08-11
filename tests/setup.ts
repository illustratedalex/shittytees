import '@testing-library/jest-dom/vitest';
import React from 'react';
import { vi } from 'vitest';

vi.mock('next/image', () => ({
	default: ({ src, alt, fill: _fill, unoptimized: _unoptimized, priority: _priority, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; unoptimized?: boolean; priority?: boolean }) =>
		React.createElement('img', {
			...props,
			src: typeof src === 'string' ? src : '',
			alt: alt || '',
		}),
}));

vi.mock('next/link', () => ({
	default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children: React.ReactNode }) =>
		React.createElement('a', {
			...props,
			href,
		}, children),
}));
