import { useState, useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CountdownTimer from './components/CountdownTimer';
import OverviewDashboard from './components/OverviewDashboard';
import MasterPCMChapterSystem from './components/MasterPCMChapterSystem';
import IntelligenceEngine from './components/IntelligenceEngine';
import IntelligentAlerts from './components/IntelligentAlerts';
import { Target, BookOpen, Brain, LogIn, LogOut, Heart, Loader2 } from 'lucide-react';

function App() {
  const { identity, login, clear, isLoggingIn, isInitializing } = useInternetIdentity();
  const [activeTab, setActiveTab] = useState('overview');
  const [isAppInitializing, setIsAppInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  // Touch swipe handling for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;
  const tabs = ['overview', 'chapters', 'intelligence'];

  // Initialize app with comprehensive error logging
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('[App] Initialization started at', new Date().toISOString());
        console.log('[App] isInitializing:', isInitializing);
        console.log('[App] identity:', identity ? 'Present' : 'Not present');
        console.log('[App] isAuthenticated:', isAuthenticated);

        // Wait for Internet Identity to initialize
        if (!isInitializing) {
          console.log('[App] Internet Identity initialization complete');
          setIsAppInitializing(false);
          console.log('[App] App initialization complete - ready to render');
        } else {
          console.log('[App] Still waiting for Internet Identity...');
        }
      } catch (error) {
        console.error('[App] Initialization error:', error);
        console.error('[App] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        setInitError(error instanceof Error ? error.message : 'Unknown initialization error');
        setIsAppInitializing(false);
      }
    };

    initializeApp();
  }, [isInitializing, identity, isAuthenticated]);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    const currentIndex = tabs.indexOf(activeTab);
    
    if (isLeftSwipe && currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
    if (isRightSwipe && currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  // Show loading state during initialization
  if (isAppInitializing || isInitializing) {
    console.log('[App] Rendering loading state');
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-lg text-muted-foreground">Initializing JEE WAR ROOM...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  // Show error state if initialization failed
  if (initError) {
    console.error('[App] Rendering error state:', initError);
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
          <div className="text-center space-y-4 max-w-md">
            <Target className="h-16 w-16 text-destructive mx-auto" />
            <h2 className="text-2xl font-bold text-destructive">Initialization Failed</h2>
            <p className="text-muted-foreground">{initError}</p>
            <Button onClick={() => window.location.reload()}>
              Reload Application
            </Button>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  console.log('[App] Rendering main application');

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <div className="min-h-screen bg-background text-foreground">
        {/* Top Banner */}
        <div className="bg-gradient-to-r from-destructive/20 via-destructive/30 to-destructive/20 border-b border-destructive/50">
          <div className="container mx-auto px-4 py-3 text-center">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-destructive-foreground">
              AIR &lt;150. No excuses.
            </h1>
          </div>
        </div>

        {/* Header */}
        <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <Target className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                <div>
                  <h2 className="text-lg sm:text-xl font-bold">JEE WAR ROOM</h2>
                  <p className="text-xs text-muted-foreground hidden sm:block">Cognitive Performance Edition</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                {isAuthenticated ? (
                  <Button onClick={clear} variant="outline" size="sm" className="min-h-[44px] min-w-[44px] transition-all duration-200">
                    <LogOut className="mr-0 sm:mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </Button>
                ) : (
                  <Button onClick={login} disabled={isLoggingIn} size="lg" className="min-h-[44px] min-w-[44px] transition-all duration-200">
                    <LogIn className="mr-2 h-5 w-5" />
                    {isLoggingIn ? 'Connecting...' : 'Login'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6 sm:py-8">
          {!isAuthenticated ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
              <Target className="h-16 w-16 sm:h-20 sm:w-20 text-primary mb-6" />
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">Welcome to JEE War Room</h2>
              <p className="text-muted-foreground mb-8 max-w-md text-sm sm:text-base">
                Track your preparation, analyze performance, and dominate JEE Advanced 2026.
                Login to access all features.
              </p>
              <Button onClick={login} disabled={isLoggingIn} size="lg" className="min-h-[44px] transition-all duration-200">
                <LogIn className="mr-2 h-5 w-5" />
                {isLoggingIn ? 'Connecting...' : 'Login to Continue'}
              </Button>
            </div>
          ) : (
            <>
              {/* Countdown Timer */}
              <div className="mb-6 sm:mb-8">
                <CountdownTimer />
              </div>

              {/* Main Dashboard */}
              <div
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                  <TabsList className="grid w-full grid-cols-3 gap-1 sm:gap-2 h-auto p-1">
                    <TabsTrigger value="overview" className="gap-1 sm:gap-2 min-h-[44px] text-xs sm:text-sm transition-all duration-200">
                      <Target className="h-4 w-4" />
                      <span>Overview</span>
                    </TabsTrigger>
                    <TabsTrigger value="chapters" className="gap-1 sm:gap-2 min-h-[44px] text-xs sm:text-sm transition-all duration-200">
                      <BookOpen className="h-4 w-4" />
                      <span>Chapters</span>
                    </TabsTrigger>
                    <TabsTrigger value="intelligence" className="gap-1 sm:gap-2 min-h-[44px] text-xs sm:text-sm transition-all duration-200">
                      <Brain className="h-4 w-4" />
                      <span>Intelligence</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                    <OverviewDashboard />
                  </TabsContent>

                  <TabsContent value="chapters" className="space-y-6">
                    <MasterPCMChapterSystem />
                  </TabsContent>

                  <TabsContent value="intelligence" className="space-y-6">
                    <IntelligentAlerts />
                    <IntelligenceEngine />
                  </TabsContent>
                </Tabs>
              </div>
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-border/50 mt-12 py-6">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p className="flex items-center justify-center gap-2">
              Built with <Heart className="h-4 w-4 text-destructive fill-destructive" /> using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  typeof window !== 'undefined' ? window.location.hostname : 'jee-war-room'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline transition-all duration-200"
              >
                caffeine.ai
              </a>
            </p>
            <p className="mt-2">© {new Date().getFullYear()} JEE War Room. All rights reserved.</p>
          </div>
        </footer>
      </div>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
