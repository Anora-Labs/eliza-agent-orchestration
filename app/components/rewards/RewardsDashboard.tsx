"use client";

import { useState, useEffect } from "react";
import { useDatabase } from "@/app/contexts/DatabaseContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import RewardsList from "./RewardsList";
import NewRewardDialog from "./NewRewardDialog";
import { Input } from "@/components/ui/input";

export default function RewardsDashboard() {
  const { getRewards } = useDatabase();
  const [rewards, setRewards] = useState<any[]>([]);
  const [isNewRewardDialogOpen, setIsNewRewardDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    const userRewards = await getRewards();
    setRewards(userRewards);
  };

  const handleNewReward = async (newReward: any) => {
    await loadRewards();
    toast.success("New reward added successfully!");
  };

  // Filter rewards based on search query
  const filteredRewards = rewards.filter(reward =>
    reward.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="relative flex flex-row gap-2">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
        <Input 
          placeholder="Search rewards..." 
          className="pl-10 placeholder:text-sm" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button 
          onClick={() => setIsNewRewardDialogOpen(true)}
          variant="default"
          size="icon"
        >
          <Plus className="size-4" />
        </Button>
      </div>

      {filteredRewards.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              {searchQuery 
                ? "No rewards match your search."
                : "You don't have any rewards yet."
              }
            </p>
            <Button 
              variant="link" 
              onClick={() => setIsNewRewardDialogOpen(true)}
              className="mt-2"
            >
              {searchQuery ? "Add your first reward" : "Add your first reward"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <RewardsList rewards={filteredRewards} onRewardsChanged={loadRewards} />
      )}

      <NewRewardDialog 
        open={isNewRewardDialogOpen} 
        onOpenChange={setIsNewRewardDialogOpen}
        onRewardCreated={handleNewReward} 
      />
    </div>
  );
} 