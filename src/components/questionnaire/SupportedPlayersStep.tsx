import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, UsersRound, Calendar, Trophy, Award, TrendingUp } from "lucide-react";

interface SupportedPlayersStepProps {
  initialPlayers?: number;
  initialAttendance?: number;
  initialSessions?: string;
  initialGames?: number;
  onValueChange: (data: {
    players: number;
    attendance?: number;
    sessions: string;
    games: number;
  }) => void;
  onValidityChange: (isValid: boolean) => void;
}

const SupportedPlayersStep = ({ 
  initialPlayers, 
  initialAttendance, 
  initialSessions, 
  initialGames, 
  onValueChange, 
  onValidityChange 
}: SupportedPlayersStepProps) => {
  const [players, setPlayers] = useState(initialPlayers?.toString() || "");
  const [attendance, setAttendance] = useState(initialAttendance?.toString() || "");
  const [sessions, setSessions] = useState(initialSessions || "3-4");
  const [games, setGames] = useState(initialGames?.toString() || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const numericPlayers = parseInt(players);
    const numericAttendance = attendance ? parseInt(attendance) : undefined;
    const numericGames = parseInt(games);
    
    const newErrors: Record<string, string> = {};

    // Validate players
    if (players !== "" && (isNaN(numericPlayers) || numericPlayers <= 0)) {
      newErrors.players = "Please enter a valid number of players";
    }

    // Validate attendance (optional, but if provided must be >= players)
    if (attendance !== "" && numericAttendance !== undefined) {
      if (isNaN(numericAttendance) || numericAttendance < 0) {
        newErrors.attendance = "Please enter a valid attendance number";
      } else if (numericPlayers > 0 && numericAttendance < numericPlayers) {
        newErrors.attendance = "Attendance should be at least equal to number of players";
      }
    }

    // Validate games
    if (games !== "" && (isNaN(numericGames) || numericGames <= 0 || numericGames > 100)) {
      newErrors.games = "Please enter a valid number of games (1-100)";
    }

    setErrors(newErrors);

    // Overall validity: players, sessions, and games must be valid
    const isValid = 
      players !== "" && 
      !isNaN(numericPlayers) && 
      numericPlayers > 0 &&
      sessions !== "" &&
      games !== "" &&
      !isNaN(numericGames) &&
      numericGames > 0 &&
      numericGames <= 100 &&
      Object.keys(newErrors).length === 0;

    onValidityChange(isValid);
    
    if (isValid) {
      onValueChange({
        players: numericPlayers,
        attendance: numericAttendance,
        sessions,
        games: numericGames
      });
    }
  }, [players, attendance, sessions, games, onValueChange, onValidityChange]);

  const getSessionsMultiplier = (sessions: string): number => {
    if (sessions === "1-2") return 1.5;
    if (sessions === "3-4") return 3.5;
    return 5.5; // "5+"
  };

  const calculateTotalImpressions = (): number => {
    const numPlayers = parseInt(players) || 0;
    const numAttendance = parseInt(attendance) || 0;
    const numGames = parseInt(games) || 0;
    
    // Direct family reach: players × 4
    const familyReach = numPlayers * 4;
    
    // Game reach: attendance × games (if attendance provided, otherwise use family reach)
    const gameReach = numAttendance > 0 ? numAttendance * numGames : familyReach * numGames;
    
    // Training engagement: players × sessions multiplier × 16 weeks
    const trainingEngagement = numPlayers * getSessionsMultiplier(sessions) * 16;
    
    return Math.round(gameReach + trainingEngagement);
  };

  const calculatePerGameReach = (): number => {
    const numAttendance = parseInt(attendance) || 0;
    const numPlayers = parseInt(players) || 0;
    return numAttendance > 0 ? numAttendance : numPlayers * 4;
  };

  const calculateWeeklyEngagement = (): number => {
    const numPlayers = parseInt(players) || 0;
    return Math.round(numPlayers * getSessionsMultiplier(sessions));
  };

  const isAllFieldsValid = () => {
    const numPlayers = parseInt(players) || 0;
    const numGames = parseInt(games) || 0;
    return numPlayers > 0 && sessions && numGames > 0 && Object.keys(errors).length === 0;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-3">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Team Reach & Engagement</h1>
        </div>
        <p className="text-base sm:text-lg text-muted-foreground">
          Help sponsors understand your total impact and audience reach
        </p>
      </div>

      <Card className="p-6 sm:p-8 space-y-6">
        {/* Players Input */}
        <div className="space-y-2">
          <label htmlFor="players" className="text-sm font-medium text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Total Number of Players
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="players"
              type="text"
              inputMode="numeric"
              value={players}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, "");
                setPlayers(value);
              }}
              placeholder="e.g., 25"
              className={`pl-10 h-12 transition-all ${
                errors.players ? "border-destructive" : players ? "border-primary" : ""
              }`}
              autoFocus
            />
          </div>
          {errors.players && (
            <div className="flex items-start gap-2 text-sm text-destructive animate-fade-in">
              <span className="mt-0.5">⚠️</span>
              <p>{errors.players}</p>
            </div>
          )}
        </div>

        {/* Game Attendance Input */}
        <div className="space-y-2">
          <label htmlFor="attendance" className="text-sm font-medium text-foreground flex items-center gap-2">
            <UsersRound className="w-4 h-4 text-primary" />
            Average Game Attendance <span className="text-muted-foreground text-xs">(Optional)</span>
          </label>
          <div className="relative">
            <UsersRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="attendance"
              type="text"
              inputMode="numeric"
              value={attendance}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, "");
                setAttendance(value);
              }}
              placeholder="e.g., 150"
              className={`pl-10 h-12 transition-all ${
                errors.attendance ? "border-destructive" : attendance ? "border-primary" : ""
              }`}
            />
          </div>
          <p className="text-xs text-muted-foreground">Include families, friends, and fans</p>
          {errors.attendance && (
            <div className="flex items-start gap-2 text-sm text-destructive animate-fade-in">
              <span className="mt-0.5">⚠️</span>
              <p>{errors.attendance}</p>
            </div>
          )}
        </div>

        {/* Training Sessions Dropdown */}
        <div className="space-y-2">
          <label htmlFor="sessions" className="text-sm font-medium text-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Weekly Training Sessions
          </label>
          <Select value={sessions} onValueChange={setSessions}>
            <SelectTrigger 
              id="sessions" 
              className={`h-12 transition-all ${sessions ? "border-primary" : ""}`}
            >
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Select training frequency" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-2">1-2 sessions per week</SelectItem>
              <SelectItem value="3-4">3-4 sessions per week</SelectItem>
              <SelectItem value="5+">5+ sessions per week</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Number of Games Input */}
        <div className="space-y-2">
          <label htmlFor="games" className="text-sm font-medium text-foreground flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary" />
            Number of Games per Season
          </label>
          <div className="relative">
            <Trophy className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="games"
              type="text"
              inputMode="numeric"
              value={games}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, "");
                setGames(value);
              }}
              placeholder="e.g., 20"
              className={`pl-10 h-12 transition-all ${
                errors.games ? "border-destructive" : games ? "border-primary" : ""
              }`}
            />
          </div>
          <p className="text-xs text-muted-foreground">Total games in the season</p>
          {errors.games && (
            <div className="flex items-start gap-2 text-sm text-destructive animate-fade-in">
              <span className="mt-0.5">⚠️</span>
              <p>{errors.games}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Calculated Reach Metrics */}
      {isAllFieldsValid() && (
        <Card className="p-6 sm:p-8 space-y-4 animate-fade-in bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Your Sponsorship Reach</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-background/80 backdrop-blur rounded-lg p-4 space-y-1">
              <p className="text-xs text-muted-foreground">Total Season Impressions</p>
              <p className="text-2xl font-bold text-primary">{calculateTotalImpressions().toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Games + Training</p>
            </div>
            
            <div className="bg-background/80 backdrop-blur rounded-lg p-4 space-y-1">
              <p className="text-xs text-muted-foreground">Per-Game Reach</p>
              <p className="text-2xl font-bold text-foreground">{calculatePerGameReach().toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Average audience</p>
            </div>
            
            <div className="bg-background/80 backdrop-blur rounded-lg p-4 space-y-1">
              <p className="text-xs text-muted-foreground">Weekly Engagement</p>
              <p className="text-2xl font-bold text-foreground">{calculateWeeklyEngagement().toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{sessions} sessions</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-950 rounded-lg p-3 mt-4">
            <Award className="w-4 h-4 flex-shrink-0" />
            <span>Strong engagement metrics make your team attractive to sponsors!</span>
          </div>
        </Card>
      )}

      {/* Pro Tip Card */}
      <Card className="p-4 bg-secondary/30 border-secondary">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-secondary-foreground flex items-center gap-2">💡 Pro Tip: Accurate Reach Calculation</p>
          <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
            <li>Include <strong>ALL spectators</strong>: families, friends, community members</li>
            <li>Count regular season + tournament games</li>
            <li>Training sessions build consistent brand exposure</li>
            <li>Higher engagement = more valuable sponsorship opportunity</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default SupportedPlayersStep;
