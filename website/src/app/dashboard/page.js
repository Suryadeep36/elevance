// app/dashboard/page.js
"use client";

import { useState } from 'react';
import { User, Search, Briefcase, Network, LogOut } from 'lucide-react';

export default function DashboardPage() {
  return (
    <ProfilePage />
  );
}



function ProfilePage() {
  const [userType, setUserType] = useState('');
  const [profileData, setProfileData] = useState({
    name: 'Alex Morgan',
    dob: '1992-05-15',
    location: 'San Francisco, CA',
    resume: null,
    photo: null,
    experience: [
      { id: 1, company: 'TechCorp', position: 'Senior Developer', duration: '2019-2023' }
    ],
    jobs: [
      { id: 1, title: 'Frontend Developer', company: 'Innovate Inc.', location: 'Remote' },
      { id: 2, title: 'UX Designer', company: 'Creative Studio', location: 'New York' }
    ]
  });
  
  const handleInputChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-gray-900 text-gray-100 rounded-xl p-6 min-h-full relative overflow-hidden">
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
                    <input type="file" className="hidden" onChange={(e) => handleInputChange('photo', URL.createObjectURL(e.target.files[0]))} />
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
                {profileData.resume ? (
                  <div className="flex items-center">
                    <span className="text-gray-200 truncate flex-1">{profileData.resume.name}</span>
                    <button className="text-purple-400 hover:text-purple-300 ml-2">View</button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center w-full bg-gray-700 border border-gray-600 border-dashed rounded-md p-3 cursor-pointer hover:bg-gray-650">
                    <span className="text-gray-400">Upload Resume</span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleInputChange('resume', e.target.files[0])}
                    />
                  </label>
                )}
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
                    <button className="bg-purple-600 hover:bg-purple-700 text-white py-1 px-3 rounded-md text-sm flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add
                    </button>
                  </div>
                  
                  {profileData.experience.length > 0 ? (
                    <div className="space-y-3">
                      {profileData.experience.map(exp => (
                        <div key={exp.id} className="p-3 rounded-lg bg-gray-750 border border-gray-600 relative group">
                          <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="text-gray-400 hover:text-gray-200 p-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                          </div>
                          <h4 className="font-medium">{exp.position}</h4>
                          <p className="text-sm text-gray-400">{exp.company} • {exp.duration}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 border border-dashed border-gray-600 rounded-lg">
                      <Briefcase size={24} className="text-gray-500 mb-2" />
                      <p className="text-gray-500">No experience added yet</p>
                      <button className="mt-3 text-purple-400 hover:text-purple-300 text-sm">Add Experience</button>
                    </div>
                  )}
                </div>
                
                <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
                  <h3 className="text-xl font-semibold mb-4">Job Recommendations</h3>
                  
                  {profileData.jobs.length > 0 ? (
                    <div className="space-y-3">
                      {profileData.jobs.map(job => (
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
            
            {userType === 'student' && (
              <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
                <h3 className="text-xl font-semibold mb-4">Education & Skills</h3>
                <div className="flex flex-col items-center justify-center p-6 border border-dashed border-gray-600 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mb-2">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                    <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                  </svg>
                  <p className="text-gray-500">Add your education details</p>
                  <button className="mt-3 text-purple-400 hover:text-purple-300 text-sm">Add Education</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}