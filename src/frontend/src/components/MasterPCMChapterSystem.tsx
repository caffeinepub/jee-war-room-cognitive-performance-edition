import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, CheckCircle2, Circle, Loader2, Check, X } from 'lucide-react';
import { useGetAllChapters, useAddChapter, useToggleChapterCompletion, useUpdateChapterRevision } from '../hooks/useQueries';
import { toast } from 'sonner';

export default function MasterPCMChapterSystem() {
  const { data: chapters = [], isLoading } = useGetAllChapters();
  const addChapter = useAddChapter();
  const toggleCompletion = useToggleChapterCompletion();
  const updateRevision = useUpdateChapterRevision();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeSubject, setActiveSubject] = useState('Physics');
  const [newChapter, setNewChapter] = useState({
    name: '',
    subject: 'Physics',
    revisionInterval: '7',
    difficulty: 'Medium',
    importance: 'Medium',
  });

  const subjects = [
    'Physics',
    'Physical Chemistry',
    'Organic Chemistry',
    'Inorganic Chemistry',
    'Mathematics',
  ];

  const handleAddChapter = async () => {
    if (!newChapter.name.trim()) {
      toast.error('Chapter name is required');
      return;
    }

    try {
      await addChapter.mutateAsync({
        name: newChapter.name,
        subject: newChapter.subject,
        revisionInterval: BigInt(newChapter.revisionInterval),
        difficulty: newChapter.difficulty,
        importance: newChapter.importance,
      });

      setIsAddModalOpen(false);
      setNewChapter({
        name: '',
        subject: 'Physics',
        revisionInterval: '7',
        difficulty: 'Medium',
        importance: 'Medium',
      });
    } catch (error) {
      console.error('[MasterPCMChapterSystem] Error adding chapter:', error);
    }
  };

  const handleToggleCompletion = async (chapterId: string) => {
    try {
      await toggleCompletion.mutateAsync(BigInt(chapterId));
    } catch (error) {
      console.error('[MasterPCMChapterSystem] Error toggling completion:', error);
    }
  };

  const handleToggleRevisionField = async (
    chapterId: string,
    field: 'theory' | 'pyqs' | 'advanced',
    currentValue: boolean,
    chapter: { theoryCompleted: boolean; pyqsCompleted: boolean; advancedPracticeCompleted: boolean }
  ) => {
    try {
      const updatedFields = {
        theoryCompleted: field === 'theory' ? !currentValue : chapter.theoryCompleted,
        pyqsCompleted: field === 'pyqs' ? !currentValue : chapter.pyqsCompleted,
        advancedPracticeCompleted: field === 'advanced' ? !currentValue : chapter.advancedPracticeCompleted,
      };

      await updateRevision.mutateAsync({
        chapterId: BigInt(chapterId),
        ...updatedFields,
      });
    } catch (error) {
      console.error('[MasterPCMChapterSystem] Error updating revision field:', error);
    }
  };

  const getChaptersBySubject = (subject: string) => {
    return chapters.filter((ch) => ch.subject === subject);
  };

  const calculateRevisionPercentage = (chapter: { theoryCompleted: boolean; pyqsCompleted: boolean; advancedPracticeCompleted: boolean }) => {
    const completedFields = [
      chapter.theoryCompleted,
      chapter.pyqsCompleted,
      chapter.advancedPracticeCompleted,
    ].filter(Boolean).length;
    return Math.round((completedFields / 3) * 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Chapter Button */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogTrigger asChild>
          <Button className="w-full min-h-[44px]">
            <Plus className="mr-2 h-5 w-5" />
            Add New Chapter
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Chapter</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Chapter Name</Label>
              <Input
                id="name"
                value={newChapter.name}
                onChange={(e) => setNewChapter({ ...newChapter, name: e.target.value })}
                placeholder="e.g., Kinematics"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select
                value={newChapter.subject}
                onValueChange={(value) => setNewChapter({ ...newChapter, subject: value })}
              >
                <SelectTrigger id="subject">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select
                value={newChapter.difficulty}
                onValueChange={(value) => setNewChapter({ ...newChapter, difficulty: value })}
              >
                <SelectTrigger id="difficulty">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="importance">Importance</Label>
              <Select
                value={newChapter.importance}
                onValueChange={(value) => setNewChapter({ ...newChapter, importance: value })}
              >
                <SelectTrigger id="importance">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="revisionInterval">Revision Interval (days)</Label>
              <Input
                id="revisionInterval"
                type="number"
                value={newChapter.revisionInterval}
                onChange={(e) => setNewChapter({ ...newChapter, revisionInterval: e.target.value })}
                min="1"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleAddChapter} disabled={addChapter.isPending} className="flex-1">
              {addChapter.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Chapter'
              )}
            </Button>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Subject Tabs */}
      <Tabs value={activeSubject} onValueChange={setActiveSubject}>
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5 gap-1 h-auto p-1">
          {subjects.map((subject) => (
            <TabsTrigger
              key={subject}
              value={subject}
              className="min-h-[44px] text-xs sm:text-sm transition-all duration-200"
            >
              {subject.replace(' Chemistry', '')}
            </TabsTrigger>
          ))}
        </TabsList>

        {subjects.map((subject) => (
          <TabsContent key={subject} value={subject} className="space-y-4">
            {getChaptersBySubject(subject).length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No chapters added yet. Click "Add New Chapter" to get started.
                </CardContent>
              </Card>
            ) : (
              getChaptersBySubject(subject).map((chapter) => {
                const revisionPercentage = calculateRevisionPercentage(chapter);
                return (
                  <Card key={String(chapter.id)} className="transition-all duration-200 hover:border-primary/50">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <CardTitle className="text-base sm:text-lg">{chapter.name}</CardTitle>
                            <Badge variant="outline" className="text-xs">
                              {revisionPercentage}%
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant={chapter.difficulty === 'Hard' ? 'destructive' : 'secondary'}>
                              {chapter.difficulty}
                            </Badge>
                            <Badge variant={chapter.importance === 'High' ? 'default' : 'outline'}>
                              {chapter.importance}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleCompletion(String(chapter.id))}
                          disabled={toggleCompletion.isPending}
                          className="min-h-[44px] min-w-[44px] flex-shrink-0"
                        >
                          {chapter.isComplete ? (
                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                          ) : (
                            <Circle className="h-6 w-6 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm text-muted-foreground mb-2">Revision Tracking</div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {/* Theory Toggle */}
                          <Button
                            variant="outline"
                            onClick={() =>
                              handleToggleRevisionField(
                                String(chapter.id),
                                'theory',
                                chapter.theoryCompleted,
                                chapter
                              )
                            }
                            disabled={updateRevision.isPending}
                            className={`min-h-[44px] flex items-center justify-between px-4 transition-all duration-200 ${
                              chapter.theoryCompleted
                                ? 'bg-green-500/10 border-green-500/50 hover:bg-green-500/20'
                                : 'bg-red-500/10 border-red-500/50 hover:bg-red-500/20'
                            }`}
                          >
                            <span className="text-sm font-medium">Theory</span>
                            {chapter.theoryCompleted ? (
                              <Check className="h-5 w-5 text-green-500" />
                            ) : (
                              <X className="h-5 w-5 text-red-500" />
                            )}
                          </Button>

                          {/* PYQs Toggle */}
                          <Button
                            variant="outline"
                            onClick={() =>
                              handleToggleRevisionField(
                                String(chapter.id),
                                'pyqs',
                                chapter.pyqsCompleted,
                                chapter
                              )
                            }
                            disabled={updateRevision.isPending}
                            className={`min-h-[44px] flex items-center justify-between px-4 transition-all duration-200 ${
                              chapter.pyqsCompleted
                                ? 'bg-green-500/10 border-green-500/50 hover:bg-green-500/20'
                                : 'bg-red-500/10 border-red-500/50 hover:bg-red-500/20'
                            }`}
                          >
                            <span className="text-sm font-medium">PYQs</span>
                            {chapter.pyqsCompleted ? (
                              <Check className="h-5 w-5 text-green-500" />
                            ) : (
                              <X className="h-5 w-5 text-red-500" />
                            )}
                          </Button>

                          {/* Advanced Practice Toggle */}
                          <Button
                            variant="outline"
                            onClick={() =>
                              handleToggleRevisionField(
                                String(chapter.id),
                                'advanced',
                                chapter.advancedPracticeCompleted,
                                chapter
                              )
                            }
                            disabled={updateRevision.isPending}
                            className={`min-h-[44px] flex items-center justify-between px-4 transition-all duration-200 ${
                              chapter.advancedPracticeCompleted
                                ? 'bg-green-500/10 border-green-500/50 hover:bg-green-500/20'
                                : 'bg-red-500/10 border-red-500/50 hover:bg-red-500/20'
                            }`}
                          >
                            <span className="text-sm font-medium">Advanced</span>
                            {chapter.advancedPracticeCompleted ? (
                              <Check className="h-5 w-5 text-green-500" />
                            ) : (
                              <X className="h-5 w-5 text-red-500" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
