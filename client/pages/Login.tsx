import PublicLayout from "@/components/layout/PublicLayout";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useApp } from "@/context/AppContext";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, UserCircle2, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const { setUser, language } = useApp();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "teacher">("teacher");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const t = (en: string, so: string) => (language === "en" ? en : so);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: t("Error", "Qalad"),
        description: t("Please fill in all fields", "Fadlan buuxi dhammaan goobaha"),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Make real API call to login
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          role: role.toUpperCase(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Login failed");
      }

      const data = await response.json();
      
      // Store user data and token
      setUser({ 
        role, 
        id: data.user.id,
        token: data.token 
      });
      
      toast({
        title: t("Success", "Guul"),
        description: t(`Logged in as ${role}`, `Waxaad u soo gashay ${role === "admin" ? "Maamule" : "Macallin"}`),
      });
      
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: t("Error", "Qalad"),
        description: error instanceof Error ? error.message : t("Login failed", "Waxay fashilantay in la soo galo"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PublicLayout>
      <section className="container -mt-24">
        <Card className="mx-auto max-w-md shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-center text-2xl">
              {t("Welcome Back", "Ku soo dhawoow")}
            </CardTitle>
            <CardDescription className="text-center">
              {t("Sign in to Darul Ummah School Management", "U soo gal Maamulka Dugsiga Darul Ummah")}
            </CardDescription>
          </CardHeader>
          <form onSubmit={onSubmit}>
            <CardContent className="space-y-4">
              {/* Login Type Selection */}
              <div className="grid gap-2">
                <Label className="text-sm font-medium">
                  {t("Login As", "U soo gal sida")}
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={role === "teacher" ? "default" : "outline"}
                    onClick={() => setRole("teacher")}
                    className="flex items-center gap-2"
                  >
                    <UserCircle2 className="h-4 w-4" />
                    {t("Teacher", "Macallin")}
                  </Button>
                  <Button
                    type="button"
                    variant={role === "admin" ? "default" : "outline"}
                    onClick={() => setRole("admin")}
                    className="flex items-center gap-2"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    {t("Admin", "Maamulaha")}
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Username/Email Field */}
              <div className="grid gap-2">
                <Label htmlFor="username">
                  {t("Email or Username", "Emailka ama Magaca isticmaale")}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    placeholder={t("Enter your email or username", "Geli emailkaaga ama magaca isticmaale")}
                    className="pl-9"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="grid gap-2">
                <Label htmlFor="password">
                  {t("Password", "Furaha sirta")}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("Enter your password", "Geli furaha sirta")}
                    className="pl-9 pr-9"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label
                  htmlFor="remember"
                  className="text-sm font-normal cursor-pointer"
                >
                  {t("Remember me", "I xasuuso")}
                </Label>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? t("Signing in...", "Waa la soo galayaa...") : t("Sign In", "Soo gal")}
              </Button>
              
            </CardFooter>
          </form>
        </Card>

        {/* Demo Credentials Card */}
        <Card className="mx-auto max-w-md shadow-lg mt-6 border-2 border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle className="text-center text-lg flex items-center justify-center gap-2">
              🔑 {t("Demo Accounts", "Akoonada Tijaabada")}
            </CardTitle>
            <CardDescription className="text-center">
              {t("Use these credentials to test the system", "Isticmaal xogtan si aad u tijaabiso nidaamka")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Admin Account */}
            <div className="p-4 rounded-lg bg-white dark:bg-gray-800 border shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  🛡️
                </div>
                <h4 className="font-semibold text-purple-700 dark:text-purple-300">
                  {t("School Admin", "Maamulaha Dugsiga")}
                </h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("Email", "Email")}:</span>
                  <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                    admin@darulumah.edu
                  </code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("Password", "Furaha")}:</span>
                  <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                    admin123
                  </code>
                </div>
              </div>
            </div>

            {/* Teacher Account */}
            <div className="p-4 rounded-lg bg-white dark:bg-gray-800 border shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  👨‍🏫
                </div>
                <h4 className="font-semibold text-blue-700 dark:text-blue-300">
                  {t("Teacher", "Macallin")}
                </h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("Email", "Email")}:</span>
                  <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                    ahmed.hassan@darulumah.edu
                  </code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("Password", "Furaha")}:</span>
                  <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                    teacher123
                  </code>
                </div>
              </div>
            </div>

            {/* Student ID for testing */}
            <div className="p-4 rounded-lg bg-white dark:bg-gray-800 border shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  🎓
                </div>
                <h4 className="font-semibold text-green-700 dark:text-green-300">
                  {t("Test Student ID", "Aqoonsiga Ardayga Tijaabada")}
                </h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("Student ID", "Aqoonsiga")}:</span>
                  <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                    DU-2025-001
                  </code>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {t("Use on homepage to check results", "Ka isticmaal bogga hore si aad u eegto natiijooyinka")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </PublicLayout>
  );
}
