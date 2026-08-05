import Badge from './Badge';

interface ProductLabelProps {
  category: string;
  status?: 'new' | 'core' | 'drop' | 'limited';
  className?: string;
}

const STATUS_TEXT: Record<NonNullable<ProductLabelProps['status']>, string> = {
  new: 'New',
  core: 'Core',
  drop: 'Drop',
  limited: 'Limited',
};

export default function ProductLabel({ category, status = 'core', className }: ProductLabelProps) {
  return (
    <div className={['flex items-center justify-between gap-3', className].filter(Boolean).join(' ')}>
      <p className="premium-product-label">{category}</p>
      <Badge tone={status === 'core' ? 'soft' : 'default'}>{STATUS_TEXT[status]}</Badge>
    </div>
  );
}
