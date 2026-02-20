import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetWarModeStats, useGetPerformanceBlocks, useRegisterUser } from '../hooks/useQueries';
import { AlertCircle, TrendingDown, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

function FocusStabilityIndex() {
  const { data: warStats, isLoading: warLoading, error: warError } = useGetWarModeStats();
  const { data: performanceBlocks, isLoading: perfLoading } = useGetPerformanceBlocks();
  const registerUser = useRegisterUser();
  const [fsiScore, setFsiScore] = useState(0);
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');

  useEffect(() => {
    if (warError && warError.message.includes('User not found')) {
      registerUser.mutate();
    }
  }, [warError]);

  useEffect(() => {
    if (warStats && performanceBlocks) {
      // FSI Formula: 40% deep work + 20% task switching + 20% distraction + 10% sleep + 10% war mode usage
      
      // 1. Deep Work Hours (40%) - from War Mode sessions
      const studyHours = Number(warStats.totalStudyTime) / 3600;
      const deepWorkScore = Math.min((studyHours / 8) * 40, 40); // Target: 8 hours/day
      
      // 2. Task Switching Penalty (20%) - inverse of performance blocks count
      const recentBlocks = performanceBlocks.filter(block => {
        const blockTime = Number(block.startTime) / 1_000_000;
        const daysSince = (Date.now() - blockTime) / (1000 * 60 * 60 * 24);
        return daysSince <= 7;
      });
      const taskSwitchScore = Math.max(20 - (recentBlocks.length * 2), 0); // Penalty for too many blocks
      
      // 3. Distraction Penalty (20%) - based on average focus score from performance blocks
      const avgFocusScore = recentBlocks.length > 0
        ? recentBlocks.reduce((sum, block) => sum + Number(block.focusScore), 0) / recentBlocks.length
        : 50;
      const distractionScore = (avgFocusScore / 100) * 20;
      
      // 4. Sleep Quality (10%) - placeholder, assume 8/10 for now
      const sleepScore = 8;
      
      // 5. War Mode Usage (10%) - based on completed pomodoros
      const pomodoroScore = Math.min((Number(warStats.completedPomodoros) / 10) * 10, 10); // Target: 10 pomodoros
      
      const totalScore = deepWorkScore + taskSwitchScore + distractionScore + sleepScore + pomodoroScore;
      setFsiScore(Math.round(Math.min(totalScore, 100)));

      // Calculate trend based on recent performance
      if (recentBlocks.length >= 2) {
        const recentAvg = recentBlocks.slice(-3).reduce((sum, b) => sum + Number(b.focusScore), 0) / Math.min(3, recentBlocks.length);
        const olderAvg = recentBlocks.slice(0, -3).reduce((sum, b) => sum + Number(b.focusScore), 0) / Math.max(1, recentBlocks.length - 3);
        
        if (recentAvg > olderAvg + 5) setTrend('up');
        else if (recentAvg < olderAvg - 5) setTrend('down');
        else setTrend('stable');
      } else {
        setTrend('stable');
      }
    }
  }, [warStats, performanceBlocks]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-chart-2';
    if (score >= 60) return 'text-chart-1';
    if (score >= 40) return 'text-chart-4';
    return 'text-destructive';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Elite';
    if (score >= 60) return 'Stable';
    if (score >= 40) return 'Unstable';
    return 'Distracted';
  };

  if (warLoading || perfLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Focus Stability Index</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Focus Stability Index</span>
          {trend === 'up' && <TrendingUp className="h-5 w-5 text-chart-2 transition-all duration-300" />}
          {trend === 'down' && <TrendingDown className="h-5 w-5 text-destructive transition-all duration-300" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                className="text-muted/20"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 70}`}
                strokeDashoffset={`${2 * Math.PI * 70 * (1 - fsiScore / 100)}`}
                className={`transition-all duration-300 ${
                  fsiScore >= 80
                    ? 'text-chart-2'
                    : fsiScore >= 60
                    ? 'text-chart-1'
                    : fsiScore >= 40
                    ? 'text-chart-4'
                    : 'text-destructive'
                }`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-bold transition-colors duration-300 ${getScoreColor(fsiScore)}`}>{fsiScore}</span>
              <span className="text-sm text-muted-foreground">{getScoreLabel(fsiScore)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Deep Work Hours</span>
            <span className="font-medium">
              {warStats ? Math.round(Number(warStats.totalStudyTime) / 3600) : 0}h
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">War Mode Sessions</span>
            <span className="font-medium">{warStats ? Number(warStats.completedPomodoros) : 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">7-Day Trend</span>
            <span className={`font-medium transition-colors duration-300 ${trend === 'up' ? 'text-chart-2' : trend === 'down' ? 'text-destructive' : ''}`}>
              {trend === 'up' ? '↑ Improving' : trend === 'down' ? '↓ Declining' : '→ Stable'}
            </span>
          </div>
        </div>

        {fsiScore < 60 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your focus stability is below optimal. Consider entering War Mode for focused study sessions.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

export default FocusStabilityIndex;
