import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGetPerformanceBlocks, useRecordPerformanceBlock, useRegisterUser } from '../hooks/useQueries';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Plus, TrendingUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

const TIME_BLOCKS = [
  { id: 1, label: '7-10 AM', start: 7, end: 10 },
  { id: 2, label: '10-1 PM', start: 10, end: 13 },
  { id: 3, label: '1-4 PM', start: 13, end: 16 },
  { id: 4, label: '4-7 PM', start: 16, end: 19 },
  { id: 5, label: '7-11 PM', start: 19, end: 23 },
];

function PerformanceAnalytics() {
  const { data: blocks, isLoading, error } = useGetPerformanceBlocks();
  const recordBlock = useRecordPerformanceBlock();
  const registerUser = useRegisterUser();
  const [chartData, setChartData] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState('1');
  const [focusScore, setFocusScore] = useState([75]);
  const [productivity, setProductivity] = useState([75]);

  useEffect(() => {
    if (error && error.message.includes('User not found')) {
      registerUser.mutate();
    }
  }, [error]);

  useEffect(() => {
    if (blocks) {
      const blockStats = TIME_BLOCKS.map((timeBlock) => {
        const relevantBlocks = blocks.filter((block) => {
          const blockHour = new Date(Number(block.startTime) / 1000000).getHours();
          return blockHour >= timeBlock.start && blockHour < timeBlock.end;
        });

        const avgFocus =
          relevantBlocks.length > 0
            ? relevantBlocks.reduce((sum, b) => sum + Number(b.focusScore), 0) / relevantBlocks.length
            : 0;

        const avgProductivity =
          relevantBlocks.length > 0
            ? relevantBlocks.reduce((sum, b) => sum + Number(b.productivity), 0) / relevantBlocks.length
            : 0;

        return {
          name: timeBlock.label,
          focus: Math.round(avgFocus),
          productivity: Math.round(avgProductivity),
          sessions: relevantBlocks.length,
        };
      });

      setChartData(blockStats);
    }
  }, [blocks]);

  const handleRecordBlock = async () => {
    const blockInfo = TIME_BLOCKS.find((b) => b.id === parseInt(selectedBlock));
    if (!blockInfo) return;

    const now = Date.now();
    const startTime = BigInt(now * 1000000);
    const endTime = BigInt((now + 3600000) * 1000000); // 1 hour later

    try {
      await recordBlock.mutateAsync({
        startTime,
        endTime,
        focusScore: BigInt(focusScore[0]),
        productivity: BigInt(productivity[0]),
      });
      setIsDialogOpen(false);
      setFocusScore([75]);
      setProductivity([75]);
    } catch (err) {
      console.error('Failed to record block:', err);
    }
  };

  const getBestBlock = () => {
    if (chartData.length === 0) return null;
    return chartData.reduce((best, current) =>
      current.focus + current.productivity > best.focus + best.productivity ? current : best
    );
  };

  const bestBlock = getBestBlock();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance vs Time</CardTitle>
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
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance vs Time
          </span>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Record Session
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Performance Block</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label>Time Block</Label>
                  <Select value={selectedBlock} onValueChange={setSelectedBlock}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_BLOCKS.map((block) => (
                        <SelectItem key={block.id} value={block.id.toString()}>
                          {block.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Focus Score: {focusScore[0]}</Label>
                  <Slider value={focusScore} onValueChange={setFocusScore} max={100} step={5} />
                </div>
                <div className="space-y-2">
                  <Label>Productivity: {productivity[0]}</Label>
                  <Slider value={productivity} onValueChange={setProductivity} max={100} step={5} />
                </div>
                <Button onClick={handleRecordBlock} className="w-full" disabled={recordBlock.isPending}>
                  {recordBlock.isPending ? 'Recording...' : 'Record Block'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="name" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar dataKey="focus" fill="hsl(var(--chart-1))" name="Focus Score" radius={[4, 4, 0, 0]} />
            <Bar dataKey="productivity" fill="hsl(var(--chart-2))" name="Productivity" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        {bestBlock && bestBlock.sessions > 0 && (
          <div className="bg-accent/50 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-chart-2" />
              Productivity Insight
            </h4>
            <p className="text-sm text-muted-foreground">
              Your peak performance is during <span className="font-semibold text-foreground">{bestBlock.name}</span>.
              Schedule your most difficult subjects during this time block for optimal results.
            </p>
          </div>
        )}

        {chartData.every((block) => block.sessions === 0) && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No performance data yet. Start recording your study sessions!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PerformanceAnalytics;
