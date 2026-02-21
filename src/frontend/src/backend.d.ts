import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TimeSlot {
    id: bigint;
    startTime: Time;
    activityType: string;
    endTime: Time;
    description: string;
    isComplete: boolean;
}
export type Time = bigint;
export interface PerformanceBlock {
    startTime: Time;
    endTime: Time;
    focusScore: bigint;
    blockId: bigint;
    productivity: bigint;
}
export interface ConsistencyDNA {
    lastEntryDate?: string;
    lastUpdate: Time;
    daysTracked: bigint;
    daysConsistent: bigint;
}
export interface Chapter {
    id: bigint;
    subject: string;
    revisionInterval: bigint;
    difficulty: string;
    name: string;
    importance: string;
    advancedPracticeCompleted: boolean;
    lastStudied?: Time;
    studyHours: bigint;
    pyqsCompleted: boolean;
    theoryCompleted: boolean;
    isComplete: boolean;
}
export interface backendInterface {
    addChapter(name: string, subject: string, revisionInterval: bigint, difficulty: string, importance: string): Promise<Chapter>;
    addTimeSlot(startTime: Time, endTime: Time, activityType: string, description: string): Promise<TimeSlot>;
    deleteTimeSlot(id: bigint): Promise<void>;
    getAllChapters(): Promise<Array<Chapter>>;
    getPerformanceBlocks(): Promise<Array<PerformanceBlock>>;
    getSortedConsistencyLeaderboard(): Promise<Array<[Principal, ConsistencyDNA]>>;
    getTimeSlots(): Promise<Array<TimeSlot>>;
    getUserConsistency(): Promise<ConsistencyDNA>;
    getWarModeStats(): Promise<{
        totalWarModeStudyTime: bigint;
        lastSession?: Time;
        totalStudyTime: bigint;
        warModeOnlyStudyTime: bigint;
        completedPomodoros: bigint;
    }>;
    recordPerformanceBlock(startTime: Time, endTime: Time, focusScore: bigint, productivity: bigint): Promise<PerformanceBlock>;
    registerUser(): Promise<void>;
    toggleChapterCompletion(chapterId: bigint): Promise<Chapter>;
    toggleCompletion(id: bigint): Promise<TimeSlot>;
    updateChapterRevision(chapterId: bigint, theoryCompleted: boolean, pyqsCompleted: boolean, advancedPracticeCompleted: boolean): Promise<void>;
    updateConsistency(isConsistent: boolean, currentDate: string): Promise<ConsistencyDNA>;
    updateTimeSlot(id: bigint, startTime: Time, endTime: Time, activityType: string, description: string): Promise<TimeSlot>;
    updateWarModeStats(pomodoros: bigint, studyTime: bigint): Promise<void>;
}
