import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingDown, Clock, Zap, X } from 'lucide-react';
import { useState } from 'react';

export default function IntelligentAlerts() {
  // Mock alerts for demonstration - in production, these would come from backend
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  const alerts = [
    {
      id: 'fsi-drop',
      type: 'FSI Drop',
      icon: TrendingDown,
      message: 'Your Focus Stability Index has declined for 3 consecutive days',
      recommendations: [
        'Increase deep work hours by 30 minutes',
        'Reduce task switching between subjects',
        'Improve sleep quality (aim for 7-8 hours)',
      ],
      severity: 'high',
    },
  ];

  const activeAlerts = alerts.filter((alert) => !dismissedAlerts.includes(alert.id));

  const handleDismiss = (alertId: string) => {
    setDismissedAlerts([...dismissedAlerts, alertId]);
  };

  if (activeAlerts.length === 0) {
    return (
      <Card className="bg-green-500/10 border-green-500/30">
        <CardContent className="py-6 text-center">
          <Zap className="h-12 w-12 text-green-500 mx-auto mb-3" />
          <div className="text-lg font-semibold text-green-500">All Systems Optimal</div>
          <div className="text-sm text-muted-foreground mt-1">
            No critical alerts. Keep up the great work!
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {activeAlerts.map((alert) => {
        const Icon = alert.icon;
        return (
          <Card
            key={alert.id}
            className="bg-red-500/10 border-red-500/50 shadow-lg shadow-red-500/20"
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-red-500" />
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      <span className="font-bold text-red-500">{alert.type}</span>
                    </div>
                    <p className="text-sm text-foreground">{alert.message}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Recommended Actions:</div>
                    <ul className="space-y-1">
                      {alert.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDismiss(alert.id)}
                  className="min-h-[44px] min-w-[44px] flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
