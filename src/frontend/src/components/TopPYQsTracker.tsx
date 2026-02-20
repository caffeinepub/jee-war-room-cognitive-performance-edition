import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePYQYears, useTogglePYQYear, useAddCustomPYQYear } from '../hooks/useQueries';
import { CheckCircle2, XCircle, Plus, Calendar } from 'lucide-react';
import { toast } from 'sonner';

function TopPYQsTracker() {
  const { data: pyqYears, isLoading } = usePYQYears();
  const toggleYear = useTogglePYQYear();
  const addCustomYear = useAddCustomPYQYear();
  const [isAddYearDialogOpen, setIsAddYearDialogOpen] = useState(false);
  const [customYear, setCustomYear] = useState('');

  const handleToggleYear = async (year: number) => {
    try {
      await toggleYear.mutateAsync(year);
    } catch (err) {
      // Error already handled in hook
      console.error('Failed to toggle PYQ year:', err);
    }
  };

  const handleAddCustomYear = async () => {
    const yearNum = parseInt(customYear);
    
    if (isNaN(yearNum)) {
      toast.error('Please enter a valid year');
      return;
    }

    if (yearNum < 2000 || yearNum > 2026) {
      toast.error('Year must be between 2000 and 2026');
      return;
    }

    // Check if year already exists
    if (pyqYears?.some(y => y.year === yearNum)) {
      toast.error('This year already exists');
      return;
    }

    try {
      await addCustomYear.mutateAsync(yearNum);
      setIsAddYearDialogOpen(false);
      setCustomYear('');
    } catch (err) {
      // Error already handled in hook
      console.error('Failed to add custom year:', err);
    }
  };

  // Calculate year-wise progress
  const completedYears = pyqYears?.filter(y => y.completed).length || 0;
  const totalYears = pyqYears?.length || 0;
  const progressPercentage = totalYears > 0 ? Math.round((completedYears / totalYears) * 100) : 0;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/30 transition-all duration-200 hover:border-primary/50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between flex-wrap gap-4">
          <span className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Top PYQs Tracker
          </span>
          <div className="flex items-center gap-3">
            <div className="text-sm">
              <span className="text-muted-foreground">Progress: </span>
              <span className="font-bold text-primary">{progressPercentage}%</span>
              <span className="text-muted-foreground ml-1">({completedYears}/{totalYears})</span>
            </div>
            <Dialog open={isAddYearDialogOpen} onOpenChange={setIsAddYearDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="min-h-[44px] min-w-[44px] transition-all duration-200">
                  <Plus className="h-4 w-4 mr-0 sm:mr-2" />
                  <span className="hidden sm:inline">Add Year</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Custom PYQ Year</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Year (2000-2026)</Label>
                    <Input
                      type="number"
                      min="2000"
                      max="2026"
                      value={customYear}
                      onChange={(e) => setCustomYear(e.target.value)}
                      placeholder="e.g., 2021"
                      className="min-h-[44px]"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    onClick={handleAddCustomYear} 
                    disabled={addCustomYear.isPending}
                    className="min-h-[44px]"
                  >
                    {addCustomYear.isPending ? 'Adding...' : 'Add Year'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Years Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {pyqYears?.sort((a, b) => b.year - a.year).map((yearData) => (
              <Button
                key={yearData.year}
                size="lg"
                variant={yearData.completed ? 'default' : 'outline'}
                onClick={() => handleToggleYear(yearData.year)}
                className="min-h-[80px] flex flex-col items-center justify-center gap-2 transition-all duration-200"
              >
                {yearData.completed ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : (
                  <XCircle className="h-6 w-6" />
                )}
                <span className="text-lg font-bold">{yearData.year}</span>
                <span className="text-xs opacity-80">
                  {yearData.completed ? 'Completed' : 'Pending'}
                </span>
              </Button>
            ))}
          </div>

          {/* Backend Gap Notice */}
          <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-muted">
            <p className="text-xs text-muted-foreground text-center">
              ⚠️ Backend support needed: PYQ year tracking requires backend implementation
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default TopPYQsTracker;
