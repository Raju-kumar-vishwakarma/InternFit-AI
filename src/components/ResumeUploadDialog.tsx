import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload, Loader2, Pencil, Check, X, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ResumeQualityScore from "./ResumeQualityScore";

const ResumeUploadDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [resumeId, setResumeId] = useState<string>("");
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF or DOCX file",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (10MB)
      if (file.size > 10485760) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 10MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please login to upload your resume",
          variant: "destructive",
        });
        setIsUploading(false);
        return;
      }

      // Upload file to storage
      const filePath = `${user.id}/${Date.now()}-${selectedFile.name}`;
      const { error: uploadError, data } = await supabase.storage
        .from('resumes')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath);

      toast({
        title: "Analyzing resume...",
        description: "Using Gemini AI to extract data",
      });

      // Call parse-resume edge function (uses Gemini)
      const { data: parseData, error: parseError } = await supabase.functions.invoke('parse-resume', {
        body: { 
          fileUrl: publicUrl,
          fileName: selectedFile.name 
        },
      });

      if (parseError) throw parseError;

      // Show preview to user
      setExtractedData(parseData);
      setResumeId(parseData.resumeId);
      setShowPreview(true);
      
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmData = async () => {
    setIsUploading(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "User not authenticated",
          variant: "destructive",
        });
        return;
      }

      // Extract languages from resume data
      const languages = extractedData.languages || [];
      
      // Extract education text if it's an array
      let educationText = "";
      if (Array.isArray(extractedData.education)) {
        educationText = extractedData.education.map((edu: any) => 
          `${edu.degree} - ${edu.field_of_study} at ${edu.institution} (${edu.years})`
        ).join("\n");
      } else if (typeof extractedData.education === 'string') {
        educationText = extractedData.education;
      }

      // Save comprehensive profile data
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          skills: extractedData.skills || [],
          languages: languages,
          detailed_experience: extractedData.experience || [],
          detailed_education: extractedData.education || [],
          projects: extractedData.projects || [],
          certifications: extractedData.certifications || [],
          education: educationText,
        }, {
          onConflict: 'user_id'
        });

      if (profileError) {
        console.error('Profile import error:', profileError);
        toast({
          title: "Profile import failed",
          description: "Resume uploaded but couldn't auto-import to profile",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Profile updated!",
          description: "Your complete profile has been updated with resume data",
        });
      }

      // Generate recommendations
      const { data: recommendations, error: recommendError } = await supabase.functions.invoke('generate-recommendations', {
        body: { resumeId: resumeId },
      });

      if (recommendError) throw recommendError;

      toast({
        title: "Recommendations ready!",
        description: `Found ${recommendations.recommendations.length} matching internships`,
      });

      setIsOpen(false);
      setSelectedFile(null);
      setShowPreview(false);
      setExtractedData(null);
      
      // Reload page to show new data
      window.location.reload();
    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: "Import failed",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        setShowPreview(false);
        setExtractedData(null);
        setSelectedFile(null);
      }
    }}>
      <DialogTrigger asChild>
        <Button size="lg" className="rounded-full px-8 py-6 text-base font-semibold">
          Upload Resume (PDF / DOCX)
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{showPreview ? "Preview Extracted Data" : "Upload Your Resume"}</DialogTitle>
          <DialogDescription>
            {showPreview 
              ? "Review the data extracted by Gemini AI before saving"
              : "Upload your CV/Resume to get AI-powered internship recommendations"
            }
          </DialogDescription>
        </DialogHeader>
        
        {!showPreview ? (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-12 h-12 mb-4 text-primary" />
                  <p className="mb-2 text-sm font-semibold">
                    {selectedFile ? selectedFile.name : "Click to upload"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF or DOCX (Max 10MB)
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileSelect}
                />
              </label>
            </div>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing with Gemini AI...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload & Analyze
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* Resume Quality Score */}
            <ResumeQualityScore data={extractedData} />

            {/* Skills Section */}
            {extractedData?.skills && extractedData.skills.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Skills</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingSection(editingSection === 'skills' ? null : 'skills')}
                  >
                    {editingSection === 'skills' ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                  </Button>
                </div>
                {editingSection === 'skills' ? (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {extractedData.skills.map((skill: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                          <Input
                            value={skill}
                            onChange={(e) => {
                              const newSkills = [...extractedData.skills];
                              newSkills[idx] = e.target.value;
                              setExtractedData({ ...extractedData, skills: newSkills });
                            }}
                            className="h-6 w-24 text-xs border-0 bg-transparent p-0"
                          />
                          <button
                            onClick={() => {
                              const newSkills = extractedData.skills.filter((_: any, i: number) => i !== idx);
                              setExtractedData({ ...extractedData, skills: newSkills });
                            }}
                            className="hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setExtractedData({
                          ...extractedData,
                          skills: [...extractedData.skills, 'New Skill']
                        });
                      }}
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add Skill
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {extractedData.skills.map((skill: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Experience Section */}
            {extractedData?.experience && extractedData.experience.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Experience</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingSection(editingSection === 'experience' ? null : 'experience')}
                  >
                    {editingSection === 'experience' ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="space-y-2">
                  {extractedData.experience.map((exp: any, idx: number) => (
                    <div key={idx} className="p-3 bg-muted/30 rounded-lg">
                      {editingSection === 'experience' ? (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Job Title"
                              value={exp.title}
                              onChange={(e) => {
                                const newExp = [...extractedData.experience];
                                newExp[idx].title = e.target.value;
                                setExtractedData({ ...extractedData, experience: newExp });
                              }}
                              className="flex-1"
                            />
                            <Input
                              placeholder="Company"
                              value={exp.company}
                              onChange={(e) => {
                                const newExp = [...extractedData.experience];
                                newExp[idx].company = e.target.value;
                                setExtractedData({ ...extractedData, experience: newExp });
                              }}
                              className="flex-1"
                            />
                          </div>
                          <Input
                            placeholder="Duration"
                            value={exp.duration}
                            onChange={(e) => {
                              const newExp = [...extractedData.experience];
                              newExp[idx].duration = e.target.value;
                              setExtractedData({ ...extractedData, experience: newExp });
                            }}
                          />
                          <Textarea
                            placeholder="Responsibilities"
                            value={exp.responsibilities || ''}
                            onChange={(e) => {
                              const newExp = [...extractedData.experience];
                              newExp[idx].responsibilities = e.target.value;
                              setExtractedData({ ...extractedData, experience: newExp });
                            }}
                            rows={2}
                          />
                          <Textarea
                            placeholder="Achievements"
                            value={exp.achievements || ''}
                            onChange={(e) => {
                              const newExp = [...extractedData.experience];
                              newExp[idx].achievements = e.target.value;
                              setExtractedData({ ...extractedData, experience: newExp });
                            }}
                            rows={2}
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              const newExp = extractedData.experience.filter((_: any, i: number) => i !== idx);
                              setExtractedData({ ...extractedData, experience: newExp });
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-1" /> Remove
                          </Button>
                        </div>
                      ) : (
                        <>
                          <p className="font-medium">{exp.title} at {exp.company}</p>
                          <p className="text-xs text-muted-foreground">{exp.duration}</p>
                          {exp.responsibilities && (
                            <p className="text-sm mt-1">{exp.responsibilities}</p>
                          )}
                          {exp.achievements && (
                            <p className="text-sm mt-1 text-primary">{exp.achievements}</p>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                  {editingSection === 'experience' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setExtractedData({
                          ...extractedData,
                          experience: [...extractedData.experience, {
                            title: 'Job Title',
                            company: 'Company Name',
                            duration: '2023 - Present',
                            responsibilities: '',
                            achievements: ''
                          }]
                        });
                      }}
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add Experience
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Education Section */}
            {extractedData?.education && extractedData.education.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Education</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingSection(editingSection === 'education' ? null : 'education')}
                  >
                    {editingSection === 'education' ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="space-y-2">
                  {extractedData.education.map((edu: any, idx: number) => (
                    <div key={idx} className="p-3 bg-muted/30 rounded-lg">
                      {editingSection === 'education' ? (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Degree"
                              value={edu.degree}
                              onChange={(e) => {
                                const newEdu = [...extractedData.education];
                                newEdu[idx].degree = e.target.value;
                                setExtractedData({ ...extractedData, education: newEdu });
                              }}
                              className="flex-1"
                            />
                            <Input
                              placeholder="Field"
                              value={edu.field_of_study}
                              onChange={(e) => {
                                const newEdu = [...extractedData.education];
                                newEdu[idx].field_of_study = e.target.value;
                                setExtractedData({ ...extractedData, education: newEdu });
                              }}
                              className="flex-1"
                            />
                          </div>
                          <Input
                            placeholder="Institution"
                            value={edu.institution}
                            onChange={(e) => {
                              const newEdu = [...extractedData.education];
                              newEdu[idx].institution = e.target.value;
                              setExtractedData({ ...extractedData, education: newEdu });
                            }}
                          />
                          <div className="flex gap-2">
                            <Input
                              placeholder="Years"
                              value={edu.years}
                              onChange={(e) => {
                                const newEdu = [...extractedData.education];
                                newEdu[idx].years = e.target.value;
                                setExtractedData({ ...extractedData, education: newEdu });
                              }}
                              className="flex-1"
                            />
                            <Input
                              placeholder="GPA (optional)"
                              value={edu.gpa || ''}
                              onChange={(e) => {
                                const newEdu = [...extractedData.education];
                                newEdu[idx].gpa = e.target.value;
                                setExtractedData({ ...extractedData, education: newEdu });
                              }}
                              className="flex-1"
                            />
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              const newEdu = extractedData.education.filter((_: any, i: number) => i !== idx);
                              setExtractedData({ ...extractedData, education: newEdu });
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-1" /> Remove
                          </Button>
                        </div>
                      ) : (
                        <>
                          <p className="font-medium">{edu.degree} - {edu.field_of_study}</p>
                          <p className="text-sm">{edu.institution}</p>
                          <p className="text-xs text-muted-foreground">{edu.years}</p>
                          {edu.gpa && (
                            <p className="text-xs text-muted-foreground">GPA: {edu.gpa}</p>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                  {editingSection === 'education' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setExtractedData({
                          ...extractedData,
                          education: [...extractedData.education, {
                            degree: 'Bachelor',
                            field_of_study: 'Computer Science',
                            institution: 'University',
                            years: '2020-2024',
                            gpa: ''
                          }]
                        });
                      }}
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add Education
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Projects Section */}
            {extractedData?.projects && extractedData.projects.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Projects</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingSection(editingSection === 'projects' ? null : 'projects')}
                  >
                    {editingSection === 'projects' ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="space-y-2">
                  {extractedData.projects.map((project: any, idx: number) => (
                    <div key={idx} className="p-3 bg-muted/30 rounded-lg">
                      {editingSection === 'projects' ? (
                        <div className="space-y-2">
                          <Input
                            placeholder="Project Name"
                            value={project.name}
                            onChange={(e) => {
                              const newProjects = [...extractedData.projects];
                              newProjects[idx].name = e.target.value;
                              setExtractedData({ ...extractedData, projects: newProjects });
                            }}
                          />
                          <Textarea
                            placeholder="Description"
                            value={project.description}
                            onChange={(e) => {
                              const newProjects = [...extractedData.projects];
                              newProjects[idx].description = e.target.value;
                              setExtractedData({ ...extractedData, projects: newProjects });
                            }}
                            rows={2}
                          />
                          <Input
                            placeholder="Technologies"
                            value={project.technologies || ''}
                            onChange={(e) => {
                              const newProjects = [...extractedData.projects];
                              newProjects[idx].technologies = e.target.value;
                              setExtractedData({ ...extractedData, projects: newProjects });
                            }}
                          />
                          <Input
                            placeholder="Project Link (optional)"
                            value={project.link || ''}
                            onChange={(e) => {
                              const newProjects = [...extractedData.projects];
                              newProjects[idx].link = e.target.value;
                              setExtractedData({ ...extractedData, projects: newProjects });
                            }}
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              const newProjects = extractedData.projects.filter((_: any, i: number) => i !== idx);
                              setExtractedData({ ...extractedData, projects: newProjects });
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-1" /> Remove
                          </Button>
                        </div>
                      ) : (
                        <>
                          <p className="font-medium">{project.name}</p>
                          <p className="text-sm mt-1">{project.description}</p>
                          {project.technologies && (
                            <p className="text-xs text-muted-foreground mt-1">Tech: {project.technologies}</p>
                          )}
                          {project.link && (
                            <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mt-1 block">
                              View Project
                            </a>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                  {editingSection === 'projects' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setExtractedData({
                          ...extractedData,
                          projects: [...extractedData.projects, {
                            name: 'Project Name',
                            description: 'Project description',
                            technologies: 'React, Node.js',
                            link: ''
                          }]
                        });
                      }}
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add Project
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Certifications Section */}
            {extractedData?.certifications && extractedData.certifications.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Certifications</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingSection(editingSection === 'certifications' ? null : 'certifications')}
                  >
                    {editingSection === 'certifications' ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="space-y-2">
                  {extractedData.certifications.map((cert: any, idx: number) => (
                    <div key={idx} className="p-3 bg-muted/30 rounded-lg">
                      {editingSection === 'certifications' ? (
                        <div className="space-y-2">
                          <Input
                            placeholder="Certification Name"
                            value={cert.name}
                            onChange={(e) => {
                              const newCerts = [...extractedData.certifications];
                              newCerts[idx].name = e.target.value;
                              setExtractedData({ ...extractedData, certifications: newCerts });
                            }}
                          />
                          <Input
                            placeholder="Issuer"
                            value={cert.issuer}
                            onChange={(e) => {
                              const newCerts = [...extractedData.certifications];
                              newCerts[idx].issuer = e.target.value;
                              setExtractedData({ ...extractedData, certifications: newCerts });
                            }}
                          />
                          <div className="flex gap-2">
                            <Input
                              placeholder="Date"
                              value={cert.date}
                              onChange={(e) => {
                                const newCerts = [...extractedData.certifications];
                                newCerts[idx].date = e.target.value;
                                setExtractedData({ ...extractedData, certifications: newCerts });
                              }}
                              className="flex-1"
                            />
                            <Input
                              placeholder="Credential ID (optional)"
                              value={cert.credential_id || ''}
                              onChange={(e) => {
                                const newCerts = [...extractedData.certifications];
                                newCerts[idx].credential_id = e.target.value;
                                setExtractedData({ ...extractedData, certifications: newCerts });
                              }}
                              className="flex-1"
                            />
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              const newCerts = extractedData.certifications.filter((_: any, i: number) => i !== idx);
                              setExtractedData({ ...extractedData, certifications: newCerts });
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-1" /> Remove
                          </Button>
                        </div>
                      ) : (
                        <>
                          <p className="font-medium">{cert.name}</p>
                          <p className="text-sm">{cert.issuer}</p>
                          <p className="text-xs text-muted-foreground">{cert.date}</p>
                          {cert.credential_id && (
                            <p className="text-xs text-muted-foreground">ID: {cert.credential_id}</p>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                  {editingSection === 'certifications' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setExtractedData({
                          ...extractedData,
                          certifications: [...extractedData.certifications, {
                            name: 'Certification Name',
                            issuer: 'Issuing Organization',
                            date: '2024',
                            credential_id: ''
                          }]
                        });
                      }}
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add Certification
                    </Button>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPreview(false);
                  setExtractedData(null);
                }}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleConfirmData}
                disabled={isUploading}
                className="flex-1"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Confirm & Save"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ResumeUploadDialog;
