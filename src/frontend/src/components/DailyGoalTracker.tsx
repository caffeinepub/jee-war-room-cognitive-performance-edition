import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useGetTimeSlots, useAddTimeSlot, useUpdateTimeSlot, useDeleteTimeSlot, useToggleTimeSlotCompletion, useRegisterUser } from '../hooks/useQueries';
import { Calendar, Plus, Trash2, Edit2, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

function DailyGoalTracker() {
  const { data: slots, isLoading, error } = useGetTimeSlots();
  const addSlot = useAddTimeSlot();
  const updateSlot = useUpdateTimeSlot();
  const deleteSlot = useDeleteTimeSlot();
  const toggleCompletion = useToggleTimeSlotCompletion();
  const registerUser = useRegisterUser();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    activityType: 'study',
    description: '',
  });

  useEffect(() => {
    if (error && error.message.includes('User not found')) {
      registerUser.mutate();
    }
  }, [error]);

  const handleSubmit = async () => {
    if (!formData.startTime || !formData.endTime || !formData.description.trim()) {
      toast.error('Please fill all fields');
      return;
    }

    const startDate = new Date();
    const [startHour, startMinute] = formData.startTime.split(':');
    startDate.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);

    const endDate = new Date();
    const [endHour, endMinute] = formData.endTime.split(':');
    endDate.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);

    const startTimeNano = BigInt(startDate.getTime()) * BigInt(1_000_000);
    const endTimeNano = BigInt(endDate.getTime()) * BigInt(1_000_000);

    try {
      if (editingSlot !== null) {
        await updateSlot.mutateAsync({
          id: BigInt(editingSlot),
          startTime: startTimeNano,
          endTime: endTimeNano,
          activityType: formData.activityType,
          description: formData.description,
        });
      } else {
        await addSlot.mutateAsync({
          startTime: startTimeNano,
          endTime: endTimeNano,
          activityType: formData.activityType,
          description: formData.description,
        });
      }
      setIsDialogOpen(false);
      setEditingSlot(null);
      setFormData({ startTime: '', endTime: '', activityType: 'study', description: '' });
    } catch (err) {
      console.error('Failed to save slot:', err);
    }
  };

  const handleEdit = (slot: any) => {
    const startDate = new Date(Number(slot.startTime) / 1_000_000);
    const endDate = new Date(Number(slot.endTime) / 1_000_000);
    
    setFormData({
      startTime: `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`,
      endTime: `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`,
      activityType: slot.activityType,
      description: slot.description,
    });
    setEditingSlot(Number(slot.id));
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: bigint) => {
    if (confirm('Are you sure you want to delete this slot?')) {
      try {
        await deleteSlot.mutateAsync(id);
      } catch (err) {
        console.error('Failed to delete slot:', err);
      }
    }
  };

  const handleToggle = async (id: bigint) => {
    try {
      await toggleCompletion.mutateAsync(id);
    } catch (err) {
      console.error('Failed to toggle completion:', err);
    }
  };

  const formatTime = (timeNano: bigint) => {
    const date = new Date(Number(timeNano) / 1_000_000);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const sortedSlots = slots?.slice().sort((a, b) => Number(a.startTime - b.startTime));

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Daily Goal Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground">Loading time slots...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between flex-wrap gap-4">
          <span className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Daily Goal Tracker
          </span>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingSlot(null);
              setFormData({ startTime: '', endTime: '', activityType: 'study', description: '' });
            }
          }}>
            <DialogTrigger asChild>
              <Button size="sm" className="min-h-[44px] min-w-[44px]">
                <Plus className="h-4 w-4 mr-0 sm:mr-2" />
                <span className="hidden sm:inline">Add Slot</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingSlot ? 'Edit Time Slot' : 'Add New Time Slot'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="min-h-[44px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="min-h-[44px]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Activity Type</Label>
                  <Select value={formData.activityType} onValueChange={(v) => setFormData({ ...formData, activityType: v })}>
                    <SelectTrigger className="min-h-[44px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="study">Study</SelectItem>
                      <SelectItem value="other">Other Work</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="What will you work on?"
                    className="min-h-[44px]"
                  />
                </div>
                <Button onClick={handleSubmit} className="w-full min-h-[44px]" disabled={addSlot.isPending || updateSlot.isPending}>
                  {addSlot.isPending || updateSlot.isPending ? 'Saving...' : editingSlot ? 'Update Slot' : 'Add Slot'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!sortedSlots || sortedSlots.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No time slots scheduled yet. Add your first slot!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedSlots.map((slot) => (
              <Card key={Number(slot.id)} className={`border-l-4 ${slot.isComplete ? 'border-l-chart-2 bg-chart-2/5' : 'border-l-primary'}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="pt-1">
                      <Checkbox
                        checked={slot.isComplete}
                        onCheckedChange={() => handleToggle(slot.id)}
                        className="h-6 w-6"
                      />
                    </div>
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={slot.activityType === 'study' ? 'default' : 'secondary'} className="text-xs">
                          {slot.activityType === 'study' ? '📚 Study' : '📋 Other Work'}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</span>
                        </div>
                      </div>
                      <p className={`text-sm sm:text-base ${slot.isComplete ? 'line-through text-muted-foreground' : ''}`}>
                        {slot.description}
                      </p>
                    </div>
                    <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(slot)}
                        className="min-h-[44px] min-w-[44px] p-2"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(slot.id)}
                        className="min-h-[44px] min-w-[44px] p-2 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default DailyGoalTracker;
