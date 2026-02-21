import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Zap, BookOpen, Target, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { useGetAllChapters, useGetWarModeStats } from '../hooks/useQueries';
import TopPYQsTracker from './TopPYQsTracker';
import WarModeConfigModal from './WarModeConfigModal';

interface WarModeConfig {
  focusDuration: number;
  breakDuration: number | null;
  breaksEnabled: boolean;
}

interface OverviewDashboardProps {
  onStartWarMode: (config: WarModeConfig) => void;
}

export default function OverviewDashboard({ onStartWarMode }: OverviewDashboardProps) {
  const [isWarModeModalOpen, setIsWarModeModalOpen] = useState(false);
  const { data: chapters = [], isLoading: chaptersLoading } = useGetAllChapters();
  const { data: warModeStats, isLoading: statsLoading } = useGetWarModeStats();

  // Calculate chapter completion percentage
  const totalChapters = chapters.length;
  const completedChapters = chapters.filter((ch) => ch.isComplete).length;
  const chapterCompletionPercentage = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

  // Calculate overall revision coverage
  const calculateRevisionCoverage = () => {
    if (totalChapters === 0) return 0;
    
    const totalRevisionPercentage = chapters.reduce((sum, chapter) => {
      const completedFields = [
        chapter.theoryCompleted,
        chapter.pyqsCompleted,
        chapter.advancedPracticeCompleted,
      ].filter(Boolean).length;
      return sum + (completedFields / 3) * 100;
    }, 0);
    
    return Math.round(totalRevisionPercentage / totalChapters);
  };

  const overallRevisionCoverage = calculateRevisionCoverage();

  // Calculate subject-wise revision coverage
  const calculateSubjectRevision = (subject: string) => {
    const subjectChapters = chapters.filter((ch) => ch.subject === subject);
    if (subjectChapters.length === 0) return 0;
    
    const totalRevisionPercentage = subjectChapters.reduce((sum, chapter) => {
      const completedFields = [
        chapter.theoryCompleted,
        chapter.pyqsCompleted,
        chapter.advancedPracticeCompleted,
      ].filter(Boolean).length;
      return sum + (completedFields / 3) * 100;
    }, 0);
    
    return Math.round(totalRevisionPercentage / subjectChapters.length);
  };

  // Get critical incomplete chapters (not complete and high importance)
  const criticalIncompleteChapters = chapters
    .filter((ch) => !ch.isComplete && ch.importance === 'High')
    .slice(0, 3);

  // Calculate PCM ratio
  const physicsChapters = chapters.filter((ch) => ch.subject === 'Physics').length;
  const chemistryChapters = chapters.filter((ch) => ch.subject.includes('Chemistry')).length;
  const mathsChapters = chapters.filter((ch) => ch.subject === 'Mathematics').length;

  // Convert War Mode study time from minutes to hours with 1 decimal place
  const totalWarModeHours = warModeStats?.totalWarModeStudyTime 
    ? (Number(warModeStats.totalWarModeStudyTime) / 60).toFixed(1)
    : '0.0';

  const handleEnterWarMode = (config: WarModeConfig) => {
    console.log('[OverviewDashboard] War Mode config received:', config);
    setIsWarModeModalOpen(false);
    onStartWarMode(config);
  };

  if (chaptersLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* War Mode Button */}
      <Card className="border-primary/50 bg-gradient-to-br from-primary/10 to-primary/5">
        <CardContent className="pt-6">
          <Button
            onClick={() => setIsWarModeModalOpen(true)}
            size="lg"
            className="w-full h-16 text-lg font-bold bg-primary hover:bg-primary/90 transition-all duration-200"
          >
            <Zap className="mr-2 h-6 w-6" />
            ENTER WAR MODE
          </Button>
        </CardContent>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Chapter Completion */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              Chapter Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{chapterCompletionPercentage}%</span>
                <span className="text-sm text-muted-foreground">
                  {completedChapters}/{totalChapters}
                </span>
              </div>
              <Progress value={chapterCompletionPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Overall Revision Coverage */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Revision Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{overallRevisionCoverage}%</span>
              </div>
              <Progress value={overallRevisionCoverage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Total War Mode Hours */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              War Mode Study Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{totalWarModeHours}</span>
                <span className="text-sm text-muted-foreground">hours</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subject-wise Revision Coverage */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Subject-wise Revision</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {['Physics', 'Chemistry', 'Mathematics'].map((subject) => {
            const coverage = calculateSubjectRevision(subject);
            return (
              <div key={subject} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{subject}</span>
                  <span className="text-sm text-muted-foreground">{coverage}%</span>
                </div>
                <Progress value={coverage} className="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* PCM Ratio */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">PCM Chapter Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-around">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{physicsChapters}</div>
              <div className="text-xs text-muted-foreground">Physics</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{chemistryChapters}</div>
              <div className="text-xs text-muted-foreground">Chemistry</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">{mathsChapters}</div>
              <div className="text-xs text-muted-foreground">Maths</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Incomplete Chapters */}
      {criticalIncompleteChapters.length > 0 && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Critical Incomplete Chapters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {criticalIncompleteChapters.map((chapter) => (
                <div
                  key={String(chapter.id)}
                  className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg"
                >
                  <div>
                    <div className="font-medium">{chapter.name}</div>
                    <div className="text-sm text-muted-foreground">{chapter.subject}</div>
                  </div>
                  <Badge variant="destructive">{chapter.importance}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top PYQs Tracker */}
      <TopPYQsTracker />

      {/* War Mode Config Modal */}
      <WarModeConfigModal
        open={isWarModeModalOpen}
        onOpenChange={setIsWarModeModalOpen}
        onEnterWarMode={handleEnterWarMode}
      />
    </div>
  );
}
