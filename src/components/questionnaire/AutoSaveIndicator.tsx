import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface AutoSaveIndicatorProps {
  lastSaved: Date | null;
  isSaving: boolean;
}

export function AutoSaveIndicator({ lastSaved, isSaving }: AutoSaveIndicatorProps) {
  if (!lastSaved) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in">
      <Card className="px-3 py-2 bg-card/95 backdrop-blur-sm border-border shadow-lg">
        <p className="text-xs text-muted-foreground flex items-center gap-2">
          {isSaving ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Saved {new Date(lastSaved).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </>
          )}
        </p>
      </Card>
    </div>
  );
}
