import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Save, Plus, X, User, FileText, GraduationCap, Settings as SettingsIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const ProfileSettingsContent = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    phone: "",
    gender: "",
    marital_status: "",
    professional_title: "",
    availability: "",
    skills: [] as string[],
    languages: [] as string[],
    country: "",
    location: "",
    bio: "",
    linkedin_url: "",
    github_url: "",
    portfolio_url: "",
    date_of_birth: "",
    current_company: "",
    experience_years: 0,
    education: "",
  });

  const [userEmail, setUserEmail] = useState("");

  const [newSkill, setNewSkill] = useState("");
  const [newLanguage, setNewLanguage] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error("Auth error:", authError);
        toast({
          title: "Authentication required",
          description: "Please sign in to access your profile",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile({
          full_name: data.full_name || "",
          phone: data.phone || "",
          gender: data.gender || "",
          marital_status: data.marital_status || "",
          professional_title: data.professional_title || "",
          availability: data.availability || "",
          skills: data.skills || [],
          languages: data.languages || [],
          country: data.country || "",
          location: data.location || "",
          bio: data.bio || "",
          linkedin_url: data.linkedin_url || "",
          github_url: data.github_url || "",
          portfolio_url: data.portfolio_url || "",
          date_of_birth: data.date_of_birth || "",
          current_company: data.current_company || "",
          experience_years: data.experience_years || 0,
          education: data.education || "",
        });
      }
      
      setUserEmail(user.email || "");
    } catch (error: any) {
      toast({
        title: "Error loading profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .upsert({
          user_id: user.id,
          ...profile,
          date_of_birth: profile.date_of_birth || null,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast({
        title: "Profile saved",
        description: "Your profile has been updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error saving profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !profile.languages.includes(newLanguage.trim())) {
      setProfile(prev => ({
        ...prev,
        languages: [...prev.languages, newLanguage.trim()]
      }));
      setNewLanguage("");
    }
  };

  const removeLanguage = (language: string) => {
    setProfile(prev => ({
      ...prev,
      languages: prev.languages.filter(l => l !== language)
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl p-8 mb-8">
        <div className="flex items-center gap-3 mb-2">
          <User className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
        <p className="text-primary-foreground/90">Manage your personal information and preferences</p>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Basic
          </TabsTrigger>
          <TabsTrigger value="details" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Details
          </TabsTrigger>
          <TabsTrigger value="education" className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            Education
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <SettingsIcon className="w-4 h-4" />
            Account Setting
          </TabsTrigger>
        </TabsList>

        {/* Basic Tab */}
        <TabsContent value="basic" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name <span className="text-destructive">*</span></Label>
              <Input
                id="full_name"
                value={profile.full_name}
                onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
              <Input
                id="email"
                value={userEmail}
                disabled
                placeholder="Email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone <span className="text-destructive">*</span></Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => setProfile({...profile, phone: e.target.value})}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={profile.date_of_birth}
                onChange={(e) => setProfile({...profile, date_of_birth: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="current_company">Current Company</Label>
            <Input
              id="current_company"
              value={profile.current_company}
              onChange={(e) => setProfile({...profile, current_company: e.target.value})}
              placeholder="Enter your current company"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience_years">Years of Experience</Label>
            <Input
              id="experience_years"
              type="number"
              value={profile.experience_years}
              onChange={(e) => setProfile({...profile, experience_years: parseInt(e.target.value) || 0})}
              placeholder="0"
            />
          </div>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="gender">Gender <span className="text-destructive">*</span></Label>
              <Select value={profile.gender} onValueChange={(value) => setProfile({...profile, gender: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="marital_status">Marital Status <span className="text-destructive">*</span></Label>
              <Select value={profile.marital_status} onValueChange={(value) => setProfile({...profile, marital_status: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="married">Married</SelectItem>
                  <SelectItem value="divorced">Divorced</SelectItem>
                  <SelectItem value="widowed">Widowed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="professional_title">Profession <span className="text-destructive">*</span></Label>
              <Select value={profile.professional_title} onValueChange={(value) => setProfile({...profile, professional_title: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Your Profession" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="software_engineer">Software Engineer</SelectItem>
                  <SelectItem value="data_scientist">Data Scientist</SelectItem>
                  <SelectItem value="product_manager">Product Manager</SelectItem>
                  <SelectItem value="designer">Designer</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="availability">Your availability <span className="text-destructive">*</span></Label>
              <Select value={profile.availability} onValueChange={(value) => setProfile({...profile, availability: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_time">Full Time</SelectItem>
                  <SelectItem value="part_time">Part Time</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="freelance">Freelance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <Label htmlFor="skills">Skills <span className="text-destructive">*</span></Label>
            <div className="flex gap-2">
              <Input
                id="skills"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                placeholder="eg: python, js, ml . . ."
              />
              <Button type="button" size="icon" onClick={addSkill}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {profile.skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {skill}
                  <X 
                    className="w-3 h-3 cursor-pointer hover:text-destructive" 
                    onClick={() => removeSkill(skill)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div className="space-y-2">
            <Label htmlFor="languages">Languages you know <span className="text-destructive">*</span></Label>
            <div className="flex gap-2">
              <Input
                id="languages"
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                placeholder="eg: english, hindi . . ."
              />
              <Button type="button" size="icon" onClick={addLanguage}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {profile.languages.map((language, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {language}
                  <X 
                    className="w-3 h-3 cursor-pointer hover:text-destructive" 
                    onClick={() => removeLanguage(language)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="country">Country <span className="text-destructive">*</span></Label>
              <Select value={profile.country} onValueChange={(value) => setProfile({...profile, country: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="india">India</SelectItem>
                  <SelectItem value="usa">USA</SelectItem>
                  <SelectItem value="uk">UK</SelectItem>
                  <SelectItem value="canada">Canada</SelectItem>
                  <SelectItem value="australia">Australia</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location <span className="text-destructive">*</span></Label>
              <Input
                id="location"
                value={profile.location}
                onChange={(e) => setProfile({...profile, location: e.target.value})}
                placeholder="Location"
              />
            </div>
          </div>

          {/* About Me */}
          <div className="space-y-2">
            <Label htmlFor="bio">About me <span className="text-destructive">*</span></Label>
            <Textarea
              id="bio"
              value={profile.bio}
              onChange={(e) => setProfile({...profile, bio: e.target.value})}
              placeholder="Tell us about yourself..."
              rows={5}
            />
          </div>
        </TabsContent>

        {/* Education Tab */}
        <TabsContent value="education" className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="education">Education Details</Label>
            <Textarea
              id="education"
              value={profile.education}
              onChange={(e) => setProfile({...profile, education: e.target.value})}
              placeholder="Enter your education details..."
              rows={8}
            />
          </div>
        </TabsContent>

        {/* Account Setting Tab */}
        <TabsContent value="account" className="space-y-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn URL</Label>
              <Input
                id="linkedin"
                value={profile.linkedin_url}
                onChange={(e) => setProfile({...profile, linkedin_url: e.target.value})}
                placeholder="https://linkedin.com/in/username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="github">GitHub URL</Label>
              <Input
                id="github"
                value={profile.github_url}
                onChange={(e) => setProfile({...profile, github_url: e.target.value})}
                placeholder="https://github.com/username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="portfolio">Portfolio URL</Label>
              <Input
                id="portfolio"
                value={profile.portfolio_url}
                onChange={(e) => setProfile({...profile, portfolio_url: e.target.value})}
                placeholder="https://yourportfolio.com"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end mt-8">
        <Button 
          onClick={handleSave} 
          disabled={saving}
          size="lg"
          className="min-w-[150px]"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
