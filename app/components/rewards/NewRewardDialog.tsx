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
import { Textarea } from "@/components/ui/textarea";

interface NewRewardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRewardCreated: (reward: any) => void;
}

export default function NewRewardDialog({
  open,
  onOpenChange,
  onRewardCreated,
}: NewRewardDialogProps) {
  const { addReward } = useDatabase();
  const [rewardName, setRewardName] = useState("");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!rewardName) return;
    
    setIsSubmitting(true);
    
    try {
      const newReward = {
        name: rewardName,
        description,
        cost,
      };
      
      await addReward(newReward);
      onRewardCreated(newReward);
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to add reward:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setRewardName("");
    setDescription("");
    setCost(10);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Reward</DialogTitle>
          <DialogDescription>
            Create a new reward that you can redeem with your points.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reward-name" className="text-right">
              Name
            </Label>
            <Input
              id="reward-name"
              value={rewardName}
              onChange={(e) => setRewardName(e.target.value)}
              className="col-span-3"
              placeholder="e.g., 1 hour of gaming"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="Optional description"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cost" className="text-right">
              Cost
            </Label>
            <Input
              id="cost"
              type="number"
              value={cost}
              onChange={(e) => setCost(Number(e.target.value))}
              className="col-span-3"
              min={1}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!rewardName || cost < 1 || isSubmitting}
          >
            {isSubmitting ? "Adding..." : "Add Reward"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 