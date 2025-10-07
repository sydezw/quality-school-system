
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  details?: string;
  className?: string;
}

const StatCard = ({ title, value, icon, details, className }: StatCardProps) => {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value || '0'}</div>
        {details && <p className="text-xs text-muted-foreground">{details}</p>}
      </CardContent>
    </Card>
  );
};

export default StatCard;
