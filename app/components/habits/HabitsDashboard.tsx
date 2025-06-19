"use client";

import { useState, useEffect, useRef } from "react";
import { useDatabase } from "@/app/contexts/DatabaseContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Heart, Brain, Sun, Moon, Utensils, Dumbbell, BookOpen, Code, Play, Activity, DollarSign, X, House } from "lucide-react";
import { toast } from "sonner";
import HabitList from "./HabitList";
import NewHabitDialog from "./NewHabitDialog";
import { activityListPoints } from "@/app/agentConfigs/activity-list-points";
import { Badge } from "@/components/ui/badge";

interface HabitsByCategory {
  [category: string]: any[];
}

// Category icon mapping
const categoryIcons: Record<string, any> = {
  "Mindfulness": Brain,
  "Health": Heart,
  "Fitness": Dumbbell,
  "Nutrition": Utensils,
  "Morning Routine": Sun,
  "Evening Routine": Moon,
  "Learning": BookOpen,
  "Coding": Code,
  "Physical Activity": Dumbbell,
  "Mental-Well-being": Play,
  "Deep Work / Learning": BookOpen,
  "Nutrition & Hydration": Utensils,
  "Chores & Environment": House,
  "Social & Kindness": Play,
  "Sleep Hygiene": Moon,
  "Financial & Admin": DollarSign,
  "Creativity & Play": Play,
  "Negative Point": X,
};

export default function HabitsDashboard() {
  const { getHabits } = useDatabase();
  const [habits, setHabits] = useState<any[]>([]);
  const [isNewHabitDialogOpen, setIsNewHabitDialogOpen] = useState(false);
  const [habitsByCategory, setHabitsByCategory] = useState<HabitsByCategory>({});
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    const userHabits = await getHabits();
    setHabits(userHabits);
    
    // Group habits by category
    const grouped = userHabits.reduce((acc: HabitsByCategory, habit) => {
      if (!acc[habit.category]) {
        acc[habit.category] = [];
      }
      acc[habit.category].push(habit);
      return acc;
    }, {});
    
    setHabitsByCategory(grouped);
  };

  const handleNewHabit = async (newHabit: any) => {
    await loadHabits();
    toast.success("New habit added successfully!");
  };

  // Get unique categories from the activity list
  const categories = activityListPoints.map(routine => routine.name);

  // Filter habits based on search query
  const filteredHabits = habits.filter(habit => 
    habit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    habit.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter habits by selected category and search
  const displayedHabits = selectedCategory === "all" 
    ? filteredHabits 
    : filteredHabits.filter(habit => habit.category === selectedCategory);

  const getIconForCategory = (category: string) => {
    const IconComponent = categoryIcons[category] || Brain;
    return <IconComponent className="h-5 w-5" />;
  };

  return (
    <div className="space-y-6">
      <div className="relative flex flex-row gap-2">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
        <Input 
          placeholder="Search habits..." 
          className="pl-10 placeholder:text-sm" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button 
          onClick={() => setIsNewHabitDialogOpen(true)}
          variant="default"
          size="icon"
        >
          <Plus className="size-4" />
        </Button>
      </div>

      <div className="overflow-x-auto" ref={scrollAreaRef} style={{ scrollbarWidth: 'none' }}>
        <div className="flex space-x-2 pb-2">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setSelectedCategory("all")}
          >
            All
          </Button>
          
          {categories.map(category => (
            <Button 
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className="rounded-full flex items-center gap-2"
              onClick={() => setSelectedCategory(category)}
            >
              {getIconForCategory(category)}
              {category}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {displayedHabits.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">
                {searchQuery 
                  ? "No habits match your search." 
                  : selectedCategory === "all" 
                    ? "You don't have any habits yet." 
                    : `No habits in the ${selectedCategory} category.`
                }
              </p>
              <Button 
                variant="link" 
                onClick={() => setIsNewHabitDialogOpen(true)}
                className="mt-2"
              >
                Add a habit
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {selectedCategory === "all" && !searchQuery && 
              Object.entries(habitsByCategory).map(([category, habits]) => (
                <div key={category} className="space-y-3">
                  <div className="flex items-center gap-2">
                    {getIconForCategory(category)}
                    <h3 className="font-semibold">{category}</h3>
                    <Badge variant="outline">{habits.length}</Badge>
                  </div>
                  <HabitList habits={habits} onHabitsChanged={loadHabits} />
                </div>
              ))
            }
            
            {(selectedCategory !== "all" || searchQuery) && (
              <HabitList habits={displayedHabits} onHabitsChanged={loadHabits} />
            )}
          </div>
        )}
      </div>

      <NewHabitDialog 
        open={isNewHabitDialogOpen} 
        onOpenChange={setIsNewHabitDialogOpen}
        onHabitCreated={handleNewHabit} 
      />
    </div>
  );
} 