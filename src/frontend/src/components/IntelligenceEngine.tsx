import { useGetAllChapters, useGetWarModeStats, useGetTimeSlots } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { AlertTriangle, TrendingDown, Lightbulb } from 'lucide-react';

export default function IntelligenceEngine() {
  const { data: chapters = [], isLoading: chaptersLoading } = useGetAllChapters();
  const { data: warModeStats, isLoading: warModeLoading } = useGetWarModeStats();
  const { data: timeSlots = [], isLoading: timeSlotsLoading } = useGetTimeSlots();

  const isLoading = chaptersLoading || warModeLoading || timeSlotsLoading;

  // Weakness Detection: Find incomplete high-importance chapters
  const weaknesses = chapters.filter(
    (chapter) => chapter.importance === 'High' && !chapter.isComplete
  );

  // Burnout Risk Assessment
  const calculateBurnoutRisk = (): 'Low' | 'Medium' | 'High' => {
    if (!timeSlots.length) return 'Low';

    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const recentSlots = timeSlots.filter(
      (slot) => now - Number(slot.startTime) / 1_000_000 < 7 * oneDayMs
    );

    const totalStudyMinutes = recentSlots.reduce((acc, slot) => {
      const duration = (Number(slot.endTime) - Number(slot.startTime)) / 60_000_000_000;
      return acc + duration;
    }, 0);

    const avgDailyMinutes = totalStudyMinutes / 7;

    if (avgDailyMinutes > 600) return 'High';
    if (avgDailyMinutes > 420) return 'Medium';
    return 'Low';
  };

  const burnoutRisk = calculateBurnoutRisk();

  // Daily Suggestions
  const generateSuggestions = (): string[] => {
    const suggestions: string[] = [];

    if (weaknesses.length > 0) {
      suggestions.push(`Focus on ${weaknesses.length} high-importance incomplete chapter${weaknesses.length > 1 ? 's' : ''}`);
    }

    if (burnoutRisk === 'High') {
      suggestions.push('Consider taking a break - burnout risk is high');
    }

    const warModeUsage = Number(warModeStats?.totalWarModeStudyTime || 0n);
    if (warModeUsage < 3600) {
      suggestions.push('Try War Mode for focused study sessions');
    }

    const completedChapters = chapters.filter((c) => c.isComplete).length;
    const totalChapters = chapters.length;
    if (totalChapters > 0 && completedChapters / totalChapters < 0.5) {
      suggestions.push('Aim to complete at least 50% of your chapters');
    }

    if (suggestions.length === 0) {
      suggestions.push('Great progress! Keep up the consistent work');
    }

    return suggestions;
  };

  const suggestions = generateSuggestions();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-48 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Weakness Detection */}
      <Card className="border-orange-500/20 bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-400">
            <AlertTriangle className="h-5 w-5" />
            Weakness Detection
          </CardTitle>
        </CardHeader>
        <CardContent>
          {weaknesses.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {weaknesses.length} high-importance chapter{weaknesses.length > 1 ? 's' : ''} need attention:
              </p>
              <ul className="space-y-1">
                {weaknesses.slice(0, 5).map((chapter) => (
                  <li key={Number(chapter.id)} className="text-sm">
                    <span className="font-medium text-foreground">{chapter.name}</span>
                    <span className="text-muted-foreground"> ({chapter.subject})</span>
                  </li>
                ))}
              </ul>
              {weaknesses.length > 5 && (
                <p className="text-xs text-muted-foreground">
                  +{weaknesses.length - 5} more chapters
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No critical weaknesses detected. All high-importance chapters are complete!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Burnout Risk */}
      <Card className="border-red-500/20 bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-400">
            <TrendingDown className="h-5 w-5" />
            Burnout Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Current Risk Level:</span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  burnoutRisk === 'High'
                    ? 'bg-red-500/20 text-red-400'
                    : burnoutRisk === 'Medium'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-green-500/20 text-green-400'
                }`}
              >
                {burnoutRisk}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {burnoutRisk === 'High' &&
                'You are studying intensively. Consider taking breaks to avoid burnout.'}
              {burnoutRisk === 'Medium' &&
                'Your study load is moderate. Maintain a healthy balance.'}
              {burnoutRisk === 'Low' &&
                'Your study schedule looks sustainable. Keep it up!'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Daily Suggestions */}
      <Card className="border-blue-500/20 bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-400">
            <Lightbulb className="h-5 w-5" />
            Daily Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400" />
                <span className="text-muted-foreground">{suggestion}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
