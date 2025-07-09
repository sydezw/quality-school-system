
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  details?: string;
  className?: string;
  gradient?: string;
  delay?: number;
  onClick?: () => void;
}

const StatCard = ({ 
  title, 
  value, 
  icon, 
  details, 
  className, 
  gradient = "from-gray-50 to-gray-100",
  delay = 0,
  onClick
}: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className={cn("cursor-pointer", onClick && "hover:shadow-lg transition-shadow")}
      onClick={onClick}
    >
      <Card className={cn(
        "relative overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300",
        className
      )}>
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-90",
          gradient
        )} />
        <div className="relative z-10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">{title}</CardTitle>
            <motion.div
              whileHover={{ rotate: 5, scale: 1.1 }}
              transition={{ duration: 0.2 }}
              className="p-2 rounded-full bg-white/20 backdrop-blur-sm"
            >
              {icon}
            </motion.div>
          </CardHeader>
          <CardContent className="pt-0">
            <motion.div 
              className="text-3xl font-bold text-gray-800 mb-1"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: delay + 0.2 }}
            >
              {value}
            </motion.div>
            {details && (
              <p className="text-xs text-gray-600 font-medium">{details}</p>
            )}
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
};

export default StatCard;
