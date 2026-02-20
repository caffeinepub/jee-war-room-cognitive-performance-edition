import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { toast } from 'sonner';
import type { Chapter, ConsistencyDNA, PerformanceBlock, TimeSlot } from '../backend';

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
      return actor.registerUser();
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
        console.log('[useGetUserConsistency] Success:', result);
        return result;
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
      return actor.updateConsistency(isConsistent, currentDate);
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
        console.log('[useGetAllChapters] Success, chapters count:', result?.length || 0);
        return result || [];
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
    mutationFn: async (params: {
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
      console.log('[useAddChapter] Adding chapter:', params.name);
      return actor.addChapter(
        params.name,
        params.subject,
        params.revisionInterval,
        params.difficulty,
        params.importance
      );
    },
    onSuccess: () => {
      console.log('[useAddChapter] Chapter added successfully');
      queryClient.invalidateQueries({ queryKey: ['chapters'] });
      queryClient.invalidateQueries({ queryKey: ['revisionCoverage'] });
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
      return actor.toggleChapterCompletion(chapterId);
    },
    onSuccess: () => {
      console.log('[useToggleChapterCompletion] Chapter completion toggled');
      queryClient.invalidateQueries({ queryKey: ['chapters'] });
    },
    onError: (error: Error) => {
      console.error('[useToggleChapterCompletion] Error:', error);
      console.error('[useToggleChapterCompletion] Error stack:', error.stack);
      toast.error('Failed to toggle chapter completion: ' + error.message);
    },
  });
}

export function useUpdateChapterRevision() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      chapterId: bigint;
      field: 'theory' | 'pyqs' | 'advanced';
    }) => {
      if (!actor) {
        console.error('[useUpdateChapterRevision] Actor not initialized');
        throw new Error('Actor not initialized');
      }
      
      console.warn('[useUpdateChapterRevision] Backend endpoint not implemented');
      toast.error('Backend support needed: updateChapterRevision endpoint missing');
      throw new Error('Backend endpoint not implemented');
    },
    onSuccess: () => {
      console.log('[useUpdateChapterRevision] Revision updated');
      queryClient.invalidateQueries({ queryKey: ['chapters'] });
      queryClient.invalidateQueries({ queryKey: ['revisionCoverage'] });
      toast.success('Revision status updated');
    },
    onError: (error: Error) => {
      console.error('[useUpdateChapterRevision] Error:', error);
      if (!error.message.includes('Backend endpoint')) {
        toast.error('Failed to update revision: ' + error.message);
      }
    },
  });
}

export function useRevisionCoverage() {
  const { data: chapters } = useGetAllChapters();

  return useQuery({
    queryKey: ['revisionCoverage', chapters],
    queryFn: () => {
      console.log('[useRevisionCoverage] Calculating revision coverage...');
      if (!chapters || chapters.length === 0) {
        console.log('[useRevisionCoverage] No chapters, returning zeros');
        return {
          overall: 0,
          physics: 0,
          physicalChemistry: 0,
          organicChemistry: 0,
          inorganicChemistry: 0,
          mathematics: 0,
        };
      }

      const calculateChapterRevision = (chapter: Chapter) => {
        if (!chapter.isComplete && chapter.studyHours === BigInt(0)) {
          return 0;
        }
        
        const completed = [
          chapter.theoryCompleted,
          chapter.pyqsCompleted,
          chapter.advancedPracticeCompleted,
        ].filter(Boolean).length;
        
        return Math.round((completed / 3) * 100);
      };

      const getSubjectRevision = (subject: string) => {
        const subjectChapters = chapters.filter(ch => ch?.subject === subject);
        if (subjectChapters.length === 0) return 0;
        
        const total = subjectChapters.reduce((sum, ch) => sum + calculateChapterRevision(ch), 0);
        return Math.round(total / subjectChapters.length);
      };

      const overall = Math.round(
        chapters.reduce((sum, ch) => sum + calculateChapterRevision(ch), 0) / chapters.length
      );

      const result = {
        overall,
        physics: getSubjectRevision('Physics'),
        physicalChemistry: getSubjectRevision('Physical Chemistry'),
        organicChemistry: getSubjectRevision('Organic Chemistry'),
        inorganicChemistry: getSubjectRevision('Inorganic Chemistry'),
        mathematics: getSubjectRevision('Mathematics'),
      };

      console.log('[useRevisionCoverage] Calculated coverage:', result);
      return result;
    },
    enabled: !!chapters,
  });
}

