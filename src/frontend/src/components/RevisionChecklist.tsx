import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetAllChapters, useUpdateChapterRevision, useToggleChapterCompletion, useRegisterUser } from '../hooks/useQueries';
import { CheckSquare, Filter, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import type { Chapter } from '../backend';

const SUBJECTS = ['All', 'Physics', 'Chemistry - Physical', 'Chemistry - Organic', 'Chemistry - Inorganic', 'Mathematics'];

function RevisionChecklist() {
  const { data: chapters, isLoading, error } = useGetAllChapters();
  const updateRevision = useUpdateChapterRevision();
  const toggleCompletion = useToggleChapterCompletion();
  const registerUser = useRegisterUser();

  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedChapters, setSelectedChapters] = useState<Set<number>>(new Set());
  const [filterStatus, setFilterStatus] = useState<'all' | 'due' | 'completed'>('all');

  useEffect(() => {
    if (error && error.message.includes('User not found')) {
      registerUser.mutate();
    }
  }, [error]);

  const isRevisionDue = (lastStudied: bigint | undefined) => {
    if (!lastStudied) return true;
    
    const now = Date.now();
    const lastStudiedDate = Number(lastStudied) / 1_000_000;
    const daysSinceStudied = (now - lastStudiedDate) / (1000 * 60 * 60 * 24);
    
    // Spaced repetition: 1, 7, 21 days
    return daysSinceStudied >= 1;
  };

  const getRevisionStatus = (lastStudied: bigint | undefined) => {
    if (!lastStudied) return { status: 'never', color: 'bg-muted text-muted-foreground', label: 'Not studied' };
    
    const now = Date.now();
    const lastStudiedDate = Number(lastStudied) / 1_000_000;
    const daysSinceStudied = (now - lastStudiedDate) / (1000 * 60 * 60 * 24);
    
    if (daysSinceStudied < 1) {
      return { status: 'fresh', color: 'bg-chart-2 text-white', label: 'Fresh' };
    } else if (daysSinceStudied < 7) {
      return { status: 'due-soon', color: 'bg-chart-1 text-white', label: 'Due soon' };
    } else if (daysSinceStudied < 21) {
      return { status: 'due', color: 'bg-chart-4 text-white', label: 'Due' };
    } else {
      return { status: 'overdue', color: 'bg-destructive text-destructive-foreground', label: 'Overdue' };
    }
  };

  const filteredChapters = chapters?.filter((chapter) => {
    const subjectMatch = selectedSubject === 'All' || chapter.subject === selectedSubject;
    
    let statusMatch = true;
    if (filterStatus === 'due') {
      statusMatch = isRevisionDue(chapter.lastStudied);
    } else if (filterStatus === 'completed') {
      statusMatch = !isRevisionDue(chapter.lastStudied);
    }
    
    return subjectMatch && statusMatch;
  });

  const groupedChapters = filteredChapters?.reduce((acc, chapter) => {
    if (!acc[chapter.subject]) {
      acc[chapter.subject] = [];
    }
    acc[chapter.subject].push(chapter);
    return acc;
  }, {} as Record<string, Chapter[]>);

  const handleToggleChapter = (chapterId: number) => {
    const newSelected = new Set(selectedChapters);
    if (newSelected.has(chapterId)) {
      newSelected.delete(chapterId);
    } else {
      newSelected.add(chapterId);
    }
    setSelectedChapters(newSelected);
  };

  const handleToggleAll = (subject: string) => {
    const subjectChapters = groupedChapters?.[subject];
    if (!subjectChapters) return;
    
    const subjectIds = subjectChapters.map(ch => Number(ch.id));
    const allSelected = subjectIds.every(id => selectedChapters.has(id));
    
    const newSelected = new Set(selectedChapters);
    if (allSelected) {
      subjectIds.forEach(id => newSelected.delete(id));
    } else {
      subjectIds.forEach(id => newSelected.add(id));
    }
    setSelectedChapters(newSelected);
  };

  const handleMarkAsRevised = async () => {
    if (selectedChapters.size === 0) {
      toast.error('Please select chapters to mark as revised');
      return;
    }

    try {
      const promises = Array.from(selectedChapters).map(id =>
        updateRevision.mutateAsync(BigInt(id))
      );
      await Promise.all(promises);
      setSelectedChapters(new Set());
      toast.success(`Marked ${selectedChapters.size} chapter(s) as revised`);
    } catch (err) {
      console.error('Failed to update revisions:', err);
    }
  };

  const handleToggleCompletion = async (chapterId: bigint) => {
    try {
      await toggleCompletion.mutateAsync(chapterId);
    } catch (err) {
      console.error('Failed to toggle completion:', err);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revision Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading...</p>
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
            <CheckSquare className="h-5 w-5" />
            Revision Checklist
          </span>
          {selectedChapters.size > 0 && (
            <Button
              onClick={handleMarkAsRevised}
              size="sm"
              className="bg-chart-2 hover:bg-chart-2/90 min-h-[44px] transition-all duration-200"
              disabled={updateRevision.isPending}
            >
              {updateRevision.isPending ? 'Updating...' : `Mark ${selectedChapters.size} as Revised`}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="min-h-[44px]">
                <SelectValue placeholder="Filter by subject" />
              </SelectTrigger>
              <SelectContent>
                {SUBJECTS.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
              <SelectTrigger className="min-h-[44px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Chapters</SelectItem>
                <SelectItem value="due">Due for Revision</SelectItem>
                <SelectItem value="completed">Recently Revised</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {!filteredChapters || filteredChapters.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No chapters found. Add chapters in the Chapters tab!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedChapters || {}).map(([subject, subjectChapters]) => {
              if (!subjectChapters || subjectChapters.length === 0) return null;
              
              return (
                <div key={subject} className="space-y-3">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <h3 className="font-semibold text-base sm:text-lg">{subject}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleAll(subject)}
                      className="min-h-[44px] text-xs sm:text-sm transition-all duration-200"
                    >
                      {subjectChapters.every(ch => selectedChapters.has(Number(ch.id))) ? 'Deselect All' : 'Select All'}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {subjectChapters.map((chapter) => {
                      const revisionStatus = getRevisionStatus(chapter.lastStudied);
                      const chapterId = Number(chapter.id);
                      
                      return (
                        <Card key={chapterId} className="border-l-4 border-l-primary transition-all duration-200 hover:shadow-md">
                          <CardContent className="p-3 sm:p-4">
                            <div className="flex items-start gap-3">
                              <div className="pt-1 flex items-center gap-2">
                                <button
                                  onClick={() => handleToggleCompletion(chapter.id)}
                                  disabled={toggleCompletion.isPending}
                                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md border-2 transition-all duration-200 hover:scale-110"
                                  style={{
                                    borderColor: chapter.isComplete ? 'oklch(var(--chart-2))' : 'oklch(var(--destructive))',
                                    backgroundColor: chapter.isComplete ? 'oklch(var(--chart-2) / 0.1)' : 'oklch(var(--destructive) / 0.1)',
                                  }}
                                >
                                  {chapter.isComplete ? (
                                    <Check className="h-6 w-6 text-chart-2" />
                                  ) : (
                                    <X className="h-6 w-6 text-destructive" />
                                  )}
                                </button>
                              </div>
                              <div className="flex-1 space-y-2 min-w-0">
                                <h4 className="font-medium text-sm sm:text-base">{chapter.name}</h4>
                                <div className="flex flex-wrap gap-2">
                                  <Badge className={revisionStatus.color}>
                                    {revisionStatus.label}
                                  </Badge>
                                  {chapter.lastStudied && (
                                    <Badge variant="outline" className="text-xs">
                                      Last: {new Date(Number(chapter.lastStudied) / 1_000_000).toLocaleDateString()}
                                    </Badge>
                                  )}
                                  <Badge variant="outline" className="text-xs">
                                    {chapter.importance}
                                  </Badge>
                                  {chapter.isComplete && (
                                    <Badge className="bg-chart-2 text-white text-xs">
                                      Completed
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default RevisionChecklist;
