import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Array "mo:core/Array";



actor {
  type ConsistencyDNA = {
    daysTracked : Nat;
    daysConsistent : Nat;
    lastUpdate : Time.Time;
    lastEntryDate : ?Text;
  };

  module ConsistencyDNA {
    public func compare(dna1 : ConsistencyDNA, dna2 : ConsistencyDNA) : Order.Order {
      switch (Int.compare(dna1.daysConsistent, dna2.daysConsistent)) {
        case (#equal) { if (dna1.daysTracked < dna2.daysTracked) { #less } else { #greater } };
        case (order) { order };
      };
    };
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
    theoryCompleted : Bool; // Revision tracking fields
    pyqsCompleted : Bool; // PYQs tracking field
    advancedPracticeCompleted : Bool; // Advanced practice field
  };

  type PerformanceBlock = {
    blockId : Nat;
    startTime : Time.Time;
    endTime : Time.Time;
    focusScore : Nat;
    productivity : Nat;
  };

  type TimeSlot = {
    id : Nat;
    startTime : Time.Time;
    endTime : Time.Time;
    activityType : Text;
    description : Text;
    isComplete : Bool;
  };

  type UserData = {
    consistency : ConsistencyDNA;
    chapters : [Chapter];
    performanceBlocks : [PerformanceBlock];
    warModeStats : {
      completedPomodoros : Nat;
      totalStudyTime : Nat;
      lastSession : ?Time.Time;
    };
    timeSlots : [TimeSlot];
  };

  let users = Map.empty<Principal, UserData>();

  public shared ({ caller }) func registerUser() : async () {
    if (users.containsKey(caller)) {
      Runtime.trap("User already registered");
    };
    let newUser : UserData = {
      consistency = {
        daysTracked = 0;
        daysConsistent = 0;
        lastUpdate = Time.now();
        lastEntryDate = null;
      };
      chapters = [];
      performanceBlocks = [];
      warModeStats = {
        completedPomodoros = 0;
        totalStudyTime = 0;
        lastSession = null;
      };
      timeSlots = [];
    };
    users.add(caller, newUser);
  };

  public shared ({ caller }) func addChapter(
    name : Text,
    subject : Text,
    revisionInterval : Nat,
    difficulty : Text,
    importance : Text
  ) : async Chapter {
    let currentTime = Time.now();
    let chapter = {
      id = Int.abs(currentTime);
      name;
      subject;
      revisionInterval;
      lastStudied = null;
      difficulty;
      importance;
      studyHours = 0;
      isComplete = false;
      theoryCompleted = false;
      pyqsCompleted = false;
      advancedPracticeCompleted = false;
    };

    switch (users.get(caller)) {
      case (?userData) {
        let updatedChapters = userData.chapters.concat([chapter]);
        let updatedUserData : UserData = {
          consistency = userData.consistency;
          chapters = updatedChapters;
          performanceBlocks = userData.performanceBlocks;
          warModeStats = userData.warModeStats;
          timeSlots = userData.timeSlots;
        };
        users.add(caller, updatedUserData);
        chapter;
      };
      case (null) { Runtime.trap("User not found") };
    };
  };

  public shared ({ caller }) func toggleChapterCompletion(chapterId : Nat) : async Chapter {
    switch (users.get(caller)) {
      case (?userData) {
        let chapters = userData.chapters;
        var chapterFound = false : Bool;

        let updatedChapters = chapters.map(
          func(chapter) {
            if (chapter.id == chapterId) {
              chapterFound := true;
              {
                chapter with isComplete = not chapter.isComplete
              };
            } else { chapter };
          }
        );

        if (chapterFound) {
          let updatedUserData : UserData = {
            consistency = userData.consistency;
            chapters = updatedChapters;
            performanceBlocks = userData.performanceBlocks;
            warModeStats = userData.warModeStats;
            timeSlots = userData.timeSlots;
          };
          users.add(caller, updatedUserData);
          switch (userData.chapters.find(func(chapter) { chapter.id == chapterId })) {
            case (?chapter) { chapter };
            case (null) { Runtime.trap("Chapter not found after updating") };
          };
        } else {
          Runtime.trap("Chapter not found");
        };
      };
      case (null) { Runtime.trap("User not found") };
    };
  };

  public shared ({ caller }) func updateConsistency(isConsistent : Bool, currentDate : Text) : async ConsistencyDNA {
    switch (users.get(caller)) {
      case (?userData) {
        let currentTime = Time.now();

        // Check if the entry for today already exists
        switch (userData.consistency.lastEntryDate) {
          case (?lastDate) {
            if (lastDate == currentDate) {
              Runtime.trap("Consistency already marked for today");
            };
          };
          case (null) {};
        };

        let newConsistency = {
          daysTracked = userData.consistency.daysTracked + 1;
          daysConsistent = if (isConsistent) {
            userData.consistency.daysConsistent + 1;
          } else {
            userData.consistency.daysConsistent;
          };
          lastUpdate = currentTime;
          lastEntryDate = ?currentDate;
        };

        let updatedUserData : UserData = {
          consistency = newConsistency;
          chapters = userData.chapters;
          performanceBlocks = userData.performanceBlocks;
          warModeStats = userData.warModeStats;
          timeSlots = userData.timeSlots;
        };
        users.add(caller, updatedUserData);
        newConsistency;
      };
      case (null) { Runtime.trap("User not found") };
    };
  };

  public shared ({ caller }) func recordPerformanceBlock(
    startTime : Time.Time,
    endTime : Time.Time,
    focusScore : Nat,
    productivity : Nat
  ) : async PerformanceBlock {
    let block = {
      blockId = Int.abs(startTime);
      startTime;
      endTime;
      focusScore;
      productivity;
    };

    switch (users.get(caller)) {
      case (?userData) {
        let updatedBlocks = userData.performanceBlocks.concat([block]);
        let updatedUserData : UserData = {
          consistency = userData.consistency;
          chapters = userData.chapters;
          performanceBlocks = updatedBlocks;
          warModeStats = userData.warModeStats;
          timeSlots = userData.timeSlots;
        };
        users.add(caller, updatedUserData);
        block;
      };
      case (null) { Runtime.trap("User not found") };
    };
  };

  public shared ({ caller }) func updateWarModeStats(pomodoros : Nat, studyTime : Nat) : async () {
    switch (users.get(caller)) {
      case (?userData) {
        let updatedStats = {
          completedPomodoros = userData.warModeStats.completedPomodoros + pomodoros;
          totalStudyTime = userData.warModeStats.totalStudyTime + studyTime;
          lastSession = ?Time.now();
        };
        let updatedUserData : UserData = {
          consistency = userData.consistency;
          chapters = userData.chapters;
          performanceBlocks = userData.performanceBlocks;
          warModeStats = updatedStats;
          timeSlots = userData.timeSlots;
        };
        users.add(caller, updatedUserData);
      };
      case (null) { Runtime.trap("User not found") };
    };
  };

  public query ({ caller }) func getUserConsistency() : async ConsistencyDNA {
    switch (users.get(caller)) {
      case (?userData) { userData.consistency };
      case (null) { Runtime.trap("User not found") };
    };
  };

  public query ({ caller }) func getAllChapters() : async [Chapter] {
    switch (users.get(caller)) {
      case (?userData) { userData.chapters };
      case (null) { Runtime.trap("User not found") };
    };
  };

  public query ({ caller }) func getPerformanceBlocks() : async [PerformanceBlock] {
    switch (users.get(caller)) {
      case (?userData) { userData.performanceBlocks };
      case (null) { Runtime.trap("User not found") };
    };
  };

  public query ({ caller }) func getWarModeStats() : async {
    completedPomodoros : Nat;
    totalStudyTime : Nat;
    lastSession : ?Time.Time;
  } {
    switch (users.get(caller)) {
      case (?userData) { userData.warModeStats };
      case (null) { Runtime.trap("User not found") };
    };
  };

  public query ({ caller }) func getSortedConsistencyLeaderboard() : async [(Principal, ConsistencyDNA)] {
    let entries = users.toArray();
    entries.sort(
      func((_, dna1), (_, dna2)) {
        switch (Int.compare(dna1.consistency.daysConsistent, dna2.consistency.daysConsistent)) {
          case (#equal) {
            if (dna1.consistency.daysTracked < dna2.consistency.daysTracked) {
              #less;
            } else { #greater };
          };
          case (order) { order };
        };
      }
    ).map(
      func((principal, data)) { (principal, data.consistency) }
    );
  };

  // BEGIN COMP-DAILY-GOAL-TRACKER

  public shared ({ caller }) func addTimeSlot(
    startTime : Time.Time,
    endTime : Time.Time,
    activityType : Text,
    description : Text
  ) : async TimeSlot {
    let slot = {
      id = Int.abs(Time.now());
      startTime;
      endTime;
      activityType;
      description;
      isComplete = false;
    };

    switch (users.get(caller)) {
      case (?userData) {
        let updatedSlots = userData.timeSlots.concat([slot]);
        let updatedUserData : UserData = {
          consistency = userData.consistency;
          chapters = userData.chapters;
          performanceBlocks = userData.performanceBlocks;
          warModeStats = userData.warModeStats;
          timeSlots = updatedSlots;
        };
        users.add(caller, updatedUserData);
        slot;
      };
      case (null) { Runtime.trap("User not found") };
    };
  };

  public shared ({ caller }) func updateTimeSlot(
    id : Nat,
    startTime : Time.Time,
    endTime : Time.Time,
    activityType : Text,
    description : Text
  ) : async TimeSlot {
    switch (users.get(caller)) {
      case (?userData) {
        let slots = userData.timeSlots;
        var slotFound = false : Bool;

        let updatedSlots = slots.map(
          func(slot) {
            if (slot.id == id) {
              slotFound := true;
              {
                slot with
                startTime;
                endTime;
                activityType;
                description;
              };
            } else { slot };
          }
        );

        if (slotFound) {
          let updatedUserData : UserData = {
            consistency = userData.consistency;
            chapters = userData.chapters;
            performanceBlocks = userData.performanceBlocks;
            warModeStats = userData.warModeStats;
            timeSlots = updatedSlots;
          };
          users.add(caller, updatedUserData);
          switch (userData.timeSlots.find(func(slot) { slot.id == id })) {
            case (?slot) { slot };
            case (null) { Runtime.trap("Slot not found after updating") };
          };
        } else {
          Runtime.trap("TimeSlot not found");
        };
      };
      case (null) { Runtime.trap("User not found") };
    };
  };

  public shared ({ caller }) func toggleCompletion(id : Nat) : async TimeSlot {
    switch (users.get(caller)) {
      case (?userData) {
        let slots = userData.timeSlots;
        var slotFound = false : Bool;

        let updatedSlots = slots.map(
          func(slot) {
            if (slot.id == id) {
              slotFound := true;
              { slot with isComplete = not slot.isComplete };
            } else { slot };
          }
        );

        if (slotFound) {
          let updatedUserData : UserData = {
            consistency = userData.consistency;
            chapters = userData.chapters;
            performanceBlocks = userData.performanceBlocks;
            warModeStats = userData.warModeStats;
            timeSlots = updatedSlots;
          };
          users.add(caller, updatedUserData);
          switch (userData.timeSlots.find(func(slot) { slot.id == id })) {
            case (?slot) { slot };
            case (null) { Runtime.trap("Slot not found after updating") };
          };
        } else {
          Runtime.trap("TimeSlot not found");
        };
      };
      case (null) { Runtime.trap("User not found") };
    };
  };

  public shared ({ caller }) func deleteTimeSlot(id : Nat) : async () {
    switch (users.get(caller)) {
      case (?userData) {
        let slots = userData.timeSlots;
        let persistentList = List.empty<TimeSlot>();

        for (slot in slots.values()) {
          if (slot.id != id) {
            persistentList.add(slot);
          };
        };

        if (persistentList.size() < slots.size()) {
          let updatedUserData : UserData = {
            consistency = userData.consistency;
            chapters = userData.chapters;
            performanceBlocks = userData.performanceBlocks;
            warModeStats = userData.warModeStats;
            timeSlots = persistentList.toArray();
          };
          users.add(caller, updatedUserData);
        } else {
          Runtime.trap("TimeSlot not found");
        };
      };
      case (null) { Runtime.trap("User not found") };
    };
  };

  public query ({ caller }) func getTimeSlots() : async [TimeSlot] {
    switch (users.get(caller)) {
      case (?userData) { userData.timeSlots };
      case (null) { Runtime.trap("User not found") };
    };
  };

  // END COMP-DAILY-GOAL-TRACKER
};
