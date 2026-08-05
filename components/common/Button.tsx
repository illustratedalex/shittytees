import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import Link from 'next/link';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

type BaseProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  fullWidth?: boolean;
};

type LinkProps = BaseProps & {
  href: string;
  onClick?: never;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children' | 'href'>;

type NativeButtonProps = BaseProps & {
  href?: never;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>;

export type ButtonProps = LinkProps | NativeButtonProps;

function classesFor(variant: ButtonVariant, size: ButtonSize, fullWidth: boolean, className?: string): string {
  const variantClass = `btn--${variant}`;
  const sizeClass = size === 'md' ? '' : `btn--${size}`;
  const widthClass = fullWidth ? 'w-full' : '';
  return ['btn', variantClass, sizeClass, widthClass, className].filter(Boolean).join(' ');
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  fullWidth = false,
  ...rest
}: ButtonProps) {
  const classNames = classesFor(variant, size, fullWidth, className);

  if ('href' in rest && typeof rest.href === 'string') {
    const { href, ...anchorProps } = rest;
    return (
      <Link href={href} className={classNames} {...anchorProps}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classNames} {...rest}>
      {children}
    </button>
  );
}
