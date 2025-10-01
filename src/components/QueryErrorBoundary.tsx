import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface QueryErrorBoundaryProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export const QueryErrorBoundary = ({ error, resetErrorBoundary }: QueryErrorBoundaryProps) => {
  return (
    <div className="p-4 sm:p-6">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Failed to load data</AlertTitle>
        <AlertDescription className="mt-2">
          {error.message || 'An error occurred while loading data'}
        </AlertDescription>
      </Alert>
      <Button 
        onClick={resetErrorBoundary}
        variant="outline"
        className="mt-4"
      >
        Try Again
      </Button>
    </div>
  );
};
