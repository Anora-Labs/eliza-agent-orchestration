import { X } from "@phosphor-icons/react/dist/ssr"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Plus, Camera } from "@phosphor-icons/react/dist/ssr"
import { WeiDB } from "@/app/types/database"

interface EditProfileDrawerProps {
  isEditDrawerOpen: boolean;
  setIsEditDrawerOpen: (open: boolean) => void;
  editableProfileData: WeiDB['userProfile']['value'];
  setEditableProfileData: (data: WeiDB['userProfile']['value']) => void;
  imagePreview: string;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSaveProfile: () => void;
}


export default function EditProfileDrawer({ 
    isEditDrawerOpen, 
    setIsEditDrawerOpen, 
    editableProfileData, 
    setEditableProfileData,
    imagePreview,
    handleImageChange,
    handleSaveProfile
}: EditProfileDrawerProps) {
  return (
    <Drawer open={isEditDrawerOpen} onOpenChange={setIsEditDrawerOpen}>
        <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
            <DrawerHeader className="text-center items-center flex flex-row justify-between px-2">
            <Button 
                onClick={() => setIsEditDrawerOpen(false)} 
                className=""
                variant="ghost"
                size="icon"
                aria-label="Close"
            >
                <X className="size-4" />
            </Button>
            <DrawerTitle>Edit Profile</DrawerTitle>
            <Button 
                onClick={handleSaveProfile} 
                className=""
                variant="ghost"
                size="icon"
                aria-label="Save"
            >
                <Plus className="size-4" />
            </Button>
            </DrawerHeader>
            
            <div className="p-2 pb-4">
            <div className="flex flex-col items-center mb-4">
                <div className="relative mb-4">
                <Avatar className="h-24 w-24 border-2 border-primary">
                    <AvatarImage 
                    src={imagePreview || editableProfileData.avatarUrl || "/wei-icon.png"} 
                    alt={editableProfileData.name} 
                    />
                    <AvatarFallback>{editableProfileData.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                
                <Label 
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 size-7 bg-primary text-primary-foreground rounded-full cursor-pointer flex items-center justify-center"
                >
                    <Camera className="size-4" />
                    <Input 
                    id="avatar-upload" 
                    type="file" 
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                    />
                </Label>
                </div>
                
                {imagePreview && (
                <p className="text-xs text-primary mb-2">New image selected</p>
                )}
            </div>
            
            <div className="space-y-4">
                <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                    id="name" 
                    value={editableProfileData.name}
                    onChange={(e) => setEditableProfileData({...editableProfileData, name: e.target.value})}
                    className="bg-background"
                />
                </div>
                
                <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                    id="email" 
                    type="email"
                    value={editableProfileData.email}
                    onChange={(e) => setEditableProfileData({...editableProfileData, email: e.target.value})}
                    className="bg-background"
                />
                </div>
                
                <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Input 
                    id="bio" 
                    value={editableProfileData.bio}
                    onChange={(e) => setEditableProfileData({...editableProfileData, bio: e.target.value})}
                    className="bg-background"
                />
                </div>
            </div>
            </div>
        </div>
        </DrawerContent>
    </Drawer>
  )
}