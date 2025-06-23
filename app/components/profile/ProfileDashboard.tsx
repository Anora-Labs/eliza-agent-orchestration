"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent,
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Calendar, PencilLine } from "@phosphor-icons/react/dist/ssr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useDatabase } from "@/app/contexts/DatabaseContext";
import { useUser } from "@/providers/user-provider";
import { toast } from "sonner";
import { WeiDB } from "@/app/types/database";
import EditProfileDrawer from "./EditProfileDrawer";
import { MAX_FILE_SIZE } from "@/lib/config";

interface Activity {
  id: string;
  action: string;
  target: string;
  date: string;
  points: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  earned: boolean;
}

export default function ProfileDashboard() {
  // Use UserProvider for Supabase user data
  const { user, updateUser, isLoading: userLoading } = useUser();
  
  // Use DatabaseContext for habits/rewards data (transitional)
  const { userPoints, getCompletions, getHabits, getUserData, getRewardRedemptions, getRewards } = useDatabase();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  
  // Profile data now comes from Supabase user
  const [profileData, setProfileData] = useState<{
    id: string;
    name: string;
    email: string;
    bio: string;
    avatarUrl: string;
    joinDate: string;
  }>({
    id: 'default',
    name: "User",
    email: "user@example.com", 
    bio: "No bio yet",
    avatarUrl: "",
    joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  });
  
  const [editableProfileData, setEditableProfileData] = useState(profileData);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [completionRate, setCompletionRate] = useState("0%");
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  
  // Load user profile from Supabase user data
  useEffect(() => {
    console.log('ProfileDashboard - Loading user profile from Supabase user data');
    console.log('ProfileDashboard - User object:', user);
    console.log('ProfileDashboard - User loading state:', userLoading);
    
    if (user) {
      const userProfileData = {
        id: user.id,
        name: user.display_name || "User",
        email: user.email,
        bio: "No bio yet", // You can add bio field to Supabase users table later
        avatarUrl: user.profile_image || "",
        joinDate: new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      };
      
      console.log('ProfileDashboard - Setting profile data:', userProfileData);
      setProfileData(userProfileData);
      setEditableProfileData(userProfileData);
    }
  }, [user, userLoading]);
  
  // Load achievements - Define based on real user data
  useEffect(() => {
    const loadAchievements = async () => {
      try {
        const userData = await getUserData();
        const completions = await getCompletions();
        
        // Define achievements based on real user data
        const achievementsList: Achievement[] = [
          { 
            id: 'first_completion', 
            name: "First Step", 
            description: "Complete your first habit", 
            earned: completions.length > 0 
          },
          { 
            id: 'streak_7', 
            name: "Week Warrior", 
            description: "7 day streak", 
            earned: (userData?.streakDays || 0) >= 7 
          },
          { 
            id: 'early_bird', 
            name: "Early Bird", 
            description: "Complete a habit before 8am", 
            earned: completions.some(completion => {
              const completionTime = new Date(completion.completedAt);
              return completionTime.getHours() < 8;
            })
          },
          { 
            id: 'night_owl', 
            name: "Night Owl", 
            description: "Complete a habit after 10pm", 
            earned: completions.some(completion => {
              const completionTime = new Date(completion.completedAt);
              return completionTime.getHours() >= 22;
            })
          }
        ];
        
        setAchievements(achievementsList);
      } catch (error) {
        console.error('Failed to load achievements:', error);
      }
    };
    
    loadAchievements();
  }, [getUserData, getCompletions]);
  
  // Load user stats
  useEffect(() => {
    const loadUserStats = async () => {
      try {
        // Get user's real streak data and general stats
        const userData = await getUserData();
        if (userData) {
          setStreak(userData.streakDays || 0);
        }
        
        // Get user's habit completions for the past week
        const today = new Date();
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(today.getDate() - 7);
        
        // Get habit completions and habits
        const recentCompletions = await getCompletions(undefined, today);
        const allHabits = await getHabits();
        
        // Calculate completion rate using real data
        const totalPossibleCompletions = allHabits.length * 7; // all habits over 7 days
        const actualCompletions = recentCompletions.length;
        const rate = totalPossibleCompletions > 0 
          ? Math.round((actualCompletions / totalPossibleCompletions) * 100) 
          : 0;
        setCompletionRate(`${rate}%`);
        
        // Get reward redemptions and rewards
        const redemptions = await getRewardRedemptions();
        const rewards = await getRewards();
        
        // Combine completions and redemptions into activities
        const completionActivities = recentCompletions.map(completion => {
          const habit = allHabits.find(h => h.id === completion.habitId);
          return {
            id: completion.id,
            action: "Completed",
            target: habit ? habit.name : "Unknown habit",
            date: new Date(completion.completedAt).toLocaleDateString(),
            points: completion.points,
            timestamp: new Date(completion.completedAt).getTime()
          };
        });
        
        const redemptionActivities = redemptions.map((redemption: WeiDB['rewardRedemptions']['value']) => {
          // Find the reward name
          const reward = rewards.find(r => r.id === redemption.rewardId);
          return {
            id: redemption.id,
            action: "Redeemed",
            target: reward ? reward.name : "Reward", 
            date: new Date(redemption.redeemedAt).toLocaleDateString(),
            points: -redemption.cost,
            timestamp: new Date(redemption.redeemedAt).getTime()
          };
        });
        
        // Combine and sort activities by timestamp (newest first)
        const combinedActivities = [...completionActivities, ...redemptionActivities]
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 5) // Get only the 5 most recent
          .map(({ id, action, target, date, points }) => ({ id, action, target, date, points }));
        
        setRecentActivities(combinedActivities);
      } catch (error) {
        console.error("Failed to load user stats:", error);
      }
    };
    
    loadUserStats();
  }, [getCompletions, getHabits, getUserData, getRewardRedemptions, getRewards]);
  
  const handleEditProfile = () => {
    setIsEditDrawerOpen(true);
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file is an image and not too large
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    if (file.size > MAX_FILE_SIZE) { // 5MB limit
      toast.error('Image too large. Please select an image under 5MB');
      return;
    }
    
    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const handleSaveProfile = async () => {
    try {
      // Process the image file if it exists
      let avatarUrl = profileData.avatarUrl;
      if (imageFile) {
        avatarUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(imageFile);
        });
      }
      
      // Create updated profile data for Supabase
      const updatedProfile = {
        display_name: editableProfileData.name,
        profile_image: avatarUrl,
        // Add other fields as needed
      };
      
      // Update profile in Supabase
      await updateUser(updatedProfile);
      
      // Update local state
      setProfileData({
        ...profileData,
        name: editableProfileData.name,
        avatarUrl,
      });
      setIsEditDrawerOpen(false);
      setImageFile(null);
      setImagePreview(null);
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast.error('Failed to update profile');
    }
  };

  // Show loading state
  if (!userLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-20 w-20 bg-gray-300 rounded-full"></div>
          <div className="h-4 bg-gray-300 rounded w-32 mt-2"></div>
        </div>
      </div>
    );
  }

  // Show message if user is not logged in
  if (!user) {
    return (
      <div className="space-y-4">
        <Card className="bg-transparent border-none shadow-none">
          <CardContent className="p-4 text-center">
            <p className="text-muted-foreground">Please log in to view your profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Profile Header - Instagram Style */}
      <Card className="bg-transparent border-none shadow-none flex-col p-0">
        <CardContent className="p-0">
          <div className="flex items-start gap-4">
            {/* Profile Image */}
            <div className="relative">
              <Avatar className="h-20 w-20 border-1 border-foreground">
                <AvatarImage src={profileData.avatarUrl || "/wei-icon.png"} alt={profileData.name} />
                <AvatarFallback>{profileData.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <Button 
                variant="secondary" 
                size="icon" 
                className="absolute bottom-0 right-0 size-6 rounded-full opacity-90"
                onClick={handleEditProfile}
              >
                <PencilLine className="size-3" />
              </Button>
            </div>
            
            {/* Profile Info */}
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h1 className="text-lg font-bold">{profileData.name}</h1>
              </div>
              <p className="text-sm text-muted-foreground">{profileData.email}</p>
              <p className="text-[10px] text-muted-foreground/70">Member since {profileData.joinDate}</p>
              
              {profileData.bio && (
                <p className="mt-2 text-sm">{profileData.bio}</p>
              )}
            </div>
          </div>
          
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="relative flex flex-col items-center text-center p-2 rounded-md border border-border">
              <span className="text-lg font-semibold">{streak}</span>
              <span className="text-xs text-muted-foreground">Day Streak</span>
            </div>
            
            <div className="relative flex flex-col items-center text-center p-2 rounded-md border border-border">
              <span className="text-lg font-semibold">{completionRate}</span>
              <span className="text-xs text-muted-foreground">Completion</span>
            </div>
            
            <div className="relative flex flex-col items-center text-center p-2 rounded-md border border-border">
              <span className="text-lg font-semibold">{userPoints}</span>
              <span className="text-xs text-muted-foreground">Points</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabs for Activity and Achievements */}
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-transparent border-none">
          <TabsTrigger value="overview">Activity</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-2 space-y-4">
          <Card className="py-4 gap-4">
            <CardHeader className="py-0 px-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="size-4" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4">
              <div className="space-y-3">
                {recentActivities.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm">No recent activity found.</p>
                ) : (
                  recentActivities.map((activity) => (
                    <div key={activity.id} className="flex justify-between items-center border-b border-border pb-2 last:border-0 last:pb-0">
                      <div>
                        <p className="text-sm font-medium">{activity.action} {activity.target}</p>
                        <p className="text-xs text-muted-foreground">{activity.date}</p>
                      </div>
                      <Badge variant={activity.points > 0 ? "default" : "destructive"} className="text-xs">
                        {activity.points > 0 ? `+${activity.points}` : activity.points} pts
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="achievements" className="mt-2">
          <div className="grid grid-cols-2 gap-3">
            {achievements.map(achievement => (
              <Card 
                key={achievement.id}
                className={`bg-card p-2 ${achievement.earned ? "" : "opacity-60"}`}
              >
                <CardContent className="relative p-1 flex flex-row items-center text-start gap-2">
                  <div className="space-y-1 flex flex-col items-start">
                    <h3 className="text-sm font-medium flex flex-col items-start gap-1">
                      {achievement.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    {achievement.earned && (
                      <Badge variant="default" className="text-[10px] absolute top-0 right-0">
                        earned
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Edit Profile Drawer */}
      <EditProfileDrawer 
        isEditDrawerOpen={isEditDrawerOpen}
        setIsEditDrawerOpen={setIsEditDrawerOpen}
        editableProfileData={editableProfileData}
        setEditableProfileData={setEditableProfileData}
        imagePreview={imagePreview || ""}
        handleImageChange={handleImageChange}
        handleSaveProfile={handleSaveProfile}
      />
    </div>
  );
} 