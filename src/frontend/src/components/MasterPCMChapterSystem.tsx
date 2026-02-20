import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGetAllChapters, useAddChapter, useToggleChapterCompletion, useRegisterUser, useUpdateChapterRevision } from '../hooks/useQueries';
import { BookOpen, Plus, Check, X, Edit, Trash2, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import type { Chapter } from '../backend';

const SUBJECTS = ['Physics', 'Physical Chemistry', 'Organic Chemistry', 'Inorganic Chemistry', 'Mathematics'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const IMPORTANCE = ['Low', 'Medium', 'High', 'Critical'];

function MasterPCMChapterSystem() {
  const { data: chapters, isLoading, error } = useGetAllChapters();
  const addChapter = useAddChapter();
  const toggleCompletion = useToggleChapterCompletion();
  const updateRevision = useUpdateChapterRevision();
  const registerUser = useRegisterUser();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    subject: SUBJECTS[0],
    difficulty: DIFFICULTIES[1],
    importance: IMPORTANCE[2],
    revisionInterval: '7',
  });

  useEffect(() => {
    if (error && error.message.includes('User not found')) {
      registerUser.mutate();
    }
  }, [error]);

  const handleAddChapter = async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a chapter name');
      return;
    }

    try {
      await addChapter.mutateAsync({
        name: formData.name,
        subject: formData.subject,
        revisionInterval: BigInt(formData.revisionInterval),
        difficulty: formData.difficulty,
        importance: formData.importance,
      });
      setIsAddDialogOpen(false);
      setFormData({
        name: '',
        subject: SUBJECTS[0],
        difficulty: DIFFICULTIES[1],
        importance: IMPORTANCE[2],
        revisionInterval: '7',
      });
    } catch (err) {
      console.error('Failed to add chapter:', err);
    }
  };

  const handleEditChapter = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setFormData({
      name: chapter.name,
      subject: chapter.subject,
      difficulty: chapter.difficulty,
      importance: chapter.importance,
      revisionInterval: chapter.revisionInterval.toString(),
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedChapter) return;
    
    toast.error('Edit functionality requires backend support. Please add updateChapter method to backend.');
    setIsEditDialogOpen(false);
  };

  const handleDeleteChapter = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedChapter) return;
    
    toast.error('Delete functionality requires backend support. Please add deleteChapter method to backend.');
    setIsDeleteDialogOpen(false);
  };

  const handleToggleCompletion = async (chapterId: bigint) => {
    try {
      await toggleCompletion.mutateAsync(chapterId);
    } catch (err) {
      console.error('Failed to toggle completion:', err);
    }
  };

  const handleToggleRevision = async (chapterId: bigint, field: 'theory' | 'pyqs' | 'advanced') => {
    try {
      await updateRevision.mutateAsync({ chapterId, field });
    } catch (err) {
      console.error('Failed to toggle revision:', err);
    }
  };

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

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'Critical':
        return 'bg-destructive text-destructive-foreground';
      case 'High':
        return 'bg-chart-4 text-white';
      case 'Medium':
        return 'bg-chart-3 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Hard':
        return 'bg-destructive text-destructive-foreground';
      case 'Medium':
        return 'bg-chart-4 text-white';
      default:
        return 'bg-chart-2 text-white';
    }
  };

  const [activeSubject, setActiveSubject] = useState('All');
  const subjectTabs = ['All', ...SUBJECTS];

  const filteredChapters = chapters?.filter(ch => 
    activeSubject === 'All' || ch?.subject === activeSubject
  ) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading chapters...</p>
        </div>
      </div>
    );
  }

  if (!chapters || chapters.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Master PCM Chapter System
            </span>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="min-h-[44px] min-w-[44px]">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Chapter
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Chapter</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Chapter Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Thermodynamics"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Select value={formData.subject} onValueChange={(value) => setFormData({ ...formData, subject: value })}>
                      <SelectTrigger id="subject">
                        <SelectValue />
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Difficulty</Label>
                      <Select value={formData.difficulty} onValueChange={(value) => setFormData({ ...formData, difficulty: value })}>
                        <SelectTrigger id="difficulty">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DIFFICULTIES.map((diff) => (
                            <SelectItem key={diff} value={diff}>
                              {diff}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="importance">Importance</Label>
                      <Select value={formData.importance} onValueChange={(value) => setFormData({ ...formData, importance: value })}>
                        <SelectTrigger id="importance">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {IMPORTANCE.map((imp) => (
                            <SelectItem key={imp} value={imp}>
                              {imp}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddChapter} disabled={addChapter.isPending}>
                    {addChapter.isPending ? 'Adding...' : 'Add Chapter'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No chapters added yet</p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Chapter
            </Button>
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
            <BookOpen className="h-5 w-5" />
            Master PCM Chapter System
          </span>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="min-h-[44px] min-w-[44px]">
                <Plus className="mr-2 h-4 w-4" />
                Add Chapter
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Chapter</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Chapter Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Thermodynamics"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Select value={formData.subject} onValueChange={(value) => setFormData({ ...formData, subject: value })}>
                    <SelectTrigger id="subject">
                      <SelectValue />
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select value={formData.difficulty} onValueChange={(value) => setFormData({ ...formData, difficulty: value })}>
                      <SelectTrigger id="difficulty">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DIFFICULTIES.map((diff) => (
                          <SelectItem key={diff} value={diff}>
                            {diff}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="importance">Importance</Label>
                    <Select value={formData.importance} onValueChange={(value) => setFormData({ ...formData, importance: value })}>
                      <SelectTrigger id="importance">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {IMPORTANCE.map((imp) => (
                          <SelectItem key={imp} value={imp}>
                            {imp}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddChapter} disabled={addChapter.isPending}>
                  {addChapter.isPending ? 'Adding...' : 'Add Chapter'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeSubject} onValueChange={setActiveSubject} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 gap-1 h-auto p-1">
            {subjectTabs.map((subject) => (
              <TabsTrigger
                key={subject}
                value={subject}
                className="text-xs sm:text-sm min-h-[44px] transition-all duration-200"
              >
                {subject}
              </TabsTrigger>
            ))}
          </TabsList>

          {subjectTabs.map((subject) => (
            <TabsContent key={subject} value={subject} className="space-y-4">
              {filteredChapters.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No chapters in {subject === 'All' ? 'any subject' : subject}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredChapters.map((chapter) => (
                    <Card key={Number(chapter.id)} className="border-border/50 transition-all duration-200 hover:border-primary/50">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-base sm:text-lg truncate">{chapter.name}</h3>
                              <p className="text-sm text-muted-foreground">{chapter.subject}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Button
                                size="sm"
                                variant={chapter.isComplete ? 'default' : 'outline'}
                                onClick={() => handleToggleCompletion(chapter.id)}
                                className="min-h-[44px] min-w-[44px]"
                              >
                                {chapter.isComplete ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <X className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Badge className={getDifficultyColor(chapter.difficulty)}>
                              {chapter.difficulty}
                            </Badge>
                            <Badge className={getImportanceColor(chapter.importance)}>
                              {chapter.importance}
                            </Badge>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Revision Coverage</span>
                              <span className="font-semibold text-primary">
                                {calculateChapterRevision(chapter)}%
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <Button
                                size="sm"
                                variant={chapter.theoryCompleted ? 'default' : 'outline'}
                                onClick={() => handleToggleRevision(chapter.id, 'theory')}
                                className="min-h-[44px] text-xs"
                              >
                                {chapter.theoryCompleted ? (
                                  <CheckCircle2 className="mr-1 h-3 w-3" />
                                ) : (
                                  <XCircle className="mr-1 h-3 w-3" />
                                )}
                                Theory
                              </Button>
                              <Button
                                size="sm"
                                variant={chapter.pyqsCompleted ? 'default' : 'outline'}
                                onClick={() => handleToggleRevision(chapter.id, 'pyqs')}
                                className="min-h-[44px] text-xs"
                              >
                                {chapter.pyqsCompleted ? (
                                  <CheckCircle2 className="mr-1 h-3 w-3" />
                                ) : (
                                  <XCircle className="mr-1 h-3 w-3" />
                                )}
                                PYQs
                              </Button>
                              <Button
                                size="sm"
                                variant={chapter.advancedPracticeCompleted ? 'default' : 'outline'}
                                onClick={() => handleToggleRevision(chapter.id, 'advanced')}
                                className="min-h-[44px] text-xs"
                              >
                                {chapter.advancedPracticeCompleted ? (
                                  <CheckCircle2 className="mr-1 h-3 w-3" />
                                ) : (
                                  <XCircle className="mr-1 h-3 w-3" />
                                )}
                                Advanced
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default MasterPCMChapterSystem;
