import { useState } from 'react';
import { useGetAllChapters, useToggleChapterCompletion, useRegisterUser } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, BookOpen, Loader2 } from 'lucide-react';
import { useEffect } from 'react';

export default function RevisionChecklist() {
  const { data: chapters = [], isLoading, error } = useGetAllChapters();
  const toggleCompletion = useToggleChapterCompletion();
  const registerUser = useRegisterUser();
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (error && error.message.includes('User not found')) {
      registerUser.mutate();
    }
  }, [error]);

  const filteredChapters = chapters.filter((chapter) => {
    const matchesSubject = subjectFilter === 'all' || chapter.subject === subjectFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'complete' && chapter.isComplete) ||
      (statusFilter === 'incomplete' && !chapter.isComplete);
    return matchesSubject && matchesStatus;
  });

  const handleToggleCompletion = async (chapterId: bigint) => {
    try {
      await toggleCompletion.mutateAsync(chapterId);
    } catch (error) {
      console.error('Failed to toggle chapter completion:', error);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Revision Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <BookOpen className="h-5 w-5" />
          Revision Checklist
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Subject</label>
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="bg-background text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                <SelectItem value="Physics">Physics</SelectItem>
                <SelectItem value="Chemistry">Chemistry</SelectItem>
                <SelectItem value="Maths">Maths</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-background text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
                <SelectItem value="incomplete">Incomplete</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Chapter List */}
        {filteredChapters.length === 0 ? (
          <div className="py-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-sm text-muted-foreground">No chapters found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredChapters.map((chapter) => {
              const revisionComplete =
                chapter.theoryCompleted && chapter.pyqsCompleted && chapter.advancedPracticeCompleted;

              return (
                <div
                  key={Number(chapter.id)}
                  className={`group rounded-lg border p-4 transition-all ${
                    chapter.isComplete
                      ? 'border-green-500/30 bg-green-500/5'
                      : 'border-border bg-muted/30 hover:border-blue-500/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{chapter.name}</h3>
                        <Badge
                          variant="outline"
                          className={`${
                            chapter.subject === 'Physics'
                              ? 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                              : chapter.subject === 'Chemistry'
                                ? 'border-green-500/30 bg-green-500/10 text-green-400'
                                : 'border-orange-500/30 bg-orange-500/10 text-orange-400'
                          }`}
                        >
                          {chapter.subject}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          {chapter.theoryCompleted ? (
                            <CheckCircle2 className="h-3 w-3 text-green-400" />
                          ) : (
                            <XCircle className="h-3 w-3 text-red-400" />
                          )}
                          Theory
                        </span>
                        <span className="flex items-center gap-1">
                          {chapter.pyqsCompleted ? (
                            <CheckCircle2 className="h-3 w-3 text-green-400" />
                          ) : (
                            <XCircle className="h-3 w-3 text-red-400" />
                          )}
                          PYQs
                        </span>
                        <span className="flex items-center gap-1">
                          {chapter.advancedPracticeCompleted ? (
                            <CheckCircle2 className="h-3 w-3 text-green-400" />
                          ) : (
                            <XCircle className="h-3 w-3 text-red-400" />
                          )}
                          Advanced
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleCompletion(chapter.id)}
                      disabled={toggleCompletion.isPending}
                      className="flex h-11 w-11 min-w-[44px] items-center justify-center rounded-lg transition-all hover:bg-muted"
                    >
                      {chapter.isComplete ? (
                        <CheckCircle2 className="h-6 w-6 text-green-400" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-400" />
                      )}
                    </button>
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