export interface PYQYear {
  year: number;
  completed: boolean;
}

export function usePYQYears() {
  const { actor, isFetching } = useActor();

  return useQuery<PYQYear[]>({
    queryKey: ['pyqYears'],
    queryFn: async () => {
      console.log('[usePYQYears] Fetching PYQ years...');
      if (!actor) {
        console.warn('[usePYQYears] Actor not initialized, returning default years');
        return [];
      }
      
      const defaultYears = [
        { year: 2025, completed: false },
        { year: 2024, completed: false },
        { year: 2023, completed: false },
        { year: 2022, completed: false },
      ];
      
      console.log('[usePYQYears] Returning default years');
      return defaultYears;
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useTogglePYQYear() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (year: number) => {
      console.warn('[useTogglePYQYear] Backend endpoint not implemented');
      toast.error('Backend support needed: PYQ year tracking not implemented');
      throw new Error('Backend endpoint not implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pyqYears'] });
    },
    onError: (error: Error) => {
      console.error('[useTogglePYQYear] Error:', error);
      if (!error.message.includes('Backend endpoint')) {
        toast.error('Failed to toggle PYQ year: ' + error.message);
      }
    },
  });
}

export function useAddCustomPYQYear() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (year: number) => {
      if (year < 2000 || year > 2026) {
        throw new Error('Year must be between 2000 and 2026');
      }
      
      console.warn('[useAddCustomPYQYear] Backend endpoint not implemented');
      toast.error('Backend support needed: Custom PYQ year addition not implemented');
      throw new Error('Backend endpoint not implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pyqYears'] });
      toast.success('Custom year added');
    },
    onError: (error: Error) => {
      console.error('[useAddCustomPYQYear] Error:', error);
      if (!error.message.includes('Backend endpoint')) {
        toast.error('Failed to add custom year: ' + error.message);
      }
    },
  });
}

