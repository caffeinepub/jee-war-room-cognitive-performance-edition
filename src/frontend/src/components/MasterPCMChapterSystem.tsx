import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGetAllChapters, useAddChapter, useToggleChapterCompletion, useRegisterUser } from '../hooks/useQueries';
import { BookOpen, Plus, Check, X, Edit, Trash2 } from 'lucide-react';
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
    
    // Note: Backend doesn't support updateChapter yet
    toast.error('Edit functionality requires backend support. Please add updateChapter method to backend.');
    setIsEditDialogOpen(false);
  };

  const handleDeleteChapter = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedChapter) return;
    
    // Note: Backend doesn't support deleteChapter yet
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

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'Critical':
        return 'bg-destructive text-destructive-foreground';
      case 'High':
        return 'bg-chart-4 text-white';
      case 'Medium':
        return 'bg-chart-1 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Hard':
        return 'bg-destructive/20 text-destructive-foreground border-destructive';
      case 'Medium':
        return 'bg-chart-1/20 text-chart-1 border-chart-1';
      default:
        return 'bg-chart-2/20 text-chart-2 border-chart-2';
    }
  };

  const groupedChapters = chapters?.reduce((acc, chapter) => {
    if (!acc[chapter.subject]) {
      acc[chapter.subject] = [];
    }
    acc[chapter.subject].push(chapter);
    return acc;
  }, {} as Record<string, typeof chapters>);

  // Calculate completion percentage
  const totalChapters = chapters?.length || 0;
  const completedChapters = chapters?.filter(ch => ch.isComplete).length || 0;
  const completionPercentage = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Master PCM Chapter System</CardTitle>
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
            <BookOpen className="h-5 w-5" />
            Master PCM Chapter System
          </span>
          <div className="flex items-center gap-3">
            <div className="text-sm">
              <span className="text-muted-foreground">Completion: </span>
              <span className="font-bold text-primary">{completionPercentage}%</span>
              <span className="text-muted-foreground ml-1">({completedChapters}/{totalChapters})</span>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="min-h-[44px] min-w-[44px] transition-all duration-200">
                  <Plus className="h-4 w-4 mr-0 sm:mr-2" />
                  <span className="hidden sm:inline">Add Chapter</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Chapter</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Chapter Name</Label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Thermodynamics"
                      className="min-h-[44px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Select value={formData.subject} onValueChange={(v) => setFormData({ ...formData, subject: v })}>
                      <SelectTrigger className="min-h-[44px]">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Difficulty</Label>
                      <Select
                        value={formData.difficulty}
                        onValueChange={(v) => setFormData({ ...formData, difficulty: v })}
                      >
                        <SelectTrigger className="min-h-[44px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DIFFICULTIES.map((difficulty) => (
                            <SelectItem key={difficulty} value={difficulty}>
                              {difficulty}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Importance</Label>
                      <Select
                        value={formData.importance}
                        onValueChange={(v) => setFormData({ ...formData, importance: v })}
                      >
                        <SelectTrigger className="min-h-[44px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {IMPORTANCE.map((importance) => (
                            <SelectItem key={importance} value={importance}>
                              {importance}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="min-h-[44px]">
                    Cancel
                  </Button>
                  <Button onClick={handleAddChapter} className="min-h-[44px]">
                    Add Chapter
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="Physics" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 gap-1 h-auto p-1">
            <TabsTrigger value="Physics" className="min-h-[44px] text-xs sm:text-sm transition-all duration-200">
              Physics
            </TabsTrigger>
            <TabsTrigger value="Physical Chemistry" className="min-h-[44px] text-xs sm:text-sm transition-all duration-200">
              Physical
            </TabsTrigger>
            <TabsTrigger value="Organic Chemistry" className="min-h-[44px] text-xs sm:text-sm transition-all duration-200">
              Organic
            </TabsTrigger>
            <TabsTrigger value="Inorganic Chemistry" className="min-h-[44px] text-xs sm:text-sm transition-all duration-200">
              Inorganic
            </TabsTrigger>
            <TabsTrigger value="Mathematics" className="min-h-[44px] text-xs sm:text-sm transition-all duration-200">
              Maths
            </TabsTrigger>
          </TabsList>

          {SUBJECTS.map((subject) => (
            <TabsContent key={subject} value={subject} className="space-y-3 mt-4">
              {groupedChapters?.[subject]?.length === 0 || !groupedChapters?.[subject] ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No chapters added yet for {subject}</p>
                  <p className="text-sm mt-1">Click "Add Chapter" to get started</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {groupedChapters[subject].map((chapter) => (
                    <div
                      key={Number(chapter.id)}
                      className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button
                          onClick={() => handleToggleCompletion(chapter.id)}
                          className="flex-shrink-0 w-6 h-6 rounded border-2 border-primary flex items-center justify-center transition-all duration-200 hover:bg-primary/20 min-h-[44px] min-w-[44px] sm:min-h-[24px] sm:min-w-[24px]"
                        >
                          {chapter.isComplete && <Check className="h-4 w-4 text-primary" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm sm:text-base truncate">{chapter.name}</h4>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <Badge className={getDifficultyColor(chapter.difficulty)} variant="outline">
                              {chapter.difficulty}
                            </Badge>
                            <Badge className={getImportanceColor(chapter.importance)}>
                              {chapter.importance}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditChapter(chapter)}
                          className="min-h-[44px] min-w-[44px] transition-all duration-200"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteChapter(chapter)}
                          className="min-h-[44px] min-w-[44px] text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Chapter</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Chapter Name</Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="min-h-[44px]"
              />
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select value={formData.subject} onValueChange={(v) => setFormData({ ...formData, subject: v })}>
                <SelectTrigger className="min-h-[44px]">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(v) => setFormData({ ...formData, difficulty: v })}
                >
                  <SelectTrigger className="min-h-[44px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTIES.map((difficulty) => (
                      <SelectItem key={difficulty} value={difficulty}>
                        {difficulty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Importance</Label>
                <Select
                  value={formData.importance}
                  onValueChange={(v) => setFormData({ ...formData, importance: v })}
                >
                  <SelectTrigger className="min-h-[44px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {IMPORTANCE.map((importance) => (
                      <SelectItem key={importance} value={importance}>
                        {importance}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="min-h-[44px]">
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="min-h-[44px]">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="max-w-[95vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chapter</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedChapter?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-[44px]">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="min-h-[44px] bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

export default MasterPCMChapterSystem;
