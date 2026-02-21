import Map "mo:core/Map";
import Nat "mo:core/Nat";

module {
  type OldConsistencyDNA = {
    daysTracked : Nat;
    daysConsistent : Nat;
    lastUpdate : Int;
    lastEntryDate : ?Text;
  };

  type OldChapter = {
    id : Nat;
    name : Text;
    subject : Text;
    revisionInterval : Nat;
    lastStudied : ?Int;
    difficulty : Text;
    importance : Text;
    studyHours : Nat;
    isComplete : Bool;
    theoryCompleted : Bool;
    pyqsCompleted : Bool;
    advancedPracticeCompleted : Bool;
  };

  type OldPerformanceBlock = {
    blockId : Nat;
    startTime : Int;
    endTime : Int;
    focusScore : Nat;
    productivity : Nat;
  };

  type OldTimeSlot = {
    id : Nat;
    startTime : Int;
    endTime : Int;
    activityType : Text;
    description : Text;
    isComplete : Bool;
  };

  type OldWarModeStats = {
    completedPomodoros : Nat;
    totalStudyTime : Nat;
    lastSession : ?Int;
    warModeOnlyStudyTime : Nat;
    totalWarModeStudyTime : Nat;
  };

  type OldUserData = {
    consistency : OldConsistencyDNA;
    chapters : [OldChapter];
    performanceBlocks : [OldPerformanceBlock];
    warModeStats : OldWarModeStats;
    timeSlots : [OldTimeSlot];
  };

  type OldActor = {
    users : Map.Map<Principal, OldUserData>;
  };

  type NewConsistencyDNA = {
    daysTracked : Nat;
    daysConsistent : Nat;
    lastUpdate : Int;
    lastEntryDate : ?Text;
  };

  type NewChapter = {
    id : Nat;
    name : Text;
    subject : Text;
    revisionInterval : Nat;
    lastStudied : ?Int;
    difficulty : Text;
    importance : Text;
    studyHours : Nat;
    isComplete : Bool;
    theoryCompleted : Bool;
    pyqsCompleted : Bool;
    advancedPracticeCompleted : Bool;
  };

  type NewPerformanceBlock = {
    blockId : Nat;
    startTime : Int;
    endTime : Int;
    focusScore : Nat;
    productivity : Nat;
  };

  type NewTimeSlot = {
    id : Nat;
    startTime : Int;
    endTime : Int;
    activityType : Text;
    description : Text;
    isComplete : Bool;
  };

  type NewWarModeStats = {
    completedPomodoros : Nat;
    totalStudyTime : Nat;
    lastSession : ?Int;
    warModeOnlyStudyTime : Nat;
    totalWarModeStudyTime : Nat;
  };

  type NewUserData = {
    consistency : NewConsistencyDNA;
    chapters : [NewChapter];
    performanceBlocks : [NewPerformanceBlock];
    warModeStats : NewWarModeStats;
    timeSlots : [NewTimeSlot];
  };

  type NewActor = {
    users : Map.Map<Principal, NewUserData>;
  };

  public func run(old : OldActor) : NewActor {
    old;
  };
};
