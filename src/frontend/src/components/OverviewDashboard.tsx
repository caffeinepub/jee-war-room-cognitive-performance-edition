import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetAllChapters, useGetWarModeStats } from '../hooks/useQueries';
import { BookCheck, PieChart, Clock, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

function OverviewDashboard() {
  const { data: chapters, isLoading: chaptersLoading } = useGetAllChapters();
  const { data: warModeStats, isLoading: warModeLoading } = useGetWarModeStats();

  // Calculate chapter completion percentage
  const completedStatuses = ['Completed', 'Revised Once', 'Revised Twice', 'Mastered'];
  const completedChapters = chapters?.filter(ch => completedStatuses.includes(ch.difficulty)) || [];
  const totalChapters = chapters?.length || 0;
  const completionPercentage = totalChapters > 0 ? Math.round((completedChapters.length / totalChapters) * 100) : 0;

  // Calculate PCM ratio
  const physicsChapters = chapters?.filter(ch => ch.subject === 'Physics').length || 0;
  const chemistryChapters = chapters?.filter(ch => 
    ch.subject === 'Physical Chemistry' || 
    ch.subject === 'Organic Chemistry' || 
    ch.subject === 'Inorganic Chemistry'
  ).length || 0;
  const mathsChapters = chapters?.filter(ch => ch.subject === 'Mathematics').length || 0;

  // Calculate War Mode hours
  const totalStudyMinutes = warModeStats ? Number(warModeStats.totalStudyTime) : 0;
  const warModeHours = Math.floor(totalStudyMinutes / 60);
  const warModeMinutes = totalStudyMinutes % 60;

  // Find weak chapters (using importance as proxy for weakness since backend doesn't have weakness field)
  const weakChapters = chapters?.filter(ch => ch.importance === 'Critical' && !ch.isComplete) || [];

  if (chaptersLoading || warModeLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Chapter Completion Percentage */}
        <Card className="border-primary/30 transition-all duration-200 hover:border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <BookCheck className="h-5 w-5 text-primary" />
              Chapter Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <div className="relative w-32 h-32 sm:w-40 sm:h-40">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    stroke="oklch(var(--muted))"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    stroke="oklch(var(--primary))"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 45} ${2 * Math.PI * 45}`}
                    strokeDashoffset={2 * Math.PI * 45 * (1 - completionPercentage / 100)}
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl sm:text-4xl font-bold text-primary">{completionPercentage}%</span>
                  <span className="text-xs text-muted-foreground">{completedChapters.length}/{totalChapters}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PCM Ratio Tracker */}
        <Card className="border-chart-1/30 transition-all duration-200 hover:border-chart-1/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <PieChart className="h-5 w-5 text-chart-1" />
              PCM Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Physics</span>
                  <span className="font-semibold">{physicsChapters} chapters</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-chart-2 transition-all duration-500"
                    style={{ width: `${totalChapters > 0 ? (physicsChapters / totalChapters) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Chemistry</span>
                  <span className="font-semibold">{chemistryChapters} chapters</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-chart-1 transition-all duration-500"
                    style={{ width: `${totalChapters > 0 ? (chemistryChapters / totalChapters) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Mathematics</span>
                  <span className="font-semibold">{mathsChapters} chapters</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-chart-3 transition-all duration-500"
                    style={{ width: `${totalChapters > 0 ? (mathsChapters / totalChapters) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* War Mode Hours */}
        <Card className="border-destructive/30 transition-all duration-200 hover:border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Clock className="h-5 w-5 text-destructive" />
              War Mode Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-4">
              <div className="text-4xl sm:text-5xl font-bold text-destructive">
                {warModeHours}h {warModeMinutes}m
              </div>
              <p className="text-sm text-muted-foreground mt-2">Total study time</p>
              {warModeStats && (
                <p className="text-xs text-muted-foreground mt-1">
                  {Number(warModeStats.completedPomodoros)} sessions completed
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Weak Chapter Alerts */}
        <Card className="border-chart-4/30 transition-all duration-200 hover:border-chart-4/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <AlertTriangle className="h-5 w-5 text-chart-4" />
              Critical Chapters
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weakChapters.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <p className="text-sm text-muted-foreground">No critical incomplete chapters</p>
                <p className="text-xs text-muted-foreground mt-1">Keep up the great work! 🎯</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {weakChapters.slice(0, 5).map((chapter) => (
                  <div
                    key={Number(chapter.id)}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50 transition-all duration-200 hover:bg-muted"
                  >
                    <span className="text-sm font-medium truncate flex-1">{chapter.name}</span>
                    <Badge variant="destructive" className="ml-2 text-xs">
                      {chapter.subject}
                    </Badge>
                  </div>
                ))}
                {weakChapters.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    +{weakChapters.length - 5} more critical chapters
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default OverviewDashboard;
