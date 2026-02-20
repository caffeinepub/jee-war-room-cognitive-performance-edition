import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetAllChapters, useToggleChapterCompletion, useRegisterUser } from '../hooks/useQueries';
import { CheckSquare, Check, X } from 'lucide-react';
import type { Chapter } from '../backend';

const SUBJECTS = ['All', 'Physics', 'Physical Chemistry', 'Organic Chemistry', 'Inorganic Chemistry', 'Mathematics'];

function RevisionChecklist() {
  const { data: chapters, isLoading, error } = useGetAllChapters();
  const toggleCompletion = useToggleChapterCompletion();
  const registerUser = useRegisterUser();

  const [selectedSubject, setSelectedSubject] = useState('All');
  const [filterStatus, setFilterStatus] = useState<'all' | 'complete' | 'incomplete'>('all');

  useEffect(() => {
    if (error && error.message.includes('User not found')) {
      registerUser.mutate();
    }
  }, [error]);

  const getRevisionStatus = (chapter: Chapter) => {
    const completed = [
      chapter.theoryCompleted,
      chapter.pyqsCompleted,
      chapter.advancedPracticeCompleted,
    ].filter(Boolean).length;
    
    const percentage = Math.round((completed / 3) * 100);
    
    if (percentage === 100) {
      return { status: 'complete', color: 'bg-chart-2 text-white', label: '100% Revised' };
    } else if (percentage >= 66) {
      return { status: 'good', color: 'bg-chart-1 text-white', label: '66% Revised' };
    } else if (percentage >= 33) {
      return { status: 'partial', color: 'bg-chart-4 text-white', label: '33% Revised' };
    } else {
      return { status: 'none', color: 'bg-muted text-muted-foreground', label: 'Not Revised' };
    }
  };

  const filteredChapters = chapters?.filter((chapter) => {
    const subjectMatch = selectedSubject === 'All' || chapter.subject === selectedSubject;
    
    let statusMatch = true;
    if (filterStatus === 'complete') {
      statusMatch = chapter.isComplete;
    } else if (filterStatus === 'incomplete') {
      statusMatch = !chapter.isComplete;
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
        <CardTitle className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5" />
          Revision Checklist
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
                <SelectItem value="complete">Completed</SelectItem>
                <SelectItem value="incomplete">Incomplete</SelectItem>
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
                    <span className="text-sm text-muted-foreground">
                      {subjectChapters.length} chapter{subjectChapters.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {subjectChapters.map((chapter) => {
                      const revisionStatus = getRevisionStatus(chapter);
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
                                  <Badge variant="outline" className="text-xs">
                                    {chapter.importance}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {chapter.difficulty}
                                  </Badge>
                                  {chapter.isComplete && (
                                    <Badge className="bg-chart-2 text-white text-xs">
                                      Completed
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>Theory: {chapter.theoryCompleted ? '✓' : '✗'}</span>
                                  <span>•</span>
                                  <span>PYQs: {chapter.pyqsCompleted ? '✓' : '✗'}</span>
                                  <span>•</span>
                                  <span>Advanced: {chapter.advancedPracticeCompleted ? '✓' : '✗'}</span>
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
