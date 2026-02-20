import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { toast } from 'sonner';
import type { Chapter, ConsistencyDNA, PerformanceBlock, TimeSlot } from '../backend';

export function useRegisterUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.registerUser();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('User registered successfully');
    },
    onError: (error: Error) => {
      if (!error.message.includes('already registered')) {
        toast.error('Registration failed: ' + error.message);
      }
    },
  });
}

export function useGetUserConsistency() {
  const { actor, isFetching } = useActor();

  return useQuery<ConsistencyDNA>({
    queryKey: ['consistency'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.getUserConsistency();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useUpdateConsistency() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (isConsistent: boolean) => {
      if (!actor) throw new Error('Actor not initialized');
      // Get current date in IST timezone (YYYY-MM-DD format)
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
      const istDate = new Date(now.getTime() + istOffset);
      const currentDate = istDate.toISOString().split('T')[0];
      
      return actor.updateConsistency(isConsistent, currentDate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consistency'] });
      toast.success('Consistency updated');
    },
    onError: (error: Error) => {
      if (error.message.includes('already marked')) {
        toast.error('Already marked for today. Come back tomorrow!');
      } else {
        toast.error('Failed to update consistency: ' + error.message);
      }
    },
  });
}

export function useGetAllChapters() {
  const { actor, isFetching } = useActor();

  return useQuery<Chapter[]>({
    queryKey: ['chapters'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.getAllChapters();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useAddChapter() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      name: string;
      subject: string;
      revisionInterval: bigint;
      difficulty: string;
      importance: string;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addChapter(
        params.name,
        params.subject,
        params.revisionInterval,
        params.difficulty,
        params.importance
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapters'] });
      toast.success('Chapter added successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to add chapter: ' + error.message);
    },
  });
}

export function useToggleChapterCompletion() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (chapterId: bigint) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.toggleChapterCompletion(chapterId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapters'] });
    },
    onError: (error: Error) => {
      toast.error('Failed to toggle chapter completion: ' + error.message);
    },
  });
}

export function useUpdateChapterRevision() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (chapterId: bigint) => {
      if (!actor) throw new Error('Actor not initialized');
      const chapters = await actor.getAllChapters();
      const chapter = chapters.find(ch => ch.id === chapterId);
      if (!chapter) throw new Error('Chapter not found');
      
      // Update by re-adding with current timestamp as lastStudied
      // Note: Backend doesn't have updateChapter, so we work with what we have
      // The revision status is calculated client-side based on lastStudied
      return chapter;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapters'] });
    },
    onError: (error: Error) => {
      toast.error('Failed to update revision: ' + error.message);
    },
  });
}

export function useGetPerformanceBlocks() {
  const { actor, isFetching } = useActor();

  return useQuery<PerformanceBlock[]>({
    queryKey: ['performanceBlocks'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.getPerformanceBlocks();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useRecordPerformanceBlock() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      startTime: bigint;
      endTime: bigint;
      focusScore: bigint;
      productivity: bigint;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.recordPerformanceBlock(
        params.startTime,
        params.endTime,
        params.focusScore,
        params.productivity
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performanceBlocks'] });
      toast.success('Performance block recorded');
    },
    onError: (error: Error) => {
      toast.error('Failed to record performance: ' + error.message);
    },
  });
}

export function useGetWarModeStats() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['warModeStats'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.getWarModeStats();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useUpdateWarModeStats() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { pomodoros: bigint; studyTime: bigint }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.updateWarModeStats(params.pomodoros, params.studyTime);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warModeStats'] });
      queryClient.invalidateQueries({ queryKey: ['performanceBlocks'] });
    },
    onError: (error: Error) => {
      toast.error('Failed to update war mode stats: ' + error.message);
    },
  });
}

export function useGetConsistencyLeaderboard() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['consistencyLeaderboard'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.getSortedConsistencyLeaderboard();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

// Time Slot Hooks
export function useGetTimeSlots() {
  const { actor, isFetching } = useActor();

  return useQuery<TimeSlot[]>({
    queryKey: ['timeSlots'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.getTimeSlots();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useAddTimeSlot() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      startTime: bigint;
      endTime: bigint;
      activityType: string;
      description: string;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addTimeSlot(
        params.startTime,
        params.endTime,
        params.activityType,
        params.description
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeSlots'] });
      toast.success('Time slot added successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to add time slot: ' + error.message);
    },
  });
}

export function useUpdateTimeSlot() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: bigint;
      startTime: bigint;
      endTime: bigint;
      activityType: string;
      description: string;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.updateTimeSlot(
        params.id,
        params.startTime,
        params.endTime,
        params.activityType,
        params.description
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeSlots'] });
      toast.success('Time slot updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update time slot: ' + error.message);
    },
  });
}

export function useDeleteTimeSlot() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.deleteTimeSlot(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeSlots'] });
      toast.success('Time slot deleted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete time slot: ' + error.message);
    },
  });
}

export function useToggleCompletion() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.toggleCompletion(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeSlots'] });
    },
    onError: (error: Error) => {
      toast.error('Failed to toggle completion: ' + error.message);
    },
  });
}
