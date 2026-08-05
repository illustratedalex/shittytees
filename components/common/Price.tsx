interface PriceProps {
  amount: number;
  compareAt?: number;
  currency?: string;
  className?: string;
}

function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function Price({ amount, compareAt, currency = 'USD', className }: PriceProps) {
  const hasCompare = typeof compareAt === 'number' && compareAt > amount;

  return (
    <div className={['flex items-center gap-2', className].filter(Boolean).join(' ')}>
      <span className="price">{formatPrice(amount, currency)}</span>
      {hasCompare ? <span className="price--compare">{formatPrice(compareAt, currency)}</span> : null}
    </div>
  );
}
