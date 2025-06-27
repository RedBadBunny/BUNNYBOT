import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  iconColor, 
  iconBgColor,
  trend 
}: StatsCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          <p className={`text-sm mt-1 ${
            trend ? (trend.isPositive ? "text-green-600" : "text-red-600") : "text-slate-500"
          }`}>
            {trend && (
              <span className="inline-flex items-center">
                <i className={`fas fa-arrow-${trend.isPositive ? "up" : "down"} mr-1`}></i>
                {trend.value}
              </span>
            )}
            {!trend && subtitle}
          </p>
        </div>
        <div className={`w-12 h-12 ${iconBgColor} rounded-lg flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}
