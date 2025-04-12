import axios from "axios";
import { motion } from "framer-motion";
import { User, Briefcase, Search, Code, X, Award, BookOpen, Sparkles, Zap, Calendar, MapPin, UserCog, Edit3 } from "lucide-react";
import { useState, useEffect } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { toast } from "react-hot-toast";

interface ProfileData {
  _id?: string;
  clerk_Id?: string;
  name: string;
  email: string;
  dob: string;
  location: string;
  role: string;
  resume: null | { name: string; size: number; type: string; lastModified: number } | string;
  photo: null | string;
  profileImage: null | string;
  experience: { id: number; company: string; position: string; duration: string; isEditing?: boolean }[];
  jobs: Array<{ id: number; title: string; company: string; location: string }>;
  skills: string[];
  courses?: string[];
  certificates?: string[];
  badges?: string[];
  atsScore?: number;
}

const defaultProfileData: ProfileData = {
  name: "user",
  email: "abc@gmail.com",
  dob: "not added",
  location: "San Francisco, CA",
  role: "USER",
  resume: null,
  photo: null,
  profileImage: null,
  experience: [
    { id: 1, company: "TechCorp", position: "Senior Developer", duration: "2019-2023" },
  ],
  jobs: [
    { id: 1, title: "Frontend Developer", company: "Innovate Inc.", location: "Remote" },
    { id: 2, title: "UX Designer", company: "Creative Studio", location: "New York" },
  ],
  skills: [],
};

