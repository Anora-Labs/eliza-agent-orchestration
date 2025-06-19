"use client";

import { useEffect, useState } from "react";
import { useDatabase } from "@/app/contexts/DatabaseContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
// import { ChartBar } from "@phosphor-icons/react/dist/ssr";
// import { ChartLine } from "@phosphor-icons/react/dist/ssr";
import { BarChart } from "lucide-react";

export default function DashboardStats() {
  const { getCompletions, getHabits, getUserData } = useDatabase();
  const [stats, setStats] = useState({
    completedToday: 0,
    totalToday: 0,
    streak: 0,
    progress: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      const habits = await getHabits();
      const userData = await getUserData();
      const completionsToday = await getCompletions(undefined, new Date());
      
      const totalHabits = habits.length;
      const completedHabits = new Set(completionsToday.map(c => c.habitId)).size;
      
      // Calculate progress percentage
      const progress = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;
      
      setStats({
        completedToday: completedHabits,
        totalToday: totalHabits,
        streak: userData?.streakDays || 0,
        progress,
      });
    };
    
    loadStats();
  }, [getCompletions, getHabits]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="py-4 gap-4">
        <CardHeader className="pb-0 px-4">
          <CardTitle className="text-sm font-medium text-muted-foreground">Today's Progress</CardTitle>
        </CardHeader>
        <CardContent className="px-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-2xl font-bold">{stats.completedToday}/{stats.totalToday}</span>
              <span className="text-xs text-muted-foreground">Habits completed</span>
            </div>
            <Progress value={stats.progress} className="w-1/2 h-2" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="py-4 gap-4">
          <CardHeader className="pb-0 px-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Streak</CardTitle>
          </CardHeader>
          <CardContent className="px-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-2xl font-bold">{stats.streak} days</span>
                <span className="text-xs text-muted-foreground">Keep it up!</span>
              </div>
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-8 w-2 rounded-full ${
                      i < stats.streak % 5 ? 'bg-primary' : 'bg-muted'
                    }`} 
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="py-4 gap-4">
          <CardHeader className="pb-0 px-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Weekly Overview</CardTitle>
          </CardHeader>
          <CardContent className="px-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-2xl font-bold">7%</span>
                <span className="text-xs text-muted-foreground">Completion rate</span>
              </div>
              <BarChart className="h-10 w-10 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 