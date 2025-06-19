"use client";

import { useState } from "react";
import { useDatabase } from "@/app/contexts/DatabaseContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { activityListPoints } from "@/app/agentConfigs/activity-list-points";

interface NewHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onHabitCreated: (habit: any) => void;
}

export default function NewHabitDialog({
  open,
  onOpenChange,
  onHabitCreated,
}: NewHabitDialogProps) {
  const { addHabit } = useDatabase();
  const [habitName, setHabitName] = useState("");
  const [category, setCategory] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">("daily");
  const [points, setPoints] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!habitName || !category) return;
    
    setIsSubmitting(true);
    
    try {
      const newHabit = {
        name: habitName,
        category,
        points,
        frequency,
      };
      
      await addHabit(newHabit);
      onHabitCreated(newHabit);
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to add habit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setHabitName("");
    setCategory("");
    setFrequency("daily");
    setPoints(3);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    
    // Find matching activity to get default points
    const routine = activityListPoints.find(r => r.name === value);
    if (routine && routine.activities.length > 0) {
      // Use the first activity's points as default
      setPoints(routine.activities[0].points);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Habit</DialogTitle>
          <DialogDescription>
            Create a new habit to track and earn points.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="habit-name" className="text-right">
              Name
            </Label>
            <Input
              id="habit-name"
              value={habitName}
              onChange={(e) => setHabitName(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Morning Meditation"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger id="category" className="col-span-3">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {activityListPoints.map((routine) => (
                  <SelectItem key={routine.name} value={routine.name}>
                    {routine.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="frequency" className="text-right">
              Frequency
            </Label>
            <RadioGroup
              id="frequency"
              value={frequency}
              onValueChange={(value) => setFrequency(value as "daily" | "weekly" | "monthly")}
              className="col-span-3 flex space-x-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="daily" id="daily" />
                <Label htmlFor="daily">Daily</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="weekly" id="weekly" />
                <Label htmlFor="weekly">Weekly</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="monthly" id="monthly" />
                <Label htmlFor="monthly">Monthly</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="points" className="text-right">
              Points
            </Label>
            <Input
              id="points"
              type="number"
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
              className="col-span-3"
              min={1}
              max={10}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!habitName || !category || isSubmitting}
          >
            {isSubmitting ? "Adding..." : "Add Habit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 