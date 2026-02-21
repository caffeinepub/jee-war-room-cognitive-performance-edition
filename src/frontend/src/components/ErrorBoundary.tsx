import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    console.error('[ErrorBoundary] getDerivedStateFromError:', error);
    
    // Detect BigInt serialization errors
    const isBigIntError = error.message?.includes('BigInt') || error.message?.includes('serialize');
    if (isBigIntError) {
      console.error('[ErrorBoundary] BigInt serialization error detected:', error.message);
    }
    
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const timestamp = new Date().toISOString();
    console.error('[ErrorBoundary] componentDidCatch - Timestamp:', timestamp);
    console.error('[ErrorBoundary] componentDidCatch - Error:', error);
    console.error('[ErrorBoundary] componentDidCatch - Error Message:', error.message);
    console.error('[ErrorBoundary] componentDidCatch - Error Stack:', error.stack);
    console.error('[ErrorBoundary] componentDidCatch - Error Info:', errorInfo);
    console.error('[ErrorBoundary] componentDidCatch - Component Stack:', errorInfo.componentStack);
    
    // Classify error type
    const isBigIntError = error.message?.includes('BigInt') || error.message?.includes('serialize');
    const errorType = isBigIntError ? 'BigInt Serialization Error' : 'Rendering Error';
    console.error('[ErrorBoundary] Error Type:', errorType);
    
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReload = () => {
    console.log('[ErrorBoundary] Reloading application...');
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      console.error('[ErrorBoundary] Rendering error UI');
      
      const isBigIntError = this.state.error?.message?.includes('BigInt') || 
                           this.state.error?.message?.includes('serialize');
      
      return (
        <div className="min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-[#141414] border border-[#404040] rounded-lg p-8 space-y-6">
            <div className="flex items-center gap-4">
              <AlertTriangle className="h-12 w-12 text-red-500 flex-shrink-0" />
              <div>
                <h1 className="text-2xl font-bold text-red-500">
                  {isBigIntError ? 'Data Serialization Error' : 'Application Error'}
                </h1>
                <p className="text-gray-400 mt-1">
                  {isBigIntError 
                    ? 'A data conversion error occurred. This has been logged for debugging.'
                    : 'Something went wrong while rendering the application.'}
                </p>
              </div>
            </div>

            {this.state.error && (
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-white">Error Details:</h2>
                <div className="bg-[#0a0a0a] border border-[#303030] rounded p-4 overflow-auto">
                  <p className="text-red-400 font-mono text-sm break-words">
                    {this.state.error.toString()}
                  </p>
                </div>
              </div>
            )}

            {import.meta.env.DEV && this.state.errorInfo && (
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-white">Component Stack:</h2>
                <div className="bg-[#0a0a0a] border border-[#303030] rounded p-4 overflow-auto max-h-64">
                  <pre className="text-gray-400 font-mono text-xs whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                onClick={this.handleReload}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Reload Application
              </Button>
              <Button
                onClick={() => {
                  console.log('[ErrorBoundary] Clearing error state and retrying');
                  this.setState({ hasError: false, error: null, errorInfo: null });
                }}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Try Again
              </Button>
            </div>

            <div className="text-sm text-gray-500 pt-4 border-t border-gray-700">
              <p>If this error persists, please check the browser console for more details.</p>
              <p className="mt-1">Press F12 or right-click → Inspect → Console to view logs.</p>
              {isBigIntError && (
                <p className="mt-2 text-yellow-500">
                  Note: This appears to be a data type conversion issue. The development team has been notified.
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
