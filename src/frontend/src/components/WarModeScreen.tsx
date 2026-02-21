import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Play, Pause, X } from 'lucide-react';
import { toast } from 'sonner';

interface WarModeScreenProps {
  focusDuration: number; // in minutes
  breakDuration: number | null; // in minutes, null if breaks disabled
  breaksEnabled: boolean;
  onExit: () => void;
  onSessionEnd: (totalFocusMinutes: number) => void;
}

type SessionPhase = 'focus' | 'break' | 'completed';
type TimerState = 'idle' | 'running' | 'paused';

function WarModeScreen({
  focusDuration,
  breakDuration,
  breaksEnabled,
  onExit,
  onSessionEnd,
}: WarModeScreenProps) {
  const [phase, setPhase] = useState<SessionPhase>('focus');
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [remainingSeconds, setRemainingSeconds] = useState(focusDuration * 60);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [totalActiveFocusSeconds, setTotalActiveFocusSeconds] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastTickRef = useRef<number>(Date.now());
  const originalFocusDuration = useRef(focusDuration);
  const hasTrackedSession = useRef(false);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start timer
  const handleStart = () => {
    console.log('[WarMode] Starting timer');
    setTimerState('running');
    lastTickRef.current = Date.now();
  };

  // Pause timer
  const handlePause = () => {
    console.log('[WarMode] Pausing timer');
    setTimerState('paused');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Resume timer
  const handleResume = () => {
    console.log('[WarMode] Resuming timer');
    setTimerState('running');
    lastTickRef.current = Date.now();
  };

  // Handle exit confirmation
  const handleExitClick = () => {
    setShowExitConfirm(true);
  };

  const handleConfirmExit = () => {
    try {
      console.log('[WarMode] Exiting War Mode, total focus seconds:', totalActiveFocusSeconds);
      // Track session end before exiting
      const totalFocusMinutes = Math.floor(totalActiveFocusSeconds / 60);
      if (totalFocusMinutes > 0 && !hasTrackedSession.current) {
        hasTrackedSession.current = true;
        onSessionEnd(totalFocusMinutes);
      }
      onExit();
    } catch (error) {
      console.error('[WarMode] Error during exit:', error);
      toast.error('Failed to save session data');
    }
  };

  // Start next session
  const handleStartNextSession = () => {
    console.log('[WarMode] Starting next session');
    // Track completed session
    const totalFocusMinutes = Math.floor(totalActiveFocusSeconds / 60);
    if (totalFocusMinutes > 0 && !hasTrackedSession.current) {
      hasTrackedSession.current = true;
      onSessionEnd(totalFocusMinutes);
    }
    
    // Reset for new session
    setPhase('focus');
    setTimerState('idle');
    setRemainingSeconds(originalFocusDuration.current * 60);
    setTotalActiveFocusSeconds(0);
    hasTrackedSession.current = false;
  };

  // Timer countdown effect
  useEffect(() => {
    if (timerState === 'running') {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - lastTickRef.current) / 1000);
        
        if (elapsed >= 1) {
          lastTickRef.current = now;
          
          setRemainingSeconds((prev) => {
            const newValue = prev - elapsed;
            
            // Track active focus time (only during focus phase)
            if (phase === 'focus') {
              setTotalActiveFocusSeconds((total) => total + elapsed);
            }
            
            if (newValue <= 0) {
              // Timer completed
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
              }
              
              if (phase === 'focus') {
                console.log('[WarMode] Focus phase completed');
                // Focus phase completed
                if (breaksEnabled && breakDuration) {
                  // Start break
                  setPhase('break');
                  setTimerState('idle');
                  setRemainingSeconds(breakDuration * 60);
                  toast.success('Focus session complete! Time for a break.');
                } else {
                  // No break, go to completion
                  setPhase('completed');
                  setTimerState('idle');
                  toast.success('Session complete! Great work!');
                }
              } else if (phase === 'break') {
                console.log('[WarMode] Break phase completed');
                // Break completed
                setPhase('completed');
                setTimerState('idle');
                toast.success('Break complete! Ready for the next session?');
              }
              
              return 0;
            }
            
            return newValue;
          });
        }
      }, 100); // Check every 100ms for smoother updates
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
  }, [timerState, phase, breaksEnabled, breakDuration]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('[WarMode] Component unmounting, cleaning up');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // Get motivational text based on phase
  const getMotivationalText = () => {
    if (phase === 'focus') {
      return 'Focus. Execute. Dominate.';
    } else if (phase === 'break') {
      return 'Recharge. Prepare. Return Stronger.';
    } else {
      return 'Session Complete. Victory Achieved.';
    }
  };

  // Get background color based on phase
  const getBackgroundClass = () => {
    if (phase === 'break') {
      return 'bg-gray-900';
    }
    return 'bg-[#0f0f0f]';
  };

  // Get phase indicator color
  const getPhaseColor = () => {
    if (phase === 'focus') {
      return 'text-primary';
    } else if (phase === 'break') {
      return 'text-chart-3';
    }
    return 'text-chart-4';
  };

  return (
    <div className={`fixed inset-0 z-50 ${getBackgroundClass()} transition-colors duration-500`}>
      {/* Exit button */}
      <Button
        onClick={handleExitClick}
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 min-h-[44px] min-w-[44px] text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Exit War Mode"
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Main content */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4 max-w-screen-sm mx-auto">
        {phase === 'completed' ? (
          // Completion screen
          <div className="text-center space-y-8 animate-in fade-in duration-500">
            <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold ${getPhaseColor()}`}>
              {getMotivationalText()}
            </h2>
            <div className="space-y-4">
              <Button
                onClick={handleStartNextSession}
                size="lg"
                className="min-h-[44px] min-w-[44px] px-6 py-3 text-lg font-semibold"
              >
                Start Next Session
              </Button>
              <Button
                onClick={handleExitClick}
                variant="outline"
                size="lg"
                className="min-h-[44px] min-w-[44px] px-6 py-3 text-lg font-semibold ml-4"
              >
                Exit War Mode
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              Total focus time: {Math.floor(totalActiveFocusSeconds / 60)} minutes
            </div>
          </div>
        ) : (
          // Timer screen
          <div className="text-center space-y-8 w-full">
            {/* Phase indicator */}
            <div className={`text-sm font-semibold uppercase tracking-wider ${getPhaseColor()} animate-in fade-in duration-200`}>
              {phase === 'focus' ? 'Focus Session' : 'Break Time'}
            </div>

            {/* Timer display */}
            <div className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold ${getPhaseColor()} tabular-nums animate-in fade-in duration-300`}>
              {formatTime(remainingSeconds)}
            </div>

            {/* Motivational text */}
            <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-full animate-in fade-in duration-200 delay-100">
              {getMotivationalText()}
            </p>

            {/* Control buttons */}
            <div className="flex items-center justify-center gap-4 pt-4">
              {timerState === 'idle' && (
                <Button
                  onClick={handleStart}
                  size="lg"
                  className="min-h-[44px] min-w-[44px] px-8 py-6 text-lg font-semibold"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start
                </Button>
              )}
              {timerState === 'running' && (
                <Button
                  onClick={handlePause}
                  size="lg"
                  variant="outline"
                  className="min-h-[44px] min-w-[44px] px-8 py-6 text-lg font-semibold"
                >
                  <Pause className="h-5 w-5 mr-2" />
                  Pause
                </Button>
              )}
              {timerState === 'paused' && (
                <Button
                  onClick={handleResume}
                  size="lg"
                  className="min-h-[44px] min-w-[44px] px-8 py-6 text-lg font-semibold"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Resume
                </Button>
              )}
            </div>

            {/* Progress indicator */}
            {phase === 'focus' && (
              <div className="text-xs text-muted-foreground animate-in fade-in duration-200 delay-200">
                Active focus time: {Math.floor(totalActiveFocusSeconds / 60)}m {totalActiveFocusSeconds % 60}s
              </div>
            )}
          </div>
        )}
      </div>

      {/* Exit confirmation dialog */}
      <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
        <AlertDialogContent className="max-w-sm bg-[#0f0f0f] border-primary/30">
          <AlertDialogHeader>
            <AlertDialogTitle>Exit War Mode?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to exit War Mode? Your progress will be saved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="min-h-[44px] min-w-[44px]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmExit}
              className="min-h-[44px] min-w-[44px]"
            >
              Confirm Exit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default WarModeScreen;
