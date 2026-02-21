import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Text "mo:core/Text";

module {
  type ConsistencyDNA = {
    daysTracked : Nat;
    daysConsistent : Nat;
    lastUpdate : Time.Time;
    lastEntryDate : ?Text;
  };

  type Chapter = {
    id : Nat;
    name : Text;
    subject : Text;
    revisionInterval : Nat;
    lastStudied : ?Time.Time;
    difficulty : Text;
    importance : Text;
    studyHours : Nat;
    isComplete : Bool;
    theoryCompleted : Bool;
    pyqsCompleted : Bool;
    advancedPracticeCompleted : Bool;
  };

  type PerformanceBlock = {
    blockId : Nat;
    startTime : Time.Time;
    endTime : Time.Time;
    focusScore : Nat;
    productivity : Nat;
  };

  type OldTimeSlot = {
    id : Nat;
    startTime : Time.Time;
    endTime : Time.Time;
    activityType : Text;
    description : Text;
    isComplete : Bool;
  };

  type NewTimeSlot = {
    id : Nat;
    startTime : Time.Time;
    endTime : Time.Time;
    activityType : Text;
    description : Text;
    isComplete : Bool;
    chapter : Text;
  };

  type WarModeStats = {
    completedPomodoros : Nat;
    totalStudyTime : Nat;
    lastSession : ?Time.Time;
    warModeOnlyStudyTime : Nat;
    totalWarModeStudyTime : Nat;
  };

  type OldSleepEntry = {
    date : Text;
    hoursSlept : Float;
    qualityRating : Nat;
  };

  type OldUserData = {
    consistency : ConsistencyDNA;
    chapters : [Chapter];
    performanceBlocks : [PerformanceBlock];
    warModeStats : WarModeStats;
    timeSlots : [OldTimeSlot];
    sleepData : [OldSleepEntry];
  };

  type OldActor = {
    users : Map.Map<Principal, OldUserData>;
  };

  type NewUserData = {
    consistency : ConsistencyDNA;
    chapters : [Chapter];
    performanceBlocks : [PerformanceBlock];
    warModeStats : WarModeStats;
    timeSlots : [NewTimeSlot];
  };

  type NewActor = {
    users : Map.Map<Principal, NewUserData>;
  };

  public func run(old : OldActor) : NewActor {
    let newUsers = old.users.map<Principal, OldUserData, NewUserData>(
      func(_id, oldUser) {
        let newTimeSlots = oldUser.timeSlots.map(
          func(oldSlot) {
            {
              oldSlot with
              chapter = "Unspecified";
            };
          }
        );
        { oldUser with timeSlots = newTimeSlots };
      }
    );
    { users = newUsers };
  };
};
