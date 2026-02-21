import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Chapter, ConsistencyDNA, TimeSlot } from '../backend';
import { toast } from 'sonner';

export function useRegisterUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.registerUser();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consistency'] });
      queryClient.invalidateQueries({ queryKey: ['chapters'] });
      queryClient.invalidateQueries({ queryKey: ['timeSlots'] });
      queryClient.invalidateQueries({ queryKey: ['warModeStats'] });
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
  });
}

export function useUpdateConsistency() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ isConsistent, currentDate }: { isConsistent: boolean; currentDate: string }) => {
      if (!actor) throw new Error('Actor not initialized');
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
      if (!actor) return [];
      return actor.getAllChapters();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddChapter() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      subject,
      revisionInterval,
      difficulty,
      importance,
    }: {
      name: string;
      subject: string;
      revisionInterval: bigint;
      difficulty: string;
      importance: string;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addChapter(name, subject, revisionInterval, difficulty, importance);
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
      toast.error('Failed to toggle chapter: ' + error.message);
    },
  });
}

export function useUpdateChapterRevision() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      chapterId,
      theoryCompleted,
      pyqsCompleted,
      advancedPracticeCompleted,
    }: {
      chapterId: bigint;
      theoryCompleted: boolean;
      pyqsCompleted: boolean;
      advancedPracticeCompleted: boolean;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.updateChapterRevision(chapterId, theoryCompleted, pyqsCompleted, advancedPracticeCompleted);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapters'] });
    },
    onError: (error: Error) => {
      toast.error('Failed to update revision: ' + error.message);
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
  });
}

export function useUpdateWarModeStats() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ pomodoros, studyTime }: { pomodoros: bigint; studyTime: bigint }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.updateWarModeStats(pomodoros, studyTime);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warModeStats'] });
    },
    onError: (error: Error) => {
      toast.error('Failed to update War Mode stats: ' + error.message);
    },
  });
}

export function useGetTimeSlots() {
  const { actor, isFetching } = useActor();

  return useQuery<TimeSlot[]>({
    queryKey: ['timeSlots'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTimeSlots();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddTimeSlot() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      startTime,
      endTime,
      activityType,
      description,
      chapter,
    }: {
      startTime: bigint;
      endTime: bigint;
      activityType: string;
      description: string;
      chapter: string;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addTimeSlot(startTime, endTime, activityType, description, chapter);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeSlots'] });
      toast.success('Time block added');
    },
    onError: (error: Error) => {
      toast.error('Failed to add time block: ' + error.message);
    },
  });
}

export function useUpdateTimeSlot() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      startTime,
      endTime,
      activityType,
      description,
      chapter,
    }: {
      id: bigint;
      startTime: bigint;
      endTime: bigint;
      activityType: string;
      description: string;
      chapter: string;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.updateTimeSlot(id, startTime, endTime, activityType, description, chapter);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeSlots'] });
      toast.success('Time block updated');
    },
    onError: (error: Error) => {
      toast.error('Failed to update time block: ' + error.message);
    },
  });
}

export function useToggleTimeSlotCompletion() {
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
      toast.success('Time block deleted');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete time block: ' + error.message);
    },
  });
}
