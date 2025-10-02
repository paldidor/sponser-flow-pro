import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar = ({ value, onChange }: SearchBarProps) => {
  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#717182]" />
      <Input
        type="text"
        placeholder="Search teams, sports, or locations..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 min-h-[44px] rounded-lg border-transparent bg-[#F3F3F5] pl-10 pr-10 text-[14px] text-[#0A0A0A] placeholder:text-[#717182] focus-visible:ring-2 focus-visible:ring-[#00AAFE]/30"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
      />
      {value && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange("")}
          className="absolute right-1 top-1/2 h-9 w-9 min-h-[44px] min-w-[44px] -translate-y-1/2 p-0 active:scale-95"
          aria-label="Clear search"
        >
          <X className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
};
