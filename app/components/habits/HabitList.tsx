"use client";

import { useState, useEffect } from "react";
import { useDatabase } from "@/app/contexts/DatabaseContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface HabitListProps {
  habits: any[];
  onHabitsChanged: () => void;
}

export default function HabitList({ habits, onHabitsChanged }: HabitListProps) {
  const { completeHabit, getCompletions } = useDatabase();
  const [completedHabits, setCompletedHabits] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadCompletedHabits();
  }, [habits]);

  const loadCompletedHabits = async () => {
    const today = new Date();
    const completions = await getCompletions(undefined, today);
    const completedIds = new Set(completions.map(c => c.habitId));
    setCompletedHabits(completedIds);
  };

  const handleCompleteHabit = async (habitId: string) => {
    // If already completed, do nothing
    if (completedHabits.has(habitId)) return;
    
    // Add to loading state
    setLoading(prev => new Set(prev).add(habitId));
    
    try {
      await completeHabit(habitId);
      
      // Update completed habits
      setCompletedHabits(prev => new Set(prev).add(habitId));
      
      // Find habit to get points
      const habit = habits.find(h => h.id === habitId);
      if (habit) {
        toast.success(`+${habit.points} points earned!`);
      }
      
      // Notify parent of change
      onHabitsChanged();
    } catch (error) {
      toast.error("Failed to complete habit. Please try again.");
    } finally {
      // Remove from loading state
      setLoading(prev => {
        const updated = new Set(prev);
        updated.delete(habitId);
        return updated;
      });
    }
  };

  return (
    <div className="space-y-3">
      {habits.map(habit => (
        <Card 
          key={habit.id} 
          className={`transition-all transform hover:-translate-y-1 py-0 ${
            completedHabits.has(habit.id) ? 'bg-primary/10 border-primary/30' : ''
          }`}
        >
          <CardContent className="p-4 flex justify-between items-center">
            <div className="flex flex-col">
              <h3 className="font-medium">{habit.name}</h3>
              <div className="flex space-x-2 items-center mt-1">
                <Badge variant="outline" className="bg-muted/50 text-xs">
                  {habit.category}
                </Badge>
                <span className="text-xs text-muted-foreground">{habit.frequency}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="font-semibold">
                {habit.points > 1 ? `${habit.points} pts` : `${habit.points} pt`}
              </Badge>
              
              <Button
                variant="ghost"
                size="icon"
                disabled={completedHabits.has(habit.id) || loading.has(habit.id)}
                onClick={() => handleCompleteHabit(habit.id)}
                className={`rounded-full h-8 w-8 ${
                  completedHabits.has(habit.id) ? 'text-primary' : ''
                }`}
              >
                {completedHabits.has(habit.id) ? (
                  <CheckCircle className="h-6 w-6" />
                ) : (
                  <Circle className="h-6 w-6" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 