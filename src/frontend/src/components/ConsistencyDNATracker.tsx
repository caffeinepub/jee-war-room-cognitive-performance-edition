import { useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGetUserConsistency, useUpdateConsistency, useRegisterUser } from '../hooks/useQueries';
import { Dna, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

function ConsistencyDNATracker() {
  const { data: consistency, isLoading, error } = useGetUserConsistency();
  const updateConsistency = useUpdateConsistency();
  const registerUser = useRegisterUser();

  useEffect(() => {
    if (error && error.message.includes('User not found')) {
      registerUser.mutate();
    }
  }, [error]);

  const consistencyScore = consistency
    ? Math.round((Number(consistency.daysConsistent) / Math.max(Number(consistency.daysTracked), 1)) * 100)
    : 0;

  // Check if already marked today
  const isMarkedToday = useMemo(() => {
    if (!consistency?.lastEntryDate) return false;
    
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
    const istDate = new Date(now.getTime() + istOffset);
    const today = istDate.toISOString().split('T')[0];
    
    return consistency.lastEntryDate === today;
  }, [consistency]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-chart-2';
    if (score >= 60) return 'text-chart-1';
    if (score >= 40) return 'text-chart-4';
    return 'text-destructive';
  };

  const handleMarkDay = async (isConsistent: boolean) => {
    try {
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000;
      const istDate = new Date(now.getTime() + istOffset);
      const currentDate = istDate.toISOString().split('T')[0];
      
      await updateConsistency.mutateAsync({ isConsistent, currentDate });
    } catch (err) {
      console.error('Failed to update consistency:', err);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Consistency DNA Tracker</CardTitle>
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
        <CardTitle className="flex items-center gap-2">
          <Dna className="h-5 w-5" />
          Consistency DNA Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="10"
                fill="none"
                className="text-muted/20"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="10"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - consistencyScore / 100)}`}
                className={`transition-all duration-300 ${
                  consistencyScore >= 80
                    ? 'text-chart-2'
                    : consistencyScore >= 60
                    ? 'text-chart-1'
                    : consistencyScore >= 40
                    ? 'text-chart-4'
                    : 'text-destructive'
                }`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold transition-colors duration-300 ${getScoreColor(consistencyScore)}`}>
                {consistencyScore}%
              </span>
            </div>
          </div>

          <div className="w-full space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Consistency Score</span>
              <span className="font-medium">{consistencyScore}%</span>
            </div>
            <Progress value={consistencyScore} className="h-2" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="space-y-1">
            <p className="text-2xl font-bold">{consistency ? Number(consistency.daysConsistent) : 0}</p>
            <p className="text-xs text-muted-foreground">Consistent Days</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold">{consistency ? Number(consistency.daysTracked) : 0}</p>
            <p className="text-xs text-muted-foreground">Total Days</p>
          </div>
        </div>

        {isMarkedToday ? (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Already marked for today. Come back tomorrow at midnight IST!
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-center text-muted-foreground">How was your day?</p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => handleMarkDay(true)}
                disabled={updateConsistency.isPending}
                className="min-h-[44px] bg-chart-2 hover:bg-chart-2/90 transition-all duration-200"
              >
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Consistent
              </Button>
              <Button
                onClick={() => handleMarkDay(false)}
                disabled={updateConsistency.isPending}
                variant="destructive"
                className="min-h-[44px] transition-all duration-200"
              >
                <XCircle className="mr-2 h-5 w-5" />
                Inconsistent
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ConsistencyDNATracker;
