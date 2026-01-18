import { ImageWithFallback } from './figma/ImageWithFallback';

interface CategoryImageProps {
  category: string;
  className?: string;
}

export function CategoryImage({ category, className = '' }: CategoryImageProps) {
  // Extract the English part from bilingual category names (e.g., "Snacks (സ്നാക്ക്സ്)" -> "Snacks")
  const categoryKey = category.split(' (')[0];
  
  const categoryImages: Record<string, string> = {
    'Snacks': 'https://images.unsplash.com/photo-1642240231842-65462fedb8de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrZXJhbGElMjB0cmFkaXRpb25hbCUyMHNuYWNrc3xlbnwxfHx8fDE3NTk5MjkxMzV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    'Pickles': 'https://images.unsplash.com/photo-1617854307432-13950e24ba07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwaWNrbGUlMjBqYXJzfGVufDF8fHx8MTc1OTkyOTEzNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    'Handicrafts': 'https://images.unsplash.com/photo-1717913491408-d316a523efc8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBoYW5kaWNyYWZ0cyUyMHdvb2RlbnxlbnwxfHx8fDE3NTk5MjkxMzV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    'Embroidery': 'https://images.unsplash.com/photo-1758278212585-c050f6ee5742?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBlbWJyb2lkZXJ5JTIwdGV4dGlsZXxlbnwxfHx8fDE3NTk5MjkxMzV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    'Beauty': 'https://images.unsplash.com/photo-1694539181840-a8bf5b855b68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxheXVydmVkaWMlMjBiZWF1dHklMjBwcm9kdWN0c3xlbnwxfHx8fDE3NTk5MjkxMzV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  };

  return (
    <ImageWithFallback
      src={categoryImages[categoryKey] || ''}
      alt={category}
      className={className}
    />
  );
}
