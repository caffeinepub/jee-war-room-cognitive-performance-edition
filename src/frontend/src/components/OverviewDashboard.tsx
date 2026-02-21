import { useGetAllChapters } from '../hooks/useQueries';
import FlexibleScheduleGrid from './FlexibleScheduleGrid';
import ConsistencyDNATracker from './ConsistencyDNATracker';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BookOpen, CheckCircle2, TrendingUp } from 'lucide-react';

export default function OverviewDashboard() {
  const { data: chapters = [], isLoading } = useGetAllChapters();

  const totalChapters = chapters.length;
  const completedChapters = chapters.filter((c) => c.isComplete).length;
  const completionPercentage = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

  const physicsChapters = chapters.filter((c) => c.subject === 'Physics');
  const chemistryChapters = chapters.filter((c) => c.subject === 'Chemistry');
  const mathsChapters = chapters.filter((c) => c.subject === 'Maths');

  const physicsComplete = physicsChapters.filter((c) => c.isComplete).length;
  const chemistryComplete = chemistryChapters.filter((c) => c.isComplete).length;
  const mathsComplete = mathsChapters.filter((c) => c.isComplete).length;

  return (
    <div className="space-y-6">
      {/* Flexible Schedule Grid */}
      <FlexibleScheduleGrid />

      {/* Consistency DNA Tracker */}
      <ConsistencyDNATracker />

      {/* Chapter Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-blue-500/20 bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Chapters</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalChapters}</div>
            <p className="text-xs text-muted-foreground">Across PCM subjects</p>
          </CardContent>
        </Card>

        <Card className="border-green-500/20 bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{completedChapters}</div>
            <p className="text-xs text-muted-foreground">{completionPercentage}% completion rate</p>
          </CardContent>
        </Card>

        <Card className="border-orange-500/20 bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{completionPercentage}%</div>
            <p className="text-xs text-muted-foreground">Overall completion</p>
          </CardContent>
        </Card>
      </div>

      {/* Subject-wise Revision Status */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Subject-wise Revision</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <div className="h-12 animate-pulse rounded bg-muted" />
              <div className="h-12 animate-pulse rounded bg-muted" />
              <div className="h-12 animate-pulse rounded bg-muted" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Physics */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-400">Physics</span>
                  <span className="text-xs text-muted-foreground">
                    {physicsComplete}/{physicsChapters.length} chapters
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{
                      width: `${physicsChapters.length > 0 ? (physicsComplete / physicsChapters.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* Chemistry */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-400">Chemistry</span>
                  <span className="text-xs text-muted-foreground">
                    {chemistryComplete}/{chemistryChapters.length} chapters
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-green-500 transition-all duration-300"
                    style={{
                      width: `${chemistryChapters.length > 0 ? (chemistryComplete / chemistryChapters.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* Maths */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-orange-400">Maths</span>
                  <span className="text-xs text-muted-foreground">
                    {mathsComplete}/{mathsChapters.length} chapters
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-orange-500 transition-all duration-300"
                    style={{
                      width: `${mathsChapters.length > 0 ? (mathsComplete / mathsChapters.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* PCM Distribution */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">PCM Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{physicsChapters.length}</div>
              <p className="text-xs text-muted-foreground">Physics</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{chemistryChapters.length}</div>
              <p className="text-xs text-muted-foreground">Chemistry</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">{mathsChapters.length}</div>
              <p className="text-xs text-muted-foreground">Maths</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
