"use client";

import { useState } from "react";
import { useDatabase } from "@/app/contexts/DatabaseContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tag, Gift, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface RewardsListProps {
  rewards: any[];
  onRewardsChanged: () => void;
}

export default function RewardsList({ rewards, onRewardsChanged }: RewardsListProps) {
  const { redeemReward, userPoints } = useDatabase();
  const [redeemingReward, setRedeemingReward] = useState<string | null>(null);
  const [selectedReward, setSelectedReward] = useState<any | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleRedeemReward = async (rewardId: string) => {
    // Set redeeming state
    setRedeemingReward(rewardId);
    
    try {
      const result = await redeemReward(rewardId);
      
      if (result) {
        toast.success("Reward redeemed successfully!");
        onRewardsChanged();
      } else {
        toast.error("You don't have enough points to redeem this reward.");
      }
    } catch (error) {
      toast.error("Failed to redeem reward. Please try again.");
    } finally {
      setRedeemingReward(null);
    }
  };

  const openConfirmDialog = (reward: any) => {
    setSelectedReward(reward);
    setIsConfirmOpen(true);
  };

  const confirmRedeem = () => {
    if (selectedReward) {
      handleRedeemReward(selectedReward.id);
    }
    setIsConfirmOpen(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {rewards.map(reward => (
        <Card 
          key={reward.id} 
          className="transition-all transform hover:-translate-y-1 py-4 gap-4"
        >
          <CardHeader className="pb-0 px-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              {reward.name}
            </CardTitle>
            <CardDescription>{reward.description}</CardDescription>
          </CardHeader>
          
          <CardFooter className="pt-0 flex justify-between items-center px-4">
            <Badge variant="secondary" className="gap-1 items-center">
              <Tag className="h-3 w-3" />
              <span>{reward.cost} points</span>
            </Badge>
            
            <Button
              variant={userPoints >= reward.cost ? "default" : "outline"}
              size="sm"
              disabled={userPoints < reward.cost || redeemingReward === reward.id}
              onClick={() => openConfirmDialog(reward)}
            >
              {redeemingReward === reward.id ? "Redeeming..." : "Redeem"}
            </Button>
          </CardFooter>
        </Card>
      ))}

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Redeem Reward</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to redeem "{selectedReward?.name}" for {selectedReward?.cost} points?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRedeem}>
              Redeem
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 