export interface StatCardProps {
      label: string;
      value: string | number;
      sub?: string;
      icon?: React.ReactNode;
      trend?: number;
      accent?: 'gold' | 'teal' | 'red' | 'purple' | string;
      delay?: number;
}

export type BadgeVariant = 'gold' | 'teal' | 'red' | 'purple' | 'muted';
