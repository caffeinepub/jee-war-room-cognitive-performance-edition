import { useState } from 'react';
import { useGetTimeSlots, useAddTimeSlot, useUpdateTimeSlot, useToggleTimeSlotCompletion, useDeleteTimeSlot } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, Edit2, Trash2, CheckCircle2, Circle, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function FlexibleScheduleGrid() {
  const { data: timeSlots = [], isLoading } = useGetTimeSlots();
  const addTimeSlot = useAddTimeSlot();
  const updateTimeSlot = useUpdateTimeSlot();
  const toggleCompletion = useToggleTimeSlotCompletion();
  const deleteTimeSlot = useDeleteTimeSlot();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<typeof timeSlots[0] | null>(null);

  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    activityType: 'study',
    description: '',
    chapter: '',
  });

  const resetForm = () => {
    setFormData({
      startTime: '',
      endTime: '',
      activityType: 'study',
      description: '',
      chapter: '',
    });
  };

  const handleAdd = async () => {
    if (!formData.startTime || !formData.endTime || !formData.description || !formData.chapter) {
      toast.error('Please fill in all required fields');
      return;
    }

    const startTime = BigInt(new Date(`1970-01-01T${formData.startTime}`).getTime() * 1_000_000);
    const endTime = BigInt(new Date(`1970-01-01T${formData.endTime}`).getTime() * 1_000_000);

    try {
      await addTimeSlot.mutateAsync({
        startTime,
        endTime,
        activityType: formData.activityType,
        description: formData.description,
        chapter: formData.chapter,
      });
      toast.success('Time block added successfully');
      setIsAddModalOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to add time block');
      console.error(error);
    }
  };

  const handleEdit = async () => {
    if (!editingSlot || !formData.startTime || !formData.endTime || !formData.description || !formData.chapter) {
      toast.error('Please fill in all required fields');
      return;
    }

    const startTime = BigInt(new Date(`1970-01-01T${formData.startTime}`).getTime() * 1_000_000);
    const endTime = BigInt(new Date(`1970-01-01T${formData.endTime}`).getTime() * 1_000_000);

    try {
      await updateTimeSlot.mutateAsync({
        id: editingSlot.id,
        startTime,
        endTime,
        activityType: formData.activityType,
        description: formData.description,
        chapter: formData.chapter,
      });
      toast.success('Time block updated successfully');
      setIsEditModalOpen(false);
      setEditingSlot(null);
      resetForm();
    } catch (error) {
      toast.error('Failed to update time block');
      console.error(error);
    }
  };

  const handleToggleCompletion = async (id: bigint) => {
    try {
      await toggleCompletion.mutateAsync(id);
      toast.success('Status updated');
    } catch (error) {
      toast.error('Failed to update status');
      console.error(error);
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteTimeSlot.mutateAsync(id);
      toast.success('Time block deleted');
    } catch (error) {
      toast.error('Failed to delete time block');
      console.error(error);
    }
  };

  const openEditModal = (slot: typeof timeSlots[0]) => {
    setEditingSlot(slot);
    const startDate = new Date(Number(slot.startTime) / 1_000_000);
    const endDate = new Date(Number(slot.endTime) / 1_000_000);
    setFormData({
      startTime: startDate.toTimeString().slice(0, 5),
      endTime: endDate.toTimeString().slice(0, 5),
      activityType: slot.activityType,
      description: slot.description,
      chapter: slot.chapter,
    });
    setIsEditModalOpen(true);
  };

  const formatTime = (time: bigint) => {
    const date = new Date(Number(time) / 1_000_000);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const calculateDuration = (start: bigint, end: bigint) => {
    const durationMs = Number(end - start) / 1_000_000;
    const minutes = Math.floor(durationMs / 60000);
    return `${minutes}m`;
  };

  const completedSlots = timeSlots.filter((slot) => slot.isComplete).length;
  const completionPercentage = timeSlots.length > 0 ? Math.round((completedSlots / timeSlots.length) * 100) : 0;

  const studySlots = timeSlots.filter((slot) => slot.activityType === 'study');
  const deepWorkCount = studySlots.length;

  const physicsSlots = studySlots.filter((slot) => slot.description.toLowerCase().includes('physics')).length;
  const chemistrySlots = studySlots.filter((slot) => slot.description.toLowerCase().includes('chemistry')).length;
  const mathsSlots = studySlots.filter((slot) => slot.description.toLowerCase().includes('maths')).length;

  if (isLoading) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Daily Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-24 animate-pulse rounded-lg bg-muted" />
            <div className="h-24 animate-pulse rounded-lg bg-muted" />
            <div className="h-24 animate-pulse rounded-lg bg-muted" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-foreground">Daily Schedule</CardTitle>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-9 gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              Add Block
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card">
            <DialogHeader>
              <DialogTitle className="text-foreground">Add Time Block</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime" className="text-foreground">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="bg-background text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime" className="text-foreground">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="bg-background text-foreground"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="activityType" className="text-foreground">Activity Type</Label>
                <Select value={formData.activityType} onValueChange={(value) => setFormData({ ...formData, activityType: value })}>
                  <SelectTrigger className="bg-background text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="study">Study</SelectItem>
                    <SelectItem value="other">Other Work</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., Physics - Mechanics"
                  className="bg-background text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="chapter" className="text-foreground">Chapter Name *</Label>
                <Input
                  id="chapter"
                  value={formData.chapter}
                  onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                  placeholder="e.g., Newton's Laws of Motion"
                  className="bg-background text-foreground"
                  required
                />
              </div>
              <Button onClick={handleAdd} disabled={addTimeSlot.isPending} className="w-full bg-blue-600 hover:bg-blue-700">
                {addTimeSlot.isPending ? 'Adding...' : 'Add Time Block'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Daily Metrics */}
        <div className="grid grid-cols-2 gap-4 rounded-lg border border-border bg-muted/50 p-4 md:grid-cols-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{completionPercentage}%</div>
            <p className="text-xs text-muted-foreground">Completion</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{deepWorkCount}</div>
            <p className="text-xs text-muted-foreground">Deep Work</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">{physicsSlots + chemistrySlots + mathsSlots}</div>
            <p className="text-xs text-muted-foreground">PCM Blocks</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{timeSlots.length}</div>
            <p className="text-xs text-muted-foreground">Total Blocks</p>
          </div>
        </div>

        {/* Time Blocks */}
        {timeSlots.length === 0 ? (
          <div className="py-12 text-center">
            <Clock className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-sm text-muted-foreground">No time blocks scheduled yet</p>
            <p className="text-xs text-muted-foreground">Click "Add Block" to create your first time block</p>
          </div>
        ) : (
          <div className="space-y-3">
            {timeSlots
              .sort((a, b) => Number(a.startTime - b.startTime))
              .map((slot) => (
                <div
                  key={Number(slot.id)}
                  className={`group relative rounded-lg border p-4 transition-all ${
                    slot.isComplete
                      ? 'border-green-500/30 bg-green-500/5'
                      : 'border-border bg-muted/30 hover:border-blue-500/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-foreground">
                          {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                        </span>
                        <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs text-blue-400">
                          {calculateDuration(slot.startTime, slot.endTime)}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-blue-400">{slot.chapter}</p>
                        <p className="text-sm text-muted-foreground">{slot.description}</p>
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs ${
                            slot.activityType === 'study'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-orange-500/20 text-orange-400'
                          }`}
                        >
                          {slot.activityType === 'study' ? 'Study' : 'Other Work'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleToggleCompletion(slot.id)}
                        disabled={toggleCompletion.isPending}
                        className="h-11 w-11 min-w-[44px]"
                      >
                        {slot.isComplete ? (
                          <CheckCircle2 className="h-5 w-5 text-green-400" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEditModal(slot)}
                        className="h-11 w-11 min-w-[44px]"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(slot.id)}
                        disabled={deleteTimeSlot.isPending}
                        className="h-11 w-11 min-w-[44px] text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Time Block</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-startTime" className="text-foreground">Start Time</Label>
                <Input
                  id="edit-startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="bg-background text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-endTime" className="text-foreground">End Time</Label>
                <Input
                  id="edit-endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="bg-background text-foreground"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-activityType" className="text-foreground">Activity Type</Label>
              <Select value={formData.activityType} onValueChange={(value) => setFormData({ ...formData, activityType: value })}>
                <SelectTrigger className="bg-background text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="study">Study</SelectItem>
                  <SelectItem value="other">Other Work</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description" className="text-foreground">Description</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., Physics - Mechanics"
                className="bg-background text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-chapter" className="text-foreground">Chapter Name *</Label>
              <Input
                id="edit-chapter"
                value={formData.chapter}
                onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                placeholder="e.g., Newton's Laws of Motion"
                className="bg-background text-foreground"
                required
              />
            </div>
            <Button onClick={handleEdit} disabled={updateTimeSlot.isPending} className="w-full bg-blue-600 hover:bg-blue-700">
              {updateTimeSlot.isPending ? 'Updating...' : 'Update Time Block'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
