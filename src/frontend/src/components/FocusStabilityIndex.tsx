import { useGetTimeSlots, useGetWarModeStats } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function FocusStabilityIndex() {
  const { data: timeSlots = [], isLoading: timeSlotsLoading } = useGetTimeSlots();
  const { data: warModeStats, isLoading: warModeLoading } = useGetWarModeStats();

  const isLoading = timeSlotsLoading || warModeLoading;

  const calculateFSI = (): number => {
    if (timeSlots.length === 0) return 0;

    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const recentSlots = timeSlots.filter(
      (slot) => now - Number(slot.startTime) / 1_000_000 < sevenDaysMs
    );

    if (recentSlots.length === 0) return 0;

    // Deep Work Hours (50%)
    const studySlots = recentSlots.filter((slot) => slot.activityType === 'study');
    const totalStudyMinutes = studySlots.reduce((acc, slot) => {
      const duration = (Number(slot.endTime) - Number(slot.startTime)) / 60_000_000_000;
      return acc + duration;
    }, 0);
    const deepWorkScore = Math.min((totalStudyMinutes / (7 * 240)) * 100, 100);

    // Task Switching Penalty (25%)
    const avgSlotsPerDay = recentSlots.length / 7;
    const taskSwitchingScore = Math.max(100 - avgSlotsPerDay * 5, 0);

    // Distraction Penalty (25%)
    const completedSlots = recentSlots.filter((slot) => slot.isComplete).length;
    const completionRate = recentSlots.length > 0 ? completedSlots / recentSlots.length : 0;
    const distractionScore = completionRate * 100;

    // Final FSI calculation (no sleep quality)
    const fsi = deepWorkScore * 0.5 + taskSwitchingScore * 0.25 + distractionScore * 0.25;

    return Math.round(fsi);
  };

  const fsi = calculateFSI();

  const getFSIColor = (score: number): string => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-blue-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getFSIRingColor = (score: number): string => {
    if (score >= 80) return 'stroke-green-500';
    if (score >= 60) return 'stroke-blue-500';
    if (score >= 40) return 'stroke-yellow-500';
    return 'stroke-red-500';
  };

  const getFSILabel = (score: number): string => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const getTrendIcon = () => {
    if (fsi >= 70) return <TrendingUp className="h-4 w-4 text-green-400" />;
    if (fsi >= 40) return <Minus className="h-4 w-4 text-yellow-400" />;
    return <TrendingDown className="h-4 w-4 text-red-400" />;
  };

  if (isLoading) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Focus Stability Index</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-32 w-32 animate-pulse rounded-full bg-muted" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (fsi / 100) * circumference;

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-foreground">Focus Stability Index</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center">
          <div className="relative h-40 w-40">
            <svg className="h-full w-full -rotate-90 transform">
              <circle
                cx="80"
                cy="80"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted"
              />
              <circle
                cx="80"
                cy="80"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className={`${getFSIRingColor(fsi)} transition-all duration-500`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold ${getFSIColor(fsi)}`}>{fsi}</span>
              <span className="text-xs text-muted-foreground">/ 100</span>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-center">
          <div className="flex items-center justify-center gap-2">
            {getTrendIcon()}
            <span className={`text-sm font-medium ${getFSIColor(fsi)}`}>{getFSILabel(fsi)}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Based on deep work hours, task switching, and completion rate
          </p>
        </div>

        <div className="space-y-2 rounded-lg border border-border bg-muted/50 p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Deep Work Hours</span>
            <span className="font-medium text-foreground">50%</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Task Switching</span>
            <span className="font-medium text-foreground">25%</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Distraction Control</span>
            <span className="font-medium text-foreground">25%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
