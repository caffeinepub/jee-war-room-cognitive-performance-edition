import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock } from 'lucide-react';

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

function CountdownTimer() {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
  });

  useEffect(() => {
    const calculateTimeRemaining = () => {
      // JEE Advanced 2026: May 17, 2026, 9:00 AM IST
      const targetDate = new Date('2026-05-17T09:00:00+05:30');
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeRemaining({ days, hours, minutes, seconds, total: difference });
      } else {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, []);

  const isCritical = timeRemaining.days < 30 && timeRemaining.total > 0;

  return (
    <Card
      className={`border-2 transition-all duration-500 ${
        isCritical
          ? 'border-destructive bg-destructive/10 shadow-lg shadow-destructive/50'
          : 'border-primary/50 bg-card'
      }`}
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
          <Clock className={`h-5 w-5 sm:h-6 sm:w-6 ${isCritical ? 'text-destructive' : 'text-primary'}`} />
          <h3 className="text-sm sm:text-lg font-semibold text-center">Time Remaining to IIT Delhi</h3>
        </div>
        <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
          <div className="space-y-1">
            <div
              className={`text-3xl sm:text-4xl md:text-5xl font-bold tabular-nums ${
                isCritical ? 'text-destructive' : 'text-primary'
              }`}
            >
              {timeRemaining.days}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Days</div>
          </div>
          <div className="space-y-1">
            <div
              className={`text-3xl sm:text-4xl md:text-5xl font-bold tabular-nums ${
                isCritical ? 'text-destructive' : 'text-primary'
              }`}
            >
              {String(timeRemaining.hours).padStart(2, '0')}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Hours</div>
          </div>
          <div className="space-y-1">
            <div
              className={`text-3xl sm:text-4xl md:text-5xl font-bold tabular-nums ${
                isCritical ? 'text-destructive' : 'text-primary'
              }`}
            >
              {String(timeRemaining.minutes).padStart(2, '0')}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Mins</div>
          </div>
          <div className="space-y-1">
            <div
              className={`text-3xl sm:text-4xl md:text-5xl font-bold tabular-nums ${
                isCritical ? 'text-destructive' : 'text-primary'
              }`}
            >
              {String(timeRemaining.seconds).padStart(2, '0')}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Secs</div>
          </div>
        </div>
        {isCritical && (
          <div className="mt-4 text-center">
            <p className="text-xs sm:text-sm text-destructive font-semibold animate-pulse">
              ⚠️ CRITICAL: Less than 30 days remaining!
            </p>
          </div>
        )}
        <div className="mt-4 text-center text-xs text-muted-foreground">
          JEE Advanced 2026 • May 17, 2026 • 9:00 AM IST
        </div>
      </CardContent>
    </Card>
  );
}

export default CountdownTimer;
