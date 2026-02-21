import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, Coffee } from 'lucide-react';

interface WarModeConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEnterWarMode: (config: {
    focusDuration: number;
    breakDuration: number | null;
    breaksEnabled: boolean;
  }) => void;
}

type DurationOption = 'preset-60' | 'preset-90' | 'preset-120' | 'custom';
type BreakDurationOption = 'preset-5' | 'preset-10' | 'preset-15' | 'custom';

function WarModeConfigModal({ open, onOpenChange, onEnterWarMode }: WarModeConfigModalProps) {
  const [view, setView] = useState<'config' | 'confirm'>('config');
  const [selectedDuration, setSelectedDuration] = useState<DurationOption | null>(null);
  const [customDuration, setCustomDuration] = useState('');
  const [breakNeeded, setBreakNeeded] = useState<boolean>(false);
  const [selectedBreakDuration, setSelectedBreakDuration] = useState<BreakDurationOption | null>(null);
  const [customBreakDuration, setCustomBreakDuration] = useState('');
  const [errors, setErrors] = useState<{ duration?: string; breakDuration?: string }>({});

  const handleDurationSelect = (option: DurationOption) => {
    setSelectedDuration(option);
    if (option !== 'custom') {
      setCustomDuration('');
    }
    setErrors((prev) => ({ ...prev, duration: undefined }));
  };

  const handleBreakDurationSelect = (option: BreakDurationOption) => {
    setSelectedBreakDuration(option);
    if (option !== 'custom') {
      setCustomBreakDuration('');
    }
    setErrors((prev) => ({ ...prev, breakDuration: undefined }));
  };

  const getFocusDuration = (): number | null => {
    if (!selectedDuration) return null;
    if (selectedDuration === 'preset-60') return 60;
    if (selectedDuration === 'preset-90') return 90;
    if (selectedDuration === 'preset-120') return 120;
    if (selectedDuration === 'custom') {
      const value = parseInt(customDuration);
      return isNaN(value) ? null : value;
    }
    return null;
  };

  const getBreakDuration = (): number | null => {
    if (!breakNeeded) return null;
    if (!selectedBreakDuration) return null;
    if (selectedBreakDuration === 'preset-5') return 5;
    if (selectedBreakDuration === 'preset-10') return 10;
    if (selectedBreakDuration === 'preset-15') return 15;
    if (selectedBreakDuration === 'custom') {
      const value = parseInt(customBreakDuration);
      return isNaN(value) ? null : value;
    }
    return null;
  };

  const validateConfig = (): boolean => {
    const newErrors: { duration?: string; breakDuration?: string } = {};

    const focusDuration = getFocusDuration();
    if (!focusDuration) {
      newErrors.duration = 'Please select a focus duration';
    } else if (focusDuration < 1) {
      newErrors.duration = 'Focus duration must be at least 1 minute';
    }

    if (breakNeeded) {
      const breakDuration = getBreakDuration();
      if (!breakDuration) {
        newErrors.breakDuration = 'Please select a break duration';
      } else if (breakDuration < 1) {
        newErrors.breakDuration = 'Break duration must be at least 1 minute';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateConfig()) {
      setView('confirm');
    }
  };

  const handleConfirm = () => {
    const focusDuration = getFocusDuration();
    const breakDuration = getBreakDuration();
    
    if (focusDuration) {
      onEnterWarMode({
        focusDuration,
        breakDuration,
        breaksEnabled: breakNeeded,
      });
      handleClose();
    }
  };

  const handleClose = () => {
    // Reset state
    setView('config');
    setSelectedDuration(null);
    setCustomDuration('');
    setBreakNeeded(false);
    setSelectedBreakDuration(null);
    setCustomBreakDuration('');
    setErrors({});
    onOpenChange(false);
  };

  const handleCancel = () => {
    if (view === 'confirm') {
      setView('config');
    } else {
      handleClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-[#0f0f0f] border-primary/30">
        {view === 'config' ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-primary flex items-center gap-2">
                <Clock className="h-6 w-6" />
                Configure War Mode
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Set your focus duration and break preferences
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Focus Duration Selector */}
              <div className="space-y-3">
                <Label className="text-base font-semibold text-foreground">Focus Duration</Label>
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    type="button"
                    variant={selectedDuration === 'preset-60' ? 'default' : 'outline'}
                    className="h-14 text-base font-semibold touch-target"
                    onClick={() => handleDurationSelect('preset-60')}
                  >
                    60m
                  </Button>
                  <Button
                    type="button"
                    variant={selectedDuration === 'preset-90' ? 'default' : 'outline'}
                    className="h-14 text-base font-semibold touch-target"
                    onClick={() => handleDurationSelect('preset-90')}
                  >
                    90m
                  </Button>
                  <Button
                    type="button"
                    variant={selectedDuration === 'preset-120' ? 'default' : 'outline'}
                    className="h-14 text-base font-semibold touch-target"
                    onClick={() => handleDurationSelect('preset-120')}
                  >
                    120m
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="custom-duration" className="text-sm text-muted-foreground">
                    Or enter custom duration (minutes)
                  </Label>
                  <Input
                    id="custom-duration"
                    type="number"
                    min="1"
                    placeholder="e.g., 45"
                    value={customDuration}
                    onChange={(e) => {
                      setCustomDuration(e.target.value);
                      if (e.target.value) {
                        handleDurationSelect('custom');
                      }
                    }}
                    className="h-12 text-base touch-target"
                  />
                </div>
                {errors.duration && (
                  <p className="text-sm text-destructive">{errors.duration}</p>
                )}
              </div>

              {/* Break Toggle */}
              <div className="space-y-3">
                <Label className="text-base font-semibold text-foreground">Break needed?</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={breakNeeded === true ? 'default' : 'outline'}
                    className="h-14 text-base font-semibold touch-target"
                    onClick={() => {
                      setBreakNeeded(true);
                      setErrors((prev) => ({ ...prev, breakDuration: undefined }));
                    }}
                  >
                    Yes
                  </Button>
                  <Button
                    type="button"
                    variant={breakNeeded === false ? 'default' : 'outline'}
                    className="h-14 text-base font-semibold touch-target"
                    onClick={() => {
                      setBreakNeeded(false);
                      setSelectedBreakDuration(null);
                      setCustomBreakDuration('');
                      setErrors((prev) => ({ ...prev, breakDuration: undefined }));
                    }}
                  >
                    No
                  </Button>
                </div>
              </div>

              {/* Break Duration Selector (conditional) */}
              {breakNeeded && (
                <div className="space-y-3 animate-in fade-in duration-300">
                  <Label className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Coffee className="h-4 w-4" />
                    Break Duration
                  </Label>
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      type="button"
                      variant={selectedBreakDuration === 'preset-5' ? 'default' : 'outline'}
                      className="h-14 text-base font-semibold touch-target"
                      onClick={() => handleBreakDurationSelect('preset-5')}
                    >
                      5m
                    </Button>
                    <Button
                      type="button"
                      variant={selectedBreakDuration === 'preset-10' ? 'default' : 'outline'}
                      className="h-14 text-base font-semibold touch-target"
                      onClick={() => handleBreakDurationSelect('preset-10')}
                    >
                      10m
                    </Button>
                    <Button
                      type="button"
                      variant={selectedBreakDuration === 'preset-15' ? 'default' : 'outline'}
                      className="h-14 text-base font-semibold touch-target"
                      onClick={() => handleBreakDurationSelect('preset-15')}
                    >
                      15m
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="custom-break-duration" className="text-sm text-muted-foreground">
                      Or enter custom break duration (minutes)
                    </Label>
                    <Input
                      id="custom-break-duration"
                      type="number"
                      min="1"
                      placeholder="e.g., 7"
                      value={customBreakDuration}
                      onChange={(e) => {
                        setCustomBreakDuration(e.target.value);
                        if (e.target.value) {
                          handleBreakDurationSelect('custom');
                        }
                      }}
                      className="h-12 text-base touch-target"
                    />
                  </div>
                  {errors.breakDuration && (
                    <p className="text-sm text-destructive">{errors.breakDuration}</p>
                  )}
                </div>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="min-h-[44px] min-w-[44px]"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleContinue}
                className="min-h-[44px] min-w-[44px]"
              >
                Continue
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-primary">
                Confirm War Mode Settings
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Review your configuration before entering War Mode
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-6">
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Focus Duration:</span>
                  <span className="text-lg font-bold text-primary">{getFocusDuration()} minutes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Break:</span>
                  <span className="text-lg font-bold text-foreground">
                    {breakNeeded ? `${getBreakDuration()} minutes` : 'No break'}
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                War Mode will hide all navigation and distractions. You can exit anytime.
              </p>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="min-h-[44px] min-w-[44px]"
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={handleConfirm}
                className="min-h-[44px] min-w-[44px] bg-primary hover:bg-primary/90"
              >
                Confirm & Enter War Mode
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default WarModeConfigModal;
