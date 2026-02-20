import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useUpdateWarModeStats } from '../hooks/useQueries';
import { Swords, Play, Pause, SkipForward, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface WarModeProps {
  onExit: () => void;
}

const WORK_DURATION = 50 * 60; // 50 minutes in seconds
const BREAK_DURATION = 10 * 60; // 10 minutes in seconds

function WarMode({ onExit }: WarModeProps) {
  const [isWorking, setIsWorking] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(WORK_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [totalStudyTime, setTotalStudyTime] = useState(0);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const updateStats = useUpdateWarModeStats();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Timer completed
            if (isWorking) {
              setCompletedPomodoros((p) => p + 1);
              setTotalStudyTime((t) => t + WORK_DURATION);
              setIsWorking(false);
              setTimeRemaining(BREAK_DURATION);
            } else {
              setIsWorking(true);
              setTimeRemaining(WORK_DURATION);
            }
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeRemaining, isWorking]);

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleSkip = () => {
    if (isWorking) {
      setCompletedPomodoros((p) => p + 1);
      setTotalStudyTime((t) => t + (WORK_DURATION - timeRemaining));
      setIsWorking(false);
      setTimeRemaining(BREAK_DURATION);
    } else {
      setIsWorking(true);
      setTimeRemaining(WORK_DURATION);
    }
    setIsRunning(false);
  };

  const handleExit = async () => {
    if (completedPomodoros > 0 || totalStudyTime > 0) {
      try {
        await updateStats.mutateAsync({
          pomodoros: BigInt(completedPomodoros),
          studyTime: BigInt(totalStudyTime),
        });
      } catch (err) {
        console.error('Failed to save war mode stats:', err);
      }
    }
    onExit();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const progress = isWorking
    ? ((WORK_DURATION - timeRemaining) / WORK_DURATION) * 100
    : ((BREAK_DURATION - timeRemaining) / BREAK_DURATION) * 100;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-foreground flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Swords className="h-10 w-10 sm:h-12 sm:w-12 text-destructive" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">WAR MODE</h1>
          <p className="text-lg sm:text-xl text-muted-foreground font-medium">Focus. Execute. Dominate.</p>
        </div>

        {/* Timer Card */}
        <Card className="border-2 border-destructive/50 bg-card/50 backdrop-blur">
          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-4">
              <div className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {isWorking ? '🎯 Work Session' : '☕ Break Time'}
              </div>
              <div className="text-6xl sm:text-7xl md:text-8xl font-bold tabular-nums text-primary">{formatTime(timeRemaining)}</div>
              <Progress value={progress} className="h-3" />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3 sm:gap-4">
              <Button
                onClick={handleStartPause}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 sm:px-8 min-h-[44px]"
              >
                {isRunning ? (
                  <>
                    <Pause className="mr-2 h-5 w-5" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-5 w-5" />
                    Start
                  </>
                )}
              </Button>
              <Button onClick={handleSkip} size="lg" variant="outline" className="min-h-[44px]">
                <SkipForward className="mr-2 h-5 w-5" />
                Skip
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-chart-2">{completedPomodoros}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Pomodoros</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-chart-1">
                  {Math.round(totalStudyTime / 60)}m
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">Study Time</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exit Button */}
        <div className="text-center">
          <Button
            onClick={() => setShowExitDialog(true)}
            variant="ghost"
            className="text-muted-foreground hover:text-foreground min-h-[44px]"
          >
            <X className="mr-2 h-4 w-4" />
            Exit War Mode
          </Button>
        </div>
      </div>

      {/* Exit Confirmation Dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exit War Mode?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to exit? Your progress will be saved, but your current session will end.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-[44px]">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleExit} className="min-h-[44px]">Exit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default WarMode;