export function useGetPerformanceBlocks() {
  const { actor, isFetching } = useActor();

  return useQuery<PerformanceBlock[]>({
    queryKey: ['performanceBlocks'],
    queryFn: async () => {
      console.log('[useGetPerformanceBlocks] Fetching performance blocks...');
      if (!actor) {
        console.warn('[useGetPerformanceBlocks] Actor not initialized, returning empty array');
        return [];
      }
      try {
        const result = await actor.getPerformanceBlocks();
        console.log('[useGetPerformanceBlocks] Success, blocks count:', result?.length || 0);
        return result || [];
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
    mutationFn: async (params: {
      startTime: bigint;
      endTime: bigint;
      focusScore: bigint;
      productivity: bigint;
    }) => {
      if (!actor) {
        console.error('[useRecordPerformanceBlock] Actor not initialized');
        throw new Error('Actor not initialized');
      }
      console.log('[useRecordPerformanceBlock] Recording performance block...');
      return actor.recordPerformanceBlock(
        params.startTime,
        params.endTime,
        params.focusScore,
        params.productivity
      );
    },
    onSuccess: () => {
      console.log('[useRecordPerformanceBlock] Performance block recorded');
      queryClient.invalidateQueries({ queryKey: ['performanceBlocks'] });
      toast.success('Performance recorded');
    },
    onError: (error: Error) => {
      console.error('[useRecordPerformanceBlock] Error:', error);
      console.error('[useRecordPerformanceBlock] Error stack:', error.stack);
      toast.error('Failed to record performance: ' + error.message);
    },
  });
}

// Type matching the backend interface exactly
export type WarModeStats = {
  completedPomodoros: bigint;
  totalStudyTime: bigint;
  lastSession?: bigint;
};

export function useGetWarModeStats() {
  const { actor, isFetching } = useActor();

  return useQuery<WarModeStats>({
    queryKey: ['warModeStats'],
    queryFn: async () => {
      console.log('[useGetWarModeStats] Fetching war mode stats...');
      if (!actor) {
        console.warn('[useGetWarModeStats] Actor not initialized, returning defaults');
        return {
          completedPomodoros: BigInt(0),
          totalStudyTime: BigInt(0),
          lastSession: undefined,
        };
      }
      try {
        const result = await actor.getWarModeStats();
        console.log('[useGetWarModeStats] Success:', result);
        // Convert the backend response to match our type
        return {
          completedPomodoros: result.completedPomodoros,
          totalStudyTime: result.totalStudyTime,
          lastSession: result.lastSession || undefined,
        };
      } catch (error) {
        console.error('[useGetWarModeStats] Error:', error);
        return {
          completedPomodoros: BigInt(0),
          totalStudyTime: BigInt(0),
          lastSession: undefined,
        };
      }
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
      if (!actor) {
        console.error('[useUpdateWarModeStats] Actor not initialized');
        throw new Error('Actor not initialized');
      }
      console.log('[useUpdateWarModeStats] Updating war mode stats...');
      return actor.updateWarModeStats(params.pomodoros, params.studyTime);
    },
    onSuccess: () => {
      console.log('[useUpdateWarModeStats] War mode stats updated');
      queryClient.invalidateQueries({ queryKey: ['warModeStats'] });
      toast.success('War mode stats updated');
    },
    onError: (error: Error) => {
      console.error('[useUpdateWarModeStats] Error:', error);
      console.error('[useUpdateWarModeStats] Error stack:', error.stack);
      toast.error('Failed to update war mode stats: ' + error.message);
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
        console.warn('[useGetTimeSlots] Actor not initialized, returning empty array');
        return [];
      }
      try {
        const result = await actor.getTimeSlots();
        console.log('[useGetTimeSlots] Success, slots count:', result?.length || 0);
        return result || [];
      } catch (error) {
        console.error('[useGetTimeSlots] Error:', error);
        return [];
      }
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
      if (!actor) {
        console.error('[useAddTimeSlot] Actor not initialized');
        throw new Error('Actor not initialized');
      }
      console.log('[useAddTimeSlot] Adding time slot...');
      return actor.addTimeSlot(
        params.startTime,
        params.endTime,
        params.activityType,
        params.description
      );
    },
    onSuccess: () => {
      console.log('[useAddTimeSlot] Time slot added');
      queryClient.invalidateQueries({ queryKey: ['timeSlots'] });
      toast.success('Time slot added');
    },
    onError: (error: Error) => {
      console.error('[useAddTimeSlot] Error:', error);
      console.error('[useAddTimeSlot] Error stack:', error.stack);
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
      if (!actor) {
        console.error('[useUpdateTimeSlot] Actor not initialized');
        throw new Error('Actor not initialized');
      }
      console.log('[useUpdateTimeSlot] Updating time slot:', params.id);
      return actor.updateTimeSlot(
        params.id,
        params.startTime,
        params.endTime,
        params.activityType,
        params.description
      );
    },
    onSuccess: () => {
      console.log('[useUpdateTimeSlot] Time slot updated');
      queryClient.invalidateQueries({ queryKey: ['timeSlots'] });
      toast.success('Time slot updated');
    },
    onError: (error: Error) => {
      console.error('[useUpdateTimeSlot] Error:', error);
      console.error('[useUpdateTimeSlot] Error stack:', error.stack);
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
      return actor.toggleCompletion(id);
    },
    onSuccess: () => {
      console.log('[useToggleTimeSlotCompletion] Time slot completion toggled');
      queryClient.invalidateQueries({ queryKey: ['timeSlots'] });
    },
    onError: (error: Error) => {
      console.error('[useToggleTimeSlotCompletion] Error:', error);
      console.error('[useToggleTimeSlotCompletion] Error stack:', error.stack);
      toast.error('Failed to toggle completion: ' + error.message);
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
      return actor.deleteTimeSlot(id);
    },
    onSuccess: () => {
      console.log('[useDeleteTimeSlot] Time slot deleted');
      queryClient.invalidateQueries({ queryKey: ['timeSlots'] });
      toast.success('Time slot deleted');
    },
    onError: (error: Error) => {
      console.error('[useDeleteTimeSlot] Error:', error);
      console.error('[useDeleteTimeSlot] Error stack:', error.stack);
      toast.error('Failed to delete time slot: ' + error.message);
    },
  });
}