export default function ProfilePage() {
  const [userType, setUserType] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [profileData, setProfileData] = useState<ProfileData>(defaultProfileData);
  const [isClient, setIsClient] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // For role editing dropdown
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  
  const { isLoaded, user } = useUser();
  const { isSignedIn } = useAuth();

  // Fetch user data from MongoDB API
  const fetchUserData = async () => {
    if (!isLoaded || !isSignedIn || !user?.id) return;
    
    try {
      setIsLoading(true);
      // Fix the API endpoint call
      const response = await axios.get(`/api/user/${user.id}`);
      
      if (response.data && response.data.user) {
        // Transform the MongoDB data to match our component's data structure
        const userData = {
          ...defaultProfileData,
          ...response.data.user,
          name: response.data.user.name || user?.fullName || "User",
          email: response.data.user.email || user?.primaryEmailAddress?.emailAddress || "no-email@example.com",
          photo: response.data.user.profileImage || user?.imageUrl || "/favicon.png",
          profileImage: response.data.user.profileImage || user?.imageUrl || "/favicon.png",
        };
        
        setProfileData(userData);
        
        // Also set user type if available
        if (response.data.user.role === "RECRUITER") {
          setUserType("recruiter");
        } else {
          setUserType("employee"); // Default to employee
        }
      } else {
        // If we couldn't get user data from MongoDB, use defaults with Clerk data
        setProfileData({
          ...defaultProfileData,
          name: user?.fullName || "User",
          email: user?.primaryEmailAddress?.emailAddress || "no-email@example.com",
          photo: user?.imageUrl || "/favicon.png",
          profileImage: user?.imageUrl || "/favicon.png",
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      // Fallback to Clerk data if API fails
      setProfileData({
        ...defaultProfileData,
        name: user?.fullName || "User",
        email: user?.primaryEmailAddress?.emailAddress || "no-email@example.com",
        photo: user?.imageUrl || "/favicon.png",
        profileImage: user?.imageUrl || "/favicon.png",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isSignedIn && isLoaded) {
      fetchUserData();
    }
  }, [isSignedIn, isLoaded, user?.id]);

  useEffect(() => {
    setIsClient(true);
    
    // Load user type from localStorage as a backup
    const savedUserType = localStorage.getItem("userType") || "";
    if (!userType && savedUserType) {
      setUserType(savedUserType);
    }
  }, []);

  useEffect(() => {
    if (isClient && userType) {
      localStorage.setItem("userType", userType);
    }
  }, [userType, isClient]);

  // Function to save data to MongoDB
  const saveUserData = async (data: Partial<ProfileData>) => {
    if (!isSignedIn || !user?.id) return;
    
    try {
      const response = await axios.put(`/api/user/update`, {
        clerk_Id: user.id,
        ...data
      });
      
      if (response.data && response.data.success) {
        toast.success("Profile updated successfully!");
        return true;
      } else {
        toast.error("Failed to update profile.");
        return false;
      }
    } catch (error) {
      console.error("Error updating user data:", error);
      toast.error("Error updating profile. Please try again.");
      return false;
    }
  };

  // Start editing a field
  const startEditing = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingField(null);
    setEditValue("");
  };

  // Save edited field - Fix to ensure MongoDB update works
  const saveEditing = async () => {
    if (!editingField) return;
    
    try {
      toast.loading("Updating...");
      
      // Create update object
      const updateData = { [editingField]: editValue };
      
      // Save to MongoDB first to ensure it works
      const saveResult = await saveUserData(updateData);
      
      if (saveResult) {
        // Only update local state if MongoDB update was successful
        setProfileData((prev: ProfileData) => ({
          ...prev,
          ...updateData
        }));
        toast.dismiss();
        toast.success(`${editingField.charAt(0).toUpperCase() + editingField.slice(1)} updated successfully!`);
      } else {
        toast.dismiss();
        toast.error("Failed to update. Please try again.");
      }
    } catch (error) {
      toast.dismiss();
      toast.error("An error occurred while updating.");
      console.error("Error while editing field:", error);
    } finally {
      setEditingField(null);
      setEditValue("");
    }
  };

  const handleInputChange = async (field: string, value: string | object) => {
    setProfileData((prev: ProfileData) => {
      const newData: ProfileData = { ...prev, [field]: value };
      return newData;
    });
    
    // Save to MongoDB
    await saveUserData({ [field]: value });
  };

  // Edit field component
  const EditableField = ({ 
    field, 
    value, 
    label, 
    icon: Icon,
    isEditing,
    isDate = false
  }: { 
    field: string; 
    value: string; 
    label: string;
    icon: React.ElementType;
    isEditing: boolean;
    isDate?: boolean;
  }) => (
    <div className="flex items-center gap-3">
      <div className="p-2 bg-purple-900/20 rounded-lg">
        <Icon className="w-5 h-5 text-purple-400" />
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-medium text-gray-300">{label}</h3>
        {isEditing ? (
          <div className="flex mt-1">
            {isDate ? (
              <input
                type="date"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                autoFocus
              />
            ) : field === "role" ? (
              <div className="relative w-full">
                <button 
                  className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-left text-white text-sm flex justify-between items-center"
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                >
                  {editValue}
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showRoleDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg">
                    <div 
                      className="p-2 hover:bg-gray-700 cursor-pointer"
                      onClick={() => {
                        setEditValue("USER");
                        setShowRoleDropdown(false);
                      }}
                    >
                      USER
                    </div>
                    <div 
                      className="p-2 hover:bg-gray-700 cursor-pointer"
                      onClick={() => {
                        setEditValue("RECRUITER");
                        setShowRoleDropdown(false);
                      }}
                    >
                      RECRUITER
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                autoFocus
              />
            )}
            <div className="flex ml-2">
              <button 
                className="text-green-500 hover:text-green-400 mr-2"
                onClick={saveEditing}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button 
                className="text-red-500 hover:text-red-400"
                onClick={cancelEditing}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center">
            <p className="text-white font-semibold">{value}</p>
            <button 
              onClick={() => startEditing(field, value)}
              className="ml-2 p-1 hover:bg-gray-700 rounded-full"
            >
              <Edit3 size={16} className="text-gray-400 hover:text-purple-400" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  interface FileUploadEvent extends React.ChangeEvent<HTMLInputElement> {
    target: HTMLInputElement & { files: FileList | null };
  }

  interface UploadedFile {
    name: string;
    size: number;
    type: string;
    lastModified: number;
  }

  const handleFileUpload = (field: "photo" | "profileImage" | "resume", e: FileUploadEvent): void => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (field === "photo" || field === "profileImage") {
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        handleInputChange(field, event.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else if (field === "resume") {
      const uploadedFile: UploadedFile = {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
      };
      handleInputChange("resume", uploadedFile);
    }
  };

  interface SkillsResponse {
    extracted_skills: string[];
  }

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // First, display loading state
      const loadingToast = toast.loading("Processing resume...");
      
      // Create form data for file upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("clerk_Id", user?.id || "");
      
      // Upload to Cloudinary through our API
      const uploadResponse = await axios.post(
        "/api/resume-upload", 
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      if (!uploadResponse.data?.success) {
        toast.dismiss(loadingToast);
        throw new Error("Resume upload failed");
      }
      
      // Get the cloudinary URL from the response
      const resumeUrl = uploadResponse.data.url;
      console.log("Resume uploaded to:", resumeUrl);
      
      // Extract skills from resume using the Python model
      try {
        const skillsResponse = await axios.post<SkillsResponse>(
          "http://localhost:8000/extract-skills",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
  
        if (skillsResponse.data?.extracted_skills) {
          const currentSkills = Array.isArray(profileData.skills) ? profileData.skills : [];
          const newSkills = Array.isArray(skillsResponse.data.extracted_skills) 
            ? skillsResponse.data.extracted_skills 
            : [];
  
          // Log extracted skills
          console.log("Extracted skills:", newSkills);
  
          // Combine existing and new skills, removing duplicates
          const updatedSkills = [...new Set([...currentSkills, ...newSkills])];
          
          // Save resume URL and skills to MongoDB
          const saveResult = await saveUserData({
            resume: resumeUrl,
            skills: updatedSkills,
          });
  
          if (saveResult) {
            // Update local state only if MongoDB update was successful
            setProfileData((prev) => ({
              ...prev,
              resume: resumeUrl,
              skills: updatedSkills,
            }));
            toast.dismiss(loadingToast);
            toast.success("Resume uploaded and skills extracted successfully!");
          } else {
            toast.dismiss(loadingToast);
            toast.error("Resume uploaded but failed to save skills.");
          }
        } else {
          // If no skills were extracted but resume was uploaded
          await saveUserData({ resume: resumeUrl });
          setProfileData((prev) => ({
            ...prev,
            resume: resumeUrl,
          }));
          toast.dismiss(loadingToast);
          toast.warning("Resume uploaded but no skills were extracted.");
        }
      } catch (skillsError) {
        // If skills extraction fails, still save the resume URL
        console.error("Error extracting skills:", skillsError);
        await saveUserData({ resume: resumeUrl });
        setProfileData((prev) => ({
          ...prev,
          resume: resumeUrl,
        }));
        toast.dismiss(loadingToast);
        toast.warning("Resume uploaded but skills extraction failed.");
      }
    } catch (err) {
      toast.dismiss();
      console.error("Error processing resume:", err);
      toast.error(err instanceof Error ? err.message : "Failed to process resume");
    }
  };

  const addSkill = async () => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      const updatedSkills = [...(Array.isArray(profileData.skills) ? profileData.skills : []), newSkill.trim()];
      
      setProfileData((prev) => ({
        ...prev,
        skills: updatedSkills,
      }));
      
      // Save to MongoDB
      await saveUserData({ skills: updatedSkills });
      setNewSkill("");
    }
  };

  const removeSkill = async (skillToRemove: string) => {
    const updatedSkills = Array.isArray(profileData.skills)
      ? profileData.skills.filter((skill) => skill !== skillToRemove)
      : [];
    
    setProfileData((prev) => ({
      ...prev,
      skills: updatedSkills,
    }));
    
    // Save to MongoDB
    await saveUserData({ skills: updatedSkills });
  };

  const updateSkill = async (oldSkill: string, newSkill: string) => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      const updatedSkills = Array.isArray(profileData.skills)
        ? profileData.skills.map((skill) => (skill === oldSkill ? newSkill.trim() : skill))
        : [newSkill.trim()];
      
      setProfileData((prev) => ({
        ...prev,
        skills: updatedSkills,
      }));
      
      // Save to MongoDB
      await saveUserData({ skills: updatedSkills });
    }
  };

  const addExperience = () => {
    const newId: number =
      profileData.experience.length > 0
        ? Math.max(...profileData.experience.map((e: { id: number }) => e.id)) + 1
        : 1;

    setProfileData((prev: ProfileData) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          id: newId,
          company: "",
          position: "",
          duration: "",
          isEditing: true,
        },
      ],
    }));
  };

  const updateExperience = async (
    id: number,
    updates: Partial<{ company: string; position: string; duration: string; isEditing?: boolean }>
  ) => {
    const updatedExperience = profileData.experience.map((exp) =>
      exp.id === id ? { ...exp, ...updates, isEditing: false } : exp
    );
    
    setProfileData((prev: ProfileData) => ({
      ...prev,
      experience: updatedExperience,
    }));
    
    // Save to MongoDB
    await saveUserData({ experience: updatedExperience });
  };

  const deleteExperience = async (id: number): Promise<void> => {
    const updatedExperience = profileData.experience.filter((exp: { id: number }) => exp.id !== id);
    
    setProfileData((prev: ProfileData) => ({
      ...prev,
      experience: updatedExperience,
    }));
    
    // Save to MongoDB
    await saveUserData({ experience: updatedExperience });
  };

  // View resume function
  const viewResume = () => {
    if (typeof profileData.resume === 'string') {
      window.open(profileData.resume, '_blank');
    }
  };

  if (isLoading) {
    return <div className="bg-gray-900 text-gray-100 rounded-xl p-6 min-h-full flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-t-purple-500 border-purple-200/20 rounded-full animate-spin mb-4"></div>
        <p>Loading profile data...</p>
      </div>
    </div>;
  }

  if (!isClient) {
    return <div className="bg-gray-900 text-gray-100 rounded-xl p-6 min-h-full">Loading...</div>;
  }

  return (
    <div className="scroll-container pb-32 min-h-full text-white bg-transparent">
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[-1]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-800 rounded-full filter blur-[120px] opacity-10 -translate-y-1/4 translate-x-1/4"></div>
        <div className="absolute top-1/2 left-1/4 w-80 h-80 bg-blue-700 rounded-full filter blur-[100px] opacity-10 -translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-cyan-700 rounded-full filter blur-[80px] opacity-10 translate-y-1/4"></div>
        <motion.div
          className="absolute w-full h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.05 }}
          transition={{ duration: 2 }}
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48Y2lyY2xlIHN0cm9rZT0iIzMzMyIgc3Ryb2tlLW9wYWNpdHk9Ii4xIiBjeD0iMSIgY3k9IjEiIHI9IjEiLz48L2c+PC9zdmc+')] opacity-20"></div>
        </motion.div>
      </div>

      <div className="relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold mb-8 text-left"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">
            Your Digital Profile
          </span>
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
          <motion.div
            className="lg:col-span-4"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="backdrop-blur-sm bg-white/5 rounded-2xl p-8 border border-gray-800 shadow-xl transform-gpu transition-all duration-300 hover:shadow-purple-900/20 h-full group perspective">
              <div className="transform-gpu group-hover:rotate-y-2 group-hover:scale-[1.01] transition-transform duration-500">
                <div className="flex flex-col items-center mb-6 relative">
                  {profileData.photo || profileData.profileImage ? (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300, damping: 10 }}
                      className="w-36 h-36 rounded-full overflow-hidden border-4 border-purple-500/30 shadow-lg shadow-purple-900/20 mb-4"
                    >
                      <img src={profileData.photo || profileData.profileImage as string} alt="Profile" className="w-full h-full object-cover" />
                    </motion.div>
                  ) : (
                    <div className="w-36 h-36 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center border-4 border-purple-500/30 shadow-lg shadow-purple-900/20 mb-4">
                      <label className="cursor-pointer text-center">
                        <User size={48} className="mx-auto text-gray-400" />
                        <span className="text-xs block mt-2 text-gray-400">Add Photo</span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleFileUpload("profileImage", e)}
                        />
                      </label>
                    </div>
                  )}

                  <div className="absolute bottom-3 right-[42%] w-5 h-5 bg-green-500 rounded-full border-2 border-gray-800 shadow-lg"></div>

                  <div className="text-center w-full">
                    {profileData.name ? (
                      <motion.h2
                        className="text-3xl font-bold mt-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                        whileHover={{ scale: 1.05 }}
                      >
                        {profileData.name}
                      </motion.h2>
                    ) : (
                      <input
                        type="text"
                        placeholder="Your Name"
                        className="text-2xl font-bold mt-2 bg-transparent border-b border-gray-600 text-center focus:outline-none focus:border-purple-500"
                        onChange={(e) => handleInputChange("name", e.target.value)}
                      />
                    )}
                    <p className="text-gray-400 mt-1">{profileData.email}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="backdrop-blur-md bg-white/5 rounded-xl p-4 border border-gray-700/50">
                    {/* Role field */}
                    <div className="flex items-center gap-3 mb-3">
                      <EditableField
                        field="role"
                        value={profileData.role || "USER"}
                        label="Role"
                        icon={UserCog}
                        isEditing={editingField === "role"}
                      />
                    </div>

                    {/* DOB field */}
                    <div className="flex items-center gap-3 mb-3">
                      <EditableField
                        field="dob"
                        value={profileData.dob !== "not added" ? profileData.dob : "Not specified"}
                        label="Date of Birth"
                        icon={Calendar}
                        isEditing={editingField === "dob"}
                        isDate={true}
                      />
                    </div>

                    {/* Location field */}
                    <div className="flex items-center gap-3">
                      <EditableField
                        field="location"
                        value={profileData.location || "Not specified"}
                        label="Location"
                        icon={MapPin}
                        isEditing={editingField === "location"}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                      <svg
                        className="w-4 h-4 mr-1 text-purple-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Resume
                    </label>

                    {/* Show view button if resume exists */}
                    {typeof profileData.resume === 'string' && profileData.resume && (
                      <div className="flex items-center justify-between mb-2 bg-gray-800/50 p-2 rounded-lg">
                        <span className="text-gray-300 truncate flex-1 text-sm">
                          Resume uploaded
                        </span>
                        <button 
                          onClick={viewResume}
                          className="text-purple-400 hover:text-purple-300 text-xs px-2 py-1 rounded bg-purple-900/30"
                        >
                          View
                        </button>
                      </div>
                    )}

                    <label className="flex items-center justify-center w-full backdrop-blur-sm bg-white/5 border border-gray-700/50 border-dashed rounded-xl p-4 cursor-pointer hover:bg-white/10 transition-all duration-200 group">
                      <div className="text-center">
                        <div className="w-10 h-10 rounded-full bg-purple-900/20 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                          <svg
                            className="w-5 h-5 text-purple-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                            />
                          </svg>
                        </div>
                        <span className="text-gray-400 text-sm">
                          {typeof profileData.resume === 'string' && profileData.resume ? "Update Resume" : "Upload Resume"}
                        </span>
                        <p className="text-gray-500 text-xs mt-1">PDF, DOC or DOCX</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleResumeUpload(e)}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Rest of the profile UI components */}
          <motion.div
            className="lg:col-span-8 space-y-6"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="backdrop-blur-sm bg-white/5 rounded-2xl p-6 border border-gray-800 shadow-xl">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Sparkles size={18} className="text-purple-400 mr-2" />
                <span>I am a</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.label
                  className="relative"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <input
                    type="radio"
                    name="userType"
                    value="employee"
                    checked={userType === "employee"}
                    onChange={() => setUserType("employee")}
                    className="sr-only peer"
                  />
                  <div
                    className={`cursor-pointer rounded-xl p-5 border transition-all duration-300 
                    ${
                      userType === "employee"
                        ? "border-purple-500 bg-gradient-to-br from-purple-900/30 to-blue-900/30 shadow-lg shadow-purple-900/10"
                        : "border-gray-700 hover:border-gray-600 bg-gray-800/50"
                    }`}
                  >
                    <div className="flex items-start">
                      <div
                        className={`p-3 rounded-lg mr-4 transition-colors ${
                          userType === "employee" ? "bg-purple-900/30" : "bg-gray-700/50"
                        }`}
                      >
                        <Briefcase
                          size={24}
                          className={userType === "employee" ? "text-purple-400" : "text-gray-400"}
                        />
                      </div>
                      <div>
                        <h4 className="font-medium text-lg">Employee</h4>
                        <p className="text-gray-400 mt-1 text-sm">
                          I'm looking for job opportunities and want to showcase my professional
                          experience.
                        </p>
                      </div>
                    </div>

                    {userType === "employee" && (
                      <motion.div
                        className="absolute -right-2 -top-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 15 }}
                      >
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                    )}
                  </div>
                </motion.label>

                <motion.label
                  className="relative"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <input
                    type="radio"
                    name="userType"
                    value="student"
                    checked={userType === "student"}
                    onChange={() => setUserType("student")}
                    className="sr-only peer"
                  />
                  <div
                    className={`cursor-pointer rounded-xl p-5 border transition-all duration-300
                    ${
                      userType === "student"
                        ? "border-purple-500 bg-gradient-to-br from-purple-900/30 to-blue-900/30 shadow-lg shadow-purple-900/10"
                        : "border-gray-700 hover:border-gray-600 bg-gray-800/50"
                    }`}
                  >
                    <div className="flex items-start">
                      <div
                        className={`p-3 rounded-lg mr-4 transition-colors ${
                          userType === "student" ? "bg-purple-900/30" : "bg-gray-700/50"
                        }`}
                      >
                        <BookOpen
                          size={24}
                          className={userType === "student" ? "text-purple-400" : "text-gray-400"}
                        />
                      </div>
                      <div>
                        <h4 className="font-medium text-lg">Student</h4>
                        <p className="text-gray-400 mt-1 text-sm">
                          I'm enhancing my skills and learning new technologies to build my career.
                        </p>
                      </div>
                    </div>

                    {userType === "student" && (
                      <motion.div
                        className="absolute -right-2 -top-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 15 }}
                      >
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                    )}
                  </div>
                </motion.label>
              </div>
            </div>

            {userType === "employee" && (
              <div className="space-y-6">
                <motion.div
                  className="backdrop-blur-sm bg-white/5 rounded-2xl p-6 border border-gray-800 shadow-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold flex items-center">
                      <Award size={18} className="text-purple-400 mr-2" />
                      <span>Experience</span>
                    </h3>
                    <motion.button
                      onClick={addExperience}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-1.5 px-4 rounded-lg text-sm flex items-center shadow-lg shadow-purple-900/20"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Experience
                    </motion.button>
                  </div>

                  {profileData.experience?.length > 0 ? (
                    <div className="space-y-4">
                      {profileData.experience.map(
                        (
                          exp: {
                            id: number;
                            company: string;
                            position: string;
                            duration: string;
                            isEditing?: boolean;
                          },
                          index
                        ) => (
                          <motion.div
                            key={exp.id}
                            className={`p-4 rounded-xl relative group backdrop-blur-sm ${
                              exp.isEditing
                                ? "bg-gray-800/80 border border-purple-500/50"
                                : "bg-white/5 border border-gray-700/50 hover:border-purple-500/30 hover:bg-white/10"
                            }`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                          >
                            {exp.isEditing ? (
                              <div className="space-y-3">
                                <div className="relative">
                                  <input
                                    type="text"
                                    placeholder="Position"
                                    value={exp.position}
                                    onChange={(e) =>
                                      updateExperience(exp.id, { position: e.target.value })
                                    }
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 pl-9 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                  />
                                  <Briefcase size={16} className="absolute left-3 top-3 text-gray-400" />
                                </div>

                                <div className="relative">
                                  <input
                                    type="text"
                                    placeholder="Company"
                                    value={exp.company}
                                    onChange={(e) =>
                                      updateExperience(exp.id, { company: e.target.value })
                                    }
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 pl-9 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                  />
                                  <svg
                                    className="w-4 h-4 absolute left-3 top-3 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                    />
                                  </svg>
                                </div>

                                <div className="relative">
                                  <input
                                    type="text"
                                    placeholder="Duration (e.g., 2019-2023)"
                                    value={exp.duration}
                                    onChange={(e) =>
                                      updateExperience(exp.id, { duration: e.target.value })
                                    }
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 pl-9 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                  />
                                  <svg
                                    className="w-4 h-4 absolute left-3 top-3 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                  </svg>
                                </div>

                                <div className="flex justify-end space-x-3 mt-2">
                                  <motion.button
                                    onClick={() => deleteExperience(exp.id)}
                                    className="text-red-400 hover:text-red-300 text-sm py-1.5 px-3 rounded-lg bg-red-900/20 border border-red-800/30"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    Cancel
                                  </motion.button>
                                  <motion.button
                                    onClick={() => updateExperience(exp.id, { isEditing: false })}
                                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-1.5 px-4 rounded-lg text-sm"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    Save
                                  </motion.button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                                  <motion.button
                                    onClick={() => updateExperience(exp.id, { isEditing: true })}
                                    className="text-gray-400 hover:text-purple-400 p-1.5 rounded-lg bg-gray-800/50 hover:bg-gray-800"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <svg
                                      className="w-3.5 h-3.5"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                      />
                                    </svg>
                                  </motion.button>
                                  <motion.button
                                    onClick={() => deleteExperience(exp.id)}
                                    className="text-gray-400 hover:text-red-400 p-1.5 rounded-lg bg-gray-800/50 hover:bg-gray-800"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <svg
                                      className="w-3.5 h-3.5"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                      />
                                    </svg>
                                  </motion.button>
                                </div>

                                <div className="flex items-start">
                                  <div className="p-2.5 rounded-lg mr-4 bg-purple-900/20 flex items-center justify-center">
                                    <Briefcase size={20} className="text-purple-400" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-lg text-white">{exp.position}</h4>
                                    <div className="flex items-center text-sm text-gray-400 mt-1">
                                      <span className="font-medium text-purple-400">{exp.company}</span>
                                      <span className="mx-2">•</span>
                                      <span>{exp.duration}</span>
                                    </div>
                                  </div>
                                </div>
                              </>
                            )}
                          </motion.div>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 border border-dashed border-gray-700 rounded-xl bg-gray-800/30">
                      <Briefcase size={32} className="text-gray-600 mb-3" />
                      <p className="text-gray-500 mb-3">No experience added yet</p>
                      <motion.button
                        onClick={addExperience}
                        className="text-purple-400 hover:text-purple-300 flex items-center text-sm border border-purple-800/30 bg-purple-900/20 px-4 py-2 rounded-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Experience
                      </motion.button>
                    </div>
                  )}
                </motion.div>

                <motion.div
                  className="backdrop-blur-sm bg-white/5 rounded-2xl p-6 border border-gray-800 shadow-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Search size={18} className="text-purple-400 mr-2" />
                    <span>Job Recommendations</span>
                  </h3>

                  {profileData.jobs?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profileData.jobs.map(
                        (
                          job: { id: number; title: string; company: string; location: string },
                          index
                        ) => (
                          <motion.div
                            key={job.id}
                            className="p-4 rounded-xl border border-gray-700/50 bg-white/5 hover:border-purple-500/30 hover:bg-white/10 transition-all cursor-pointer group"
                            whileHover={{ y: -5, scale: 1.02 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold text-white mb-1 group-hover:text-purple-400 transition-colors">
                                  {job.title}
                                </h4>
                                <p className="text-sm text-gray-400">{job.company}</p>
                                <div className="flex items-center mt-3 text-xs text-gray-500">
                                  <svg
                                    className="w-3.5 h-3.5 mr-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                  </svg>
                                  {job.location}
                                </div>
                              </div>
                              <div className="p-1.5 rounded-full bg-gray-800 border border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg
                                  className="w-4 h-4 text-purple-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                                  />
                                </svg>
                              </div>
                            </div>
                          </motion.div>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 border border-dashed border-gray-700 rounded-xl bg-gray-800/30">
                      <Search size={32} className="text-gray-600 mb-3" />
                      <p className="text-gray-500">No job recommendations yet</p>
                      <p className="text-gray-600 text-sm mt-2">
                        Add more skills to get personalized job matches
                      </p>
                    </div>
                  )}
                </motion.div>
              </div>
            )}

            <motion.div
              className="backdrop-blur-sm bg-white/5 rounded-2xl p-6 border border-gray-800 shadow-xl mb-14"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold flex items-center">
                  <Zap size={18} className="text-purple-400 mr-2" />
                  <span>Skills</span>
                </h3>
                <span className="text-xs py-1 px-2.5 bg-purple-900/30 text-purple-400 rounded-full">
                  {profileData.skills?.length || 0} skills
                </span>
              </div>

              <div className="relative mt-2 mb-5">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill (e.g., React, Python, UX Design)"
                  className="w-full bg-gray-900 border border-gray-700 rounded-l-xl rounded-r-xl pl-10 pr-24 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  onKeyPress={(e) => e.key === "Enter" && addSkill()}
                />
                <Code size={18} className="absolute left-3.5 top-3.5 text-gray-500" />
                <motion.button
                  onClick={addSkill}
                  className="absolute right-1.5 top-1.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-1.5 px-4 rounded-lg text-sm shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Add Skill
                </motion.button>
              </div>

              {Array.isArray(profileData.skills) && profileData.skills.length > 0 ? (
                <motion.div
                  className="mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills.map((skill, idx) => (
                      <motion.div
                        key={idx}
                        className="group flex items-center text-white text-sm px-3 py-1.5 rounded-full relative overflow-hidden"
                        whileHover={{ scale: 1.05 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: idx * 0.05 }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-80"></div>
                        <div className="absolute inset-0 bg-gray-900 opacity-0 group-hover:opacity-10"></div>
                        <Code size={12} className="mr-1.5 text-white relative z-10" />
                        <span className="relative z-10">{skill}</span>
                        <button
                          onClick={() => removeSkill(skill)}
                          className="ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 relative z-10"
                        >
                          <X size={14} className="text-white/80 hover:text-white" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 border border-dashed border-gray-700 rounded-xl bg-gray-800/30">
                  <Code size={32} className="text-gray-600 mb-3" />
                  <p className="text-gray-500">No skills added yet</p>
                  <p className="text-gray-600 text-xs mt-2">
                    Upload your resume or add them manually above
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>
        
        <div className="h-10 md:h-20"></div>
      </div>
    </div>
  );
}