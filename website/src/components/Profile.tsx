import axios from "axios";
import { motion } from "framer-motion";
import { User, Briefcase, Search, Code, X } from "lucide-react";
import { useState, useEffect, use } from "react";
import {useUser, useAuth} from "@clerk/nextjs";

interface ProfileData {
  name: string;
  email: string;
  dob: string;
  location: string;
  resume: null | { name: string; size: number; type: string; lastModified: number };
  photo: null | string;
  experience: { id: number; company: string; position: string; duration: string; isEditing?: boolean }[];
  jobs: Array<{ id: number; title: string; company: string; location: string }>;
  skills: string[]; // Added skills to ProfileData interface
}

// Default profile data
const defaultProfileData: ProfileData = {
  name: 'user',
  email: 'abc@gmail.com',
  dob: 'not added',
  location: 'San Francisco, CA',
  resume: null,
  photo: null,
  experience: [
    { id: 1, company: 'TechCorp', position: 'Senior Developer', duration: '2019-2023' }
  ],
  jobs: [
    { id: 1, title: 'Frontend Developer', company: 'Innovate Inc.', location: 'Remote' },
    { id: 2, title: 'UX Designer', company: 'Creative Studio', location: 'New York' }
  ],
  skills: [] // Initialize skills array
};

export default function ProfilePage() {
  // Fix 1: Initialize with empty values and update after component mounts
  const [userType, setUserType] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [profileData, setProfileData] = useState<ProfileData>(defaultProfileData);
  //TODO: Change isClient and loading
  const [isClient, setIsClient] = useState(true);
  
  const {isLoaded, user} = useUser();
  const {isSignedIn} = useAuth();

  const fetchUserData = () => {
    profileData.name = (user?.firstName + " " + user?.lastName) || "user";
    profileData.photo = (user?.imageUrl) || "/favicon.png";
    profileData.email =  user?.primaryEmailAddress?.emailAddress || "no-email@example.com";
  }

  fetchUserData()
  // Fix 2: Use useEffect to safely access localStorage after component mounts
  useEffect(() => {
    if(!isLoaded){
      return;
    }
    setIsClient(true);
    const savedUserType = localStorage.getItem('userType') || '';
    setUserType(savedUserType);
    
    const savedData = localStorage.getItem('profileData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // Ensure skills is always an array
        if (!Array.isArray(parsedData.skills)) {
          parsedData.skills = [];
        }
        setProfileData(parsedData);
      } catch (error) {
        console.error('Error parsing profile data:', error);
        // If there's an error parsing, use default data
        setProfileData(defaultProfileData);
      }
    }
  }, []);

  // Update localStorage whenever profileData changes
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('profileData', JSON.stringify(profileData));
    }
    const skils =
    
    console.log("Updated skills:", profileData.skills);
  }, [profileData, isClient]);

  useEffect(() => {
    if (isClient && userType) {
      localStorage.setItem('userType', userType);
    }
  }, [userType, isClient]);

  const handleInputChange = (field: string, value: string | object) => {
    setProfileData((prev: ProfileData) => {
      const newData: ProfileData = { ...prev, [field]: value };
      return newData;
    });
  };

  // Handle file uploads (photo and resume)
  interface FileUploadEvent extends React.ChangeEvent<HTMLInputElement> {
    target: HTMLInputElement & { files: FileList | null };
  }

  interface UploadedFile {
    name: string;
    size: number;
    type: string;
    lastModified: number;
  }

  const handleFileUpload = (field: 'photo' | 'resume', e: FileUploadEvent): void => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (field === 'photo') {
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        handleInputChange('photo', event.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else if (field === 'resume') {
      const uploadedFile: UploadedFile = {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      };
      handleInputChange('resume', uploadedFile);
    }
  };

  interface SkillsResponse {
    extracted_skills: string[];
  }

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const api = await axios.post<SkillsResponse>(
        'http://localhost:8000/extract-skills',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
   
      if (api.data?.extracted_skills) {
        // Fix 3: Ensure we're working with arrays before spreading
        const currentSkills = Array.isArray(profileData.skills) ? profileData.skills : [];
        const newSkills = Array.isArray(api.data.extracted_skills) ? api.data.extracted_skills : [];
        
        setProfileData(prev => ({
          ...prev,
          skills: [...new Set([...currentSkills, ...newSkills])] // Remove duplicates
        }));
        console.log(profileData.skills)
      } else {
        throw new Error('No skills were extracted from the resume');
      }

      // Store resume data
      const uploadedFile: UploadedFile = {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      };
      handleInputChange('resume', uploadedFile);
    } catch (err) {
      console.error('Error extracting skills:', err);
      alert(err instanceof Error ? err.message : 'Failed to process resume');
    }
  };

  // Add manual skill
  const addSkill = () => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      setProfileData(prev => ({
        ...prev,
        skills: [...(Array.isArray(prev.skills) ? prev.skills : []), newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  // Remove skill
  const removeSkill = (skillToRemove: string) => {
    setProfileData(prev => ({
      ...prev,
      skills: Array.isArray(prev.skills) 
        ? prev.skills.filter(skill => skill !== skillToRemove)
        : []
    }));
  };

  // Update skill
  const updateSkill = (oldSkill: string, newSkill: string) => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      setProfileData(prev => ({
        ...prev,
        skills: Array.isArray(prev.skills)
          ? prev.skills.map(skill => skill === oldSkill ? newSkill.trim() : skill)
          : [newSkill.trim()]
      }));
    }
  };

  // Experience CRUD operations
  const addExperience = () => {
    const newId: number = profileData.experience.length > 0
      ? Math.max(...profileData.experience.map((e: { id: number }) => e.id)) + 1
      : 1;

    setProfileData((prev: ProfileData) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          id: newId,
          company: '',
          position: '',
          duration: '',
          isEditing: true
        }
      ]
    }));
  };

  const updateExperience = (id: number, updates: Partial<{ company: string; position: string; duration: string; isEditing?: boolean }>) => {
    setProfileData((prev: ProfileData) => ({
      ...prev,
      experience: prev.experience.map(exp =>
        exp.id === id ? { ...exp, ...updates, isEditing: false } : exp
      )
    }));
  };

  const deleteExperience = (id: number): void => {
    setProfileData((prev: ProfileData) => ({
      ...prev,
      experience: prev.experience.filter((exp: { id: number }) => exp.id !== id)
    }));
  };

  // Fix 4: Don't render anything with localStorage until client-side
  if (!isClient) {
    return <div className="bg-gray-900 text-gray-100 rounded-xl p-6 min-h-full">Loading...</div>;
  }

  return (
    <div className="scroll-container overflow-y-auto pb-8 flex items-center justify-center min-h-screen text-white p-4 overflow-hidden bg-gray-900 text-gray-100 rounded-xl p-6 min-h-full relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-900 rounded-full filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/4"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-900 rounded-full filter blur-3xl opacity-20 translate-y-1/3 -translate-x-1/4"></div>

      <div className="relative z-10">
        <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent inline-block">Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Photo and basic info */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
            <div className="flex flex-col items-center mb-6">
              {profileData.photo ? (
                <img src={profileData.photo} alt="Profile" className="w-32 h-32 rounded-full object-cover border-2 border-purple-500" />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center border-2 border-purple-500">
                  <label className="cursor-pointer text-center">
                    <User size={40} className="mx-auto text-gray-400" />
                    <span className="text-xs block mt-1 text-gray-400">Add Photo</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleFileUpload('photo', e)}
                    />
                  </label>
                </div>
              )}

              {profileData.name ? (
                <h2 className="text-2xl font-bold mt-4">{profileData.name}</h2>
              ) : (
                <input
                  type="text"
                  placeholder="Your Name"
                  className="text-2xl font-bold mt-4 bg-transparent border-b border-gray-600 text-center focus:outline-none focus:border-purple-500"
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Date of Birth</label>
                {profileData.dob ? (
                  <p className="text-gray-200">{profileData.dob}</p>
                ) : (
                  <input
                    type="date"
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    onChange={(e) => handleInputChange('dob', e.target.value)}
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Location</label>
                {profileData.location ? (
                  <p className="text-gray-200">{profileData.location}</p>
                ) : (
                  <input
                    type="text"
                    placeholder="City, Country"
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    onChange={(e) => handleInputChange('location', e.target.value)}
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Resume</label>

                {profileData.resume && (
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-200 truncate flex-1">{profileData.resume.name}</span>
                    <button className="text-purple-400 hover:text-purple-300 ml-2">View</button>
                  </div>
                )}

                <label className="flex items-center justify-center w-full bg-gray-700 border border-gray-600 border-dashed rounded-md p-3 cursor-pointer hover:bg-gray-650">
                  <span className="text-gray-400">
                    {profileData.resume ? 'Update Resume' : 'Upload Resume'}
                  </span>
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

          {/* Middle column - User type selection and related content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
              <h3 className="text-xl font-semibold mb-4">I am a</h3>
              <div className="flex space-x-4">
                <label className="flex-1">
                  <input
                    type="radio"
                    name="userType"
                    value="employee"
                    checked={userType === 'employee'}
                    onChange={() => setUserType('employee')}
                    className="sr-only"
                  />
                  <div className={`cursor-pointer rounded-lg p-4 border ${userType === 'employee' ? 'border-purple-500 bg-gray-700' : 'border-gray-600 hover:bg-gray-750'}`}>
                    <Briefcase size={24} className={userType === 'employee' ? 'text-purple-400 mb-2' : 'text-gray-400 mb-2'} />
                    <h4 className="font-medium">Employee</h4>
                    <p className="text-sm text-gray-400 mt-1">I'm looking for job opportunities</p>
                  </div>
                </label>

                <label className="flex-1">
                  <input
                    type="radio"
                    name="userType"
                    value="student"
                    checked={userType === 'student'}
                    onChange={() => setUserType('student')}
                    className="sr-only"
                  />
                  <div className={`cursor-pointer rounded-lg p-4 border ${userType === 'student' ? 'border-purple-500 bg-gray-700' : 'border-gray-600 hover:bg-gray-750'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={userType === 'student' ? 'text-purple-400 mb-2' : 'text-gray-400 mb-2'}>
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                    </svg>
                    <h4 className="font-medium">Student</h4>
                    <p className="text-sm text-gray-400 mt-1">I'm enhancing my skills and learning</p>
                  </div>
                </label>
              </div>
            </div>

            {userType === 'employee' && (
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Experience</h3>
                    <button
                      onClick={addExperience}
                      className="bg-purple-600 hover:bg-purple-700 text-white py-1 px-3 rounded-md text-sm flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add
                    </button>
                  </div>

                  {profileData.experience?.length > 0 ? (
                    <div className="space-y-3">
                      {profileData.experience.map((exp: { id: number; company: string; position: string; duration: string; isEditing?: boolean }) => (
                        <div key={exp.id} className="p-3 rounded-lg bg-gray-750 border border-gray-600 relative group">
                          {exp.isEditing ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                placeholder="Position"
                                value={exp.position}
                                onChange={(e) => updateExperience(exp.id, { position: e.target.value })}
                                className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                              />
                              <input
                                type="text"
                                placeholder="Company"
                                value={exp.company}
                                onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                                className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                              />
                              <input
                                type="text"
                                placeholder="Duration (e.g., 2019-2023)"
                                value={exp.duration}
                                onChange={(e) => updateExperience(exp.id, { duration: e.target.value })}
                                className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                              />
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => deleteExperience(exp.id)}
                                  className="text-red-400 hover:text-red-300 text-sm"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => updateExperience(exp.id, { isEditing: false })}
                                  className="bg-purple-600 hover:bg-purple-700 text-white py-1 px-3 rounded-md text-sm"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                                <button
                                  onClick={() => updateExperience(exp.id, { isEditing: true })}
                                  className="text-gray-400 hover:text-gray-200 p-1"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => deleteExperience(exp.id)}
                                  className="text-gray-400 hover:text-red-400 p-1"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                              <h4 className="font-medium">{exp.position}</h4>
                              <p className="text-sm text-gray-400">{exp.company} • {exp.duration}</p>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 border border-dashed border-gray-600 rounded-lg">
                      <Briefcase size={24} className="text-gray-500 mb-2" />
                      <p className="text-gray-500">No experience added yet</p>
                      <button onClick={addExperience} className="mt-3 text-purple-400 hover:text-purple-300 text-sm">Add Experience</button>
                    </div>
                  )}
                </div>

                <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
                  <h3 className="text-xl font-semibold mb-4">Job Recommendations</h3>

                  {profileData.jobs?.length > 0 ? (
                    <div className="space-y-3">
                      {profileData.jobs.map((job: { id: number; title: string; company: string; location: string }) => (
                        <div key={job.id} className="p-4 rounded-lg bg-gray-750 border border-gray-600 hover:border-purple-500 transition-colors cursor-pointer">
                          <h4 className="font-medium text-white">{job.title}</h4>
                          <p className="text-sm text-gray-400">{job.company}</p>
                          <div className="flex items-center mt-2 text-xs text-gray-500">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {job.location}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 border border-dashed border-gray-600 rounded-lg">
                      <Search size={24} className="text-gray-500 mb-2" />
                      <p className="text-gray-500">No job recommendations yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Skills section - shown for both employee and student */}
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Skills</h3>
                <span className="text-xs text-purple-400">{profileData.skills?.length || 0} skills</span>
              </div>

              {/* Skills input */}
              <div className="flex mt-2 mb-3">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill"
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-l-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                />
                <button
                  onClick={addSkill}
                  className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-r-md"
                >
                  Add
                </button>
              </div>

              {/* Skills display */}
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
                        className="group flex items-center bg-gradient-to-r from-purple-700 to-purple-900 text-white text-sm px-3 py-1 rounded-full shadow-md"
                        whileHover={{ scale: 1.05 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: idx * 0.05 }}
                      >
                        <Code size={12} className="mr-1.5 text-purple-300" />
                        <span>{skill}</span>
                        <button
                          onClick={() => removeSkill(skill)}
                          className="ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          <X size={14} className="text-purple-200 hover:text-white" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <p className="text-sm text-gray-500 italic mt-2">
                  No skills added yet. Upload your resume or add them manually.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}