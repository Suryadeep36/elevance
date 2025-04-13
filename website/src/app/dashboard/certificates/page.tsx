"use client";
import React, { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { X, UploadCloud, Image as ImageIcon, Check, XCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import axios from "axios";
import { BrowserProvider } from "ethers";
import { ethers } from "ethers";
import { getBadgeContract } from "@/utils/badgeContract";
import { useAuth, UserProfile, useUser } from "@clerk/nextjs";
interface CourseResult {
  course_name: string;
  cluster: string;
}



interface VerificationResult {
  courses_found: CourseResult[];
  platform_verified: boolean;
  user_name_verified: boolean;
  valid_certificate: boolean;
  extracted_text: string;
  error?: string;
}

const badgeMetadataMap: Record<string, { skill: string; tokenURI: string }> = {
  "Machine Learning": {
    skill: "Machine Learning",
    tokenURI: "https://gateway.pinata.cloud/ipfs/bafkreibxxlgv4dphmpglmyic35fezeqm5icxvgtl7fxnp3jynr4ricwxzm",
  },
  "Frontend Developer": {
    skill: "Frontend Developer",
    tokenURI: "https://gateway.pinata.cloud/ipfs/bafkreiasduaedmvs4l2xvzyxbvfyd5uy7nmxfvy4gttt6kywo44oholudq",
  },
  "App Developer": {
    skill: "App Developer",
    tokenURI: "https://gateway.pinata.cloud/ipfs/bafkreie4rog6fes64w736yexqlvttdotfbro2ebgakyykknh7gxpvsdkoq",
  },
  "Backend Developer": {
    skill: "Backend Developer",
    tokenURI: "https://gateway.pinata.cloud/ipfs/bafkreia7alc4mgxjj54evueiomapt7p5umcnzq3yneu4wdldpc6lx34ys4",
  },
  "Cloud Dev": {
    skill: "Cloud Engineer",
    tokenURI: "https://gateway.pinata.cloud/ipfs/bafkreifhrsqusx3rd2nbaq2y22564uyf4bvslimvom6dx5xemjc23wtfra",
  },
};

const mintBadge = async (cluster: string) => {

  const metadata = badgeMetadataMap[cluster];
  if (!metadata) {
    alert(`No metadata found for cluster: ${cluster}`);
    return;
  }

  const provider = new ethers.BrowserProvider((window as any).ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  const userAddress = await signer.getAddress();

  const contract = getBadgeContract(signer);

  try {
    const tx = await contract.mintBadge(userAddress, metadata.skill, metadata.tokenURI);
    await tx.wait();
    alert("Badge minted successfully!");
  } catch (error) {
    console.error("Minting failed:", error);
    alert("Minting failed. Check console.");
  }
};

export default function Page() {
  const [files, setFiles] = useState<File[]>([]);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isLoaded, user } = useUser();
  const { userId } = useAuth()
  const handleFileUpload = (uploadedFiles: File[]) => {
    setFiles(uploadedFiles);
    setVerificationResult(null);
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    setVerificationResult(null);
  };

  const verifyCertificate = async () => {
    if (files.length === 0) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("certificate", files[0]);
      // formData.append("name", user?.fullName || "");
      formData.append("name", "Manil Modi");

      const response = await axios.post<VerificationResult>(
        "http://localhost:8000/verify-certificate",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );


      if (response.data.valid_certificate == true) {

        const clustor = response.data.courses_found[0].cluster;
        if (response.data.valid_certificate && response.data.platform_verified) {
          await mintBadge(clustor);
        }
        setVerificationResult(response.data);

        const newForm = new FormData()
        newForm.append('file', files[0]);
        if (!userId) {
          console.log('user id not found');
          return;
        }
        newForm.append('userId', userId);
        const urlObjet = await axios.post("/api/certificate", newForm);
        // Extract the URL from the response
        const certificateUrl = urlObjet.data?.url?.url;
        console.log(urlObjet)
        console.log(certificateUrl)
        await axios.put('/api/user/update', {
          certificates: [certificateUrl], // Send just the URL string
          clerk_Id: userId
        });


      }


    } catch (error) {
      console.error("Verification failed:", error);
      setVerificationResult({
        courses_found: [],
        platform_verified: false,
        user_name_verified: false,
        valid_certificate: false,
        extracted_text: "",
        error: "Verification failed. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxHeight: 'calc(100vh - 100px)' }} className="scroll-container overflow-auto w-full max-w-6xl mx-auto min-h-screen flex flex-col p-6 gap-6">
      {/* Main Content Area */}
      <div className="flex flex-1 gap-6">
        {/* Preview Section - Left Side */}
        <div className="flex-1">
          {files.length > 0 ? (
            <div className="w-full h-[60vh] relative border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl overflow-hidden bg-neutral-50 dark:bg-neutral-900/50">
              {files.map((file, index) => (
                <div key={index} className="relative w-full h-full">
                  {file.type.startsWith("image/") ? (
                    <>
                      <Image
                        src={URL.createObjectURL(file)}
                        alt="Preview"
                        fill
                        className="object-contain"
                      />
                      <button
                        onClick={() => removeFile(index)}
                        className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition shadow-lg"
                      >
                        <X size={18} />
                      </button>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6">
                      <div className="text-xl font-bold text-neutral-700 dark:text-neutral-300">
                        {file.name}
                      </div>
                      <div className="text-md text-neutral-500 mt-2">
                        {(file.size / 1024).toFixed(2)} KB
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="mt-4 flex items-center gap-2 text-md px-4 py-2 bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-500/20 transition"
                      >
                        <X size={16} /> Remove File
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full h-[60vh] border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-900/50">
              <ImageIcon className="w-16 h-16 text-neutral-400 dark:text-neutral-600 mb-4" />
              <h3 className="text-xl font-medium text-neutral-500 dark:text-neutral-400">
                No Preview Available
              </h3>
              <p className="text-neutral-400 dark:text-neutral-500 mt-2">
                Upload a file to see preview
              </p>
            </div>
          )}
        </div>

        {/* File Upload Section - Top Right */}
        <div className="absolute top-6 right-6">
          <div className="w-[280px] border border-dashed bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 rounded-xl p-4 shadow-lg">
            <FileUpload onChange={handleFileUpload} />
          </div>
        </div>
      </div>

      {/* Verification Results */}
      {verificationResult && (
        <div className="mt-4 p-6 border rounded-lg bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            {verificationResult.valid_certificate ? (
              <Check className="text-green-500" size={20} />
            ) : (
              <XCircle className="text-red-500" size={20} />
            )}
            Certificate Verification Results
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-500">Username Verified:</span>
                <span className={`font-medium ${verificationResult.user_name_verified ? 'text-green-500' : 'text-red-500'
                  }`}>
                  {verificationResult.user_name_verified ? 'Verified' : 'Not Found'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Platform Verified:</span>
                <span className={`font-medium ${verificationResult.platform_verified ? 'text-green-500' : 'text-red-500'
                  }`}>
                  {verificationResult.platform_verified ? 'Verified' : 'Not Found'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-500">Certificate Status:</span>
                <span className={`font-medium ${verificationResult.valid_certificate ? 'text-green-500' : 'text-red-500'
                  }`}>
                  {verificationResult.valid_certificate ? 'Valid' : 'Invalid'}
                </span>
              </div>
            </div>
          </div>

          {verificationResult.courses_found.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-neutral-500 mb-2">Courses Found:</h4>
              <ul className="space-y-1">
                {verificationResult.courses_found.map((course, index) => (
                  <li key={index} className="text-sm">
                    • {course.course_name} ({course.cluster})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {verificationResult.error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded text-red-600 dark:text-red-300">
              {verificationResult.error}
            </div>
          )}

          {verificationResult.extracted_text && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-neutral-500 mb-2">Extracted Text:</h4>
              <div className="text-sm bg-neutral-50 dark:bg-neutral-800 p-3 rounded overflow-auto max-h-40">
                {verificationResult.extracted_text}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Verify Button - Bottom Right */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={verifyCertificate}
          disabled={files.length === 0 || isLoading}
          className={`flex items-center gap-2 px-6 py-3 rounded-full text-white font-medium shadow-lg transition-all
            ${files.length > 0 && !isLoading
              ? 'bg-green-600 hover:bg-green-700 hover:shadow-xl transform hover:-translate-y-1'
              : 'bg-neutral-400 dark:bg-neutral-700 cursor-not-allowed'
            }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Verifying...
            </>
          ) : (
            <>
              <Check size={20} />
              Verify Certificate
            </>
          )}
        </button>
      </div>
    </div>
  );
}