import DashboardLayout from "@/components/layout/DashboardLayout";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, Lock, Camera, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Profile() {
  const { language, user } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const t = (en: string, so: string) => (language === "en" ? en : so);
  
  // Mock teacher data
  const [profile, setProfile] = useState({
    name: "Ahmed Hassan Mohamed",
    email: "ahmed.hassan@darulumah.edu",
    phone: "+252 61 234 5678",
    photoUrl: "",
    subjects: ["Mathematics", "Algebra"],
    employeeId: "TC-2024-015"
  });

  const [isEditing, setIsEditing] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  const handleSaveProfile = () => {
    toast({
      title: t("Success", "Guul"),
      description: t("Profile updated successfully", "Profile waa la cusbooneysiiyay si guul leh"),
    });
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    if (passwords.new !== passwords.confirm) {
      toast({
        title: t("Error", "Qalad"),
        description: t("Passwords do not match", "Furaha sireed ma isma mid aha"),
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: t("Success", "Guul"),
      description: t("Password changed successfully", "Furaha waa la beddelay si guul leh"),
    });
    setPasswords({ current: "", new: "", confirm: "" });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("Back", "Dib u noqo")}
          </Button>
          <div className="flex-1">
            <h2 className="text-3xl font-bold tracking-tight">
              {t("My Profile", "Profile-kayga")} 👤
            </h2>
            <p className="text-muted-foreground mt-1">
              {t("Manage your personal information and settings", "Maamul xogta shakhsiyaadkaaga iyo goobaha")}
            </p>
          </div>
        </div>

        {/* Profile Photo & Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>{t("Profile Information", "Xogta Profile")}</CardTitle>
            <CardDescription>
              {user.role === "admin" 
                ? t("Update your photo and personal details", "Cusboonaysii sawirkaaga iyo faahfaahinta shakhsiyaadka")
                : t("View your personal details", "Eeg faahfaahinta shakhsiyaadkaaga")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Upload - Admin Only */}
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.photoUrl} />
                <AvatarFallback className="text-2xl">
                  {profile.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              {user.role === "admin" && (
                <div className="space-y-2">
                  <Button variant="outline" size="sm">
                    <Camera className="mr-2 h-4 w-4" />
                    {t("Upload Photo", "Soo rar Sawir")}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    {t("JPG, PNG or GIF. Max 2MB", "JPG, PNG ama GIF. Ugu badan 2MB")}
                  </p>
                </div>
              )}
            </div>

            <Separator />

            {/* Profile Fields */}
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">
                  {t("Full Name", "Magaca Buuxa")}
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    disabled={user.role === "teacher" || !isEditing}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">
                  {t("Email Address", "Cinwaanka Email")}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    disabled={user.role === "teacher" || !isEditing}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">
                  {t("Phone Number", "Nambarka Telefoonka")}
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    disabled={user.role === "teacher" || !isEditing}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>{t("Employee ID", "Aqoonsiga Shaqaalaha")}</Label>
                <Input value={profile.employeeId} disabled className="bg-muted" />
              </div>

              <div className="grid gap-2">
                <Label>{t("Subjects", "Maadooyinka")}</Label>
                <Input 
                  value={profile.subjects.join(", ")} 
                  disabled 
                  className="bg-muted" 
                />
              </div>
            </div>

            {user.role === "admin" && (
              <div className="flex gap-2 justify-end">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      {t("Cancel", "Ka noqo")}
                    </Button>
                    <Button onClick={handleSaveProfile}>
                      {t("Save Changes", "Keydi Isbeddelka")}
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    {t("Edit Profile", "Wax ka beddel Profile")}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Change Password - Admin Only */}
        {user.role === "admin" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                {t("Change Password", "Beddel Furaha Sirta")}
              </CardTitle>
              <CardDescription>
                {t("Update your password to keep your account secure", "Cusboonaysii furaha sirta si aad u ilaaliso koontadaada")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="current-password">
                  {t("Current Password", "Furaha Hadda")}
                </Label>
                <Input
                  id="current-password"
                  type="password"
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="new-password">
                  {t("New Password", "Furaha Cusub")}
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirm-password">
                  {t("Confirm New Password", "Xaqiiji Furaha Cusub")}
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                />
              </div>

              <Button onClick={handleChangePassword} className="w-full">
                {t("Update Password", "Cusboonaysii Furaha")}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

