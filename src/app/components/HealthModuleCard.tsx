import { LucideIcon } from 'lucide-react';
import { Card } from './ui/card';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface HealthModuleCardProps {
  title: string;
  icon: LucideIcon;
  score: number;
  subtitle: string;
  isEnabled: boolean;
  onToggle: () => void;
  onViewDetails?: () => void;
  trend?: 'up' | 'down' | 'stable';
  accentColor: string;
}

export function HealthModuleCard({
  title,
  icon: Icon,
  score,
  subtitle,
  isEnabled,
  onToggle,
  onViewDetails,
  trend = 'stable',
  accentColor,
}: HealthModuleCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getTrendIndicator = () => {
    if (trend === 'up') return '↗';
    if (trend === 'down') return '↘';
    return '→';
  };

  return (
    <Card className="group cursor-pointer transition-all hover:shadow-lg">
      <div className="p-6">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-lg ${accentColor}`}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>
          <Switch checked={isEnabled} onCheckedChange={onToggle} />
        </div>

        {/* Title */}
        <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>

        {/* Score */}
        <div className="mb-3 flex items-baseline gap-2">
          <span className={`text-3xl font-bold ${getScoreColor(score)}`}>
            {score}
          </span>
          <span className="text-sm text-gray-400">/ 100</span>
          <span className="text-xl text-gray-400">{getTrendIndicator()}</span>
        </div>

        {/* Subtitle */}
        <p className="mb-4 text-sm text-gray-600">{subtitle}</p>

        {/* Status Badge */}
        <div className="mb-4">
          {isEnabled ? (
            <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
              Tracking Active
            </Badge>
          ) : (
            <Badge variant="outline" className="border-gray-200 bg-gray-50 text-gray-600">
              Paused
            </Badge>
          )}
        </div>

        {/* View Details Button */}
        {onViewDetails && (
          <Button
            variant="ghost"
            className="w-full text-sm font-medium text-teal-600 hover:bg-teal-50 hover:text-teal-700"
            onClick={onViewDetails}
          >
            View Details →
          </Button>
        )}
      </div>
    </Card>
  );
}