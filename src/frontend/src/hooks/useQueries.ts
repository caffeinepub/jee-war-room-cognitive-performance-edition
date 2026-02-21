import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { toast } from 'sonner';
import type { Chapter, ConsistencyDNA, PerformanceBlock, TimeSlot } from '../backend';
import { convertBigIntsToStrings } from '../utils/bigIntSerializer';

export function useRegisterUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) {
        console.error('[useRegisterUser] Actor not initialized');
        throw new Error('Actor not initialized');
      }
      console.log('[useRegisterUser] Registering user...');
      const result = await actor.registerUser();
      return convertBigIntsToStrings(result);
    },
    onSuccess: () => {
      console.log('[useRegisterUser] User registered successfully');
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('User registered successfully');
    },
    onError: (error: Error) => {
      console.error('[useRegisterUser] Error:', error);
      console.error('[useRegisterUser] Error stack:', error.stack);
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
      console.log('[useGetUserConsistency] Fetching consistency data...');
      if (!actor) {
        console.error('[useGetUserConsistency] Actor not initialized');
        throw new Error('Actor not initialized');
      }
      try {
        const result = await actor.getUserConsistency();
        const converted = convertBigIntsToStrings(result);
        console.log('[useGetUserConsistency] Success, data converted');
        return converted;
      } catch (error) {
        console.error('[useGetUserConsistency] Error:', error);
        throw error;
      }
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
      if (!actor) {
        console.error('[useUpdateConsistency] Actor not initialized');
        throw new Error('Actor not initialized');
      }
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000;
      const istDate = new Date(now.getTime() + istOffset);
      const currentDate = istDate.toISOString().split('T')[0];
      
      console.log('[useUpdateConsistency] Updating consistency for date:', currentDate);
      const result = await actor.updateConsistency(isConsistent, currentDate);
      return convertBigIntsToStrings(result);
    },
    onSuccess: () => {
      console.log('[useUpdateConsistency] Consistency updated successfully');
      queryClient.invalidateQueries({ queryKey: ['consistency'] });
      toast.success('Consistency updated');
    },
    onError: (error: Error) => {
      console.error('[useUpdateConsistency] Error:', error);
      console.error('[useUpdateConsistency] Error stack:', error.stack);
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
      console.log('[useGetAllChapters] Fetching chapters...');
      if (!actor) {
        console.warn('[useGetAllChapters] Actor not initialized, returning empty array');
        return [];
      }
      try {
        const result = await actor.getAllChapters();
        const converted = convertBigIntsToStrings(result || []);
        console.log('[useGetAllChapters] Success, chapters count:', converted.length);
        return converted;
      } catch (error) {
        console.error('[useGetAllChapters] Error:', error);
        console.error('[useGetAllChapters] Error stack:', error instanceof Error ? error.stack : 'No stack');
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    retry: false,
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
      if (!actor) {
        console.error('[useAddChapter] Actor not initialized');
        throw new Error('Actor not initialized');
      }
      console.log('[useAddChapter] Adding chapter:', name);
      const result = await actor.addChapter(name, subject, revisionInterval, difficulty, importance);
      return convertBigIntsToStrings(result);
    },
    onSuccess: () => {
      console.log('[useAddChapter] Chapter added successfully');
      queryClient.invalidateQueries({ queryKey: ['chapters'] });
      toast.success('Chapter added successfully');
    },
    onError: (error: Error) => {
      console.error('[useAddChapter] Error:', error);
      console.error('[useAddChapter] Error stack:', error.stack);
      toast.error('Failed to add chapter: ' + error.message);
    },
  });
}

export function useToggleChapterCompletion() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (chapterId: bigint) => {
      if (!actor) {
        console.error('[useToggleChapterCompletion] Actor not initialized');
        throw new Error('Actor not initialized');
      }
      console.log('[useToggleChapterCompletion] Toggling chapter:', chapterId);
      const result = await actor.toggleChapterCompletion(chapterId);
      return convertBigIntsToStrings(result);
    },
    onSuccess: () => {
      console.log('[useToggleChapterCompletion] Chapter completion toggled');
      queryClient.invalidateQueries({ queryKey: ['chapters'] });
    },
    onError: (error: Error) => {
      console.error('[useToggleChapterCompletion] Error:', error);
      console.error('[useToggleChapterCompletion] Error stack:', error.stack);
      toast.error('Failed to update chapter: ' + error.message);
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
      if (!actor) {
        console.error('[useUpdateChapterRevision] Actor not initialized');
        throw new Error('Actor not initialized');
      }
      console.log('[useUpdateChapterRevision] Updating chapter revision:', chapterId);
      const result = await actor.updateChapterRevision(
        chapterId,
        theoryCompleted,
        pyqsCompleted,
        advancedPracticeCompleted
      );
      return convertBigIntsToStrings(result);
    },
    onSuccess: () => {
      console.log('[useUpdateChapterRevision] Chapter revision updated successfully');
      queryClient.invalidateQueries({ queryKey: ['chapters'] });
    },
    onError: (error: Error) => {
      console.error('[useUpdateChapterRevision] Error:', error);
      console.error('[useUpdateChapterRevision] Error stack:', error.stack);
      toast.error('Failed to update revision: ' + error.message);
    },
  });
}

export function useUpdateWarModeStats() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ pomodoros, studyTime }: { pomodoros: bigint; studyTime: bigint }) => {
      if (!actor) {
        console.error('[useUpdateWarModeStats] Actor not initialized');
        throw new Error('Actor not initialized');
      }
      console.log('[useUpdateWarModeStats] Updating War Mode stats:', { pomodoros, studyTime });
      try {
        const result = await actor.updateWarModeStats(pomodoros, studyTime);
        console.log('[useUpdateWarModeStats] Success');
        return convertBigIntsToStrings(result);
      } catch (error) {
        console.error('[useUpdateWarModeStats] Error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('[useUpdateWarModeStats] War Mode stats updated, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['warModeStats'] });
      toast.success('Session saved successfully');
    },
    onError: (error: Error) => {
      console.error('[useUpdateWarModeStats] Mutation error:', error);
      console.error('[useUpdateWarModeStats] Error stack:', error.stack);
      toast.error('Failed to save session: ' + error.message);
    },
  });
}

export function useGetWarModeStats() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['warModeStats'],
    queryFn: async () => {
      console.log('[useGetWarModeStats] Fetching War Mode stats...');
      if (!actor) {
        console.warn('[useGetWarModeStats] Actor not initialized');
        return null;
      }
      try {
        const result = await actor.getWarModeStats();
        const converted = convertBigIntsToStrings(result);
        console.log('[useGetWarModeStats] Success, data converted');
        return converted;
      } catch (error) {
        console.error('[useGetWarModeStats] Error:', error);
        console.error('[useGetWarModeStats] Error stack:', error instanceof Error ? error.stack : 'No stack');
        return null;
      }
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useGetPerformanceBlocks() {
  const { actor, isFetching } = useActor();

  return useQuery<PerformanceBlock[]>({
    queryKey: ['performanceBlocks'],
    queryFn: async () => {
      console.log('[useGetPerformanceBlocks] Fetching performance blocks...');
      if (!actor) {
        console.warn('[useGetPerformanceBlocks] Actor not initialized');
        return [];
      }
      try {
        const result = await actor.getPerformanceBlocks();
        const converted = convertBigIntsToStrings(result || []);
        console.log('[useGetPerformanceBlocks] Success, blocks count:', converted.length);
        return converted;
      } catch (error) {
        console.error('[useGetPerformanceBlocks] Error:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useRecordPerformanceBlock() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      startTime,
      endTime,
      focusScore,
      productivity,
    }: {
      startTime: bigint;
      endTime: bigint;
      focusScore: bigint;
      productivity: bigint;
    }) => {
      if (!actor) {
        console.error('[useRecordPerformanceBlock] Actor not initialized');
        throw new Error('Actor not initialized');
      }
      console.log('[useRecordPerformanceBlock] Recording performance block');
      const result = await actor.recordPerformanceBlock(startTime, endTime, focusScore, productivity);
      return convertBigIntsToStrings(result);
    },
    onSuccess: () => {
      console.log('[useRecordPerformanceBlock] Performance block recorded successfully');
      queryClient.invalidateQueries({ queryKey: ['performanceBlocks'] });
      toast.success('Performance recorded');
    },
    onError: (error: Error) => {
      console.error('[useRecordPerformanceBlock] Error:', error);
      toast.error('Failed to record performance: ' + error.message);
    },
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
    }: {
      startTime: bigint;
      endTime: bigint;
      activityType: string;
      description: string;
    }) => {
      if (!actor) {
        console.error('[useAddTimeSlot] Actor not initialized');
        throw new Error('Actor not initialized');
      }
      console.log('[useAddTimeSlot] Adding time slot');
      const result = await actor.addTimeSlot(startTime, endTime, activityType, description);
      return convertBigIntsToStrings(result);
    },
    onSuccess: () => {
      console.log('[useAddTimeSlot] Time slot added successfully');
      queryClient.invalidateQueries({ queryKey: ['timeSlots'] });
      toast.success('Time slot added');
    },
    onError: (error: Error) => {
      console.error('[useAddTimeSlot] Error:', error);
      toast.error('Failed to add time slot: ' + error.message);
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
    }: {
      id: bigint;
      startTime: bigint;
      endTime: bigint;
      activityType: string;
      description: string;
    }) => {
      if (!actor) {
        console.error('[useUpdateTimeSlot] Actor not initialized');
        throw new Error('Actor not initialized');
      }
      console.log('[useUpdateTimeSlot] Updating time slot:', id);
      const result = await actor.updateTimeSlot(id, startTime, endTime, activityType, description);
      return convertBigIntsToStrings(result);
    },
    onSuccess: () => {
      console.log('[useUpdateTimeSlot] Time slot updated successfully');
      queryClient.invalidateQueries({ queryKey: ['timeSlots'] });
      toast.success('Time slot updated');
    },
    onError: (error: Error) => {
      console.error('[useUpdateTimeSlot] Error:', error);
      toast.error('Failed to update time slot: ' + error.message);
    },
  });
}

export function useToggleTimeSlotCompletion() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) {
        console.error('[useToggleTimeSlotCompletion] Actor not initialized');
        throw new Error('Actor not initialized');
      }
      console.log('[useToggleTimeSlotCompletion] Toggling time slot:', id);
      const result = await actor.toggleCompletion(id);
      return convertBigIntsToStrings(result);
    },
    onSuccess: () => {
      console.log('[useToggleTimeSlotCompletion] Time slot completion toggled');
      queryClient.invalidateQueries({ queryKey: ['timeSlots'] });
    },
    onError: (error: Error) => {
      console.error('[useToggleTimeSlotCompletion] Error:', error);
      toast.error('Failed to update time slot: ' + error.message);
    },
  });
}

export function useDeleteTimeSlot() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) {
        console.error('[useDeleteTimeSlot] Actor not initialized');
        throw new Error('Actor not initialized');
      }
      console.log('[useDeleteTimeSlot] Deleting time slot:', id);
      const result = await actor.deleteTimeSlot(id);
      return convertBigIntsToStrings(result);
    },
    onSuccess: () => {
      console.log('[useDeleteTimeSlot] Time slot deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['timeSlots'] });
      toast.success('Time slot deleted');
    },
    onError: (error: Error) => {
      console.error('[useDeleteTimeSlot] Error:', error);
      toast.error('Failed to delete time slot: ' + error.message);
    },
  });
}

export function useGetTimeSlots() {
  const { actor, isFetching } = useActor();

  return useQuery<TimeSlot[]>({
    queryKey: ['timeSlots'],
    queryFn: async () => {
      console.log('[useGetTimeSlots] Fetching time slots...');
      if (!actor) {
        console.warn('[useGetTimeSlots] Actor not initialized');
        return [];
      }
      try {
        const result = await actor.getTimeSlots();
        const converted = convertBigIntsToStrings(result || []);
        console.log('[useGetTimeSlots] Success, slots count:', converted.length);
        return converted;
      } catch (error) {
        console.error('[useGetTimeSlots] Error:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

// Placeholder hooks for PYQ tracking (backend methods not available)
export function usePYQYears() {
  return useQuery({
    queryKey: ['pyqYears'],
    queryFn: async () => {
      console.warn('[usePYQYears] Backend method not implemented');
      // Return default years as placeholder
      return [
        { year: 2025, completed: false },
        { year: 2024, completed: false },
        { year: 2023, completed: false },
        { year: 2022, completed: false },
      ];
    },
    enabled: false, // Disabled until backend is implemented
  });
}

export function useTogglePYQYear() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ year }: { year: number }) => {
      console.warn('[useTogglePYQYear] Backend method not implemented');
      throw new Error('Backend method togglePYQYear not available');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pyqYears'] });
      toast.success('PYQ year updated');
    },
    onError: (error: Error) => {
      console.error('[useTogglePYQYear] Error:', error);
      toast.error('Backend method not available. Please implement PYQ tracking in backend.');
    },
  });
}

export function useAddPYQYear() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ year }: { year: number }) => {
      console.warn('[useAddPYQYear] Backend method not implemented');
      throw new Error('Backend method addPYQYear not available');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pyqYears'] });
      toast.success('PYQ year added');
    },
    onError: (error: Error) => {
      console.error('[useAddPYQYear] Error:', error);
      toast.error('Backend method not available. Please implement PYQ tracking in backend.');
    },
  });
}
