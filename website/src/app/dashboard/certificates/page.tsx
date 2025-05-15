"use client";
import React, { useEffect, useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { X, UploadCloud, Image as ImageIcon, Check, XCircle, Loader2, Download } from "lucide-react";
import Image from "next/image";
import axios from "axios";
import { ethers } from "ethers";
import { getBadgeContract } from "@/utils/badgeContract";
import { useAuth, useUser } from "@clerk/nextjs";

declare global {
  interface Window {
    ethereum?: any;
  }
}

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
    tokenURI: "https://gateway.pinata.cloud/ipfs/bafkreih5oo7rilmctthdylxwrtxt7u5cfwhvvw5noeubc52cjbpmiqe2ya",
  },
  "Web Development": {
    skill: "Web Developer",
    tokenURI: "https://gateway.pinata.cloud/ipfs/bafkreid7ynhgat725ymwjx2oijltcyabottskoxeuiwxigwitw6tz2lnli",
  },
  "App Development": {
    skill: "App Developer",
    tokenURI: "https://gateway.pinata.cloud/ipfs/bafkreibu5n7fj4wvs6vsl5kzgztr2rj3xufs2kryxxzyqxmeib2vngpw24",
  },
  "Cyber Security": {
    skill: "Cybersecurity Engineer",
    tokenURI: "https://gateway.pinata.cloud/ipfs/bafkreiat3tkr2p5w33vnnqnhqv5hcgwqwdna23mbgukh2v2vrwhdjmjyfm",
  },
  "Cloud Computing": {
    skill: "Cloud Engineer",
    tokenURI: "https://gateway.pinata.cloud/ipfs/bafkreigwi7lcc6rrpu4vurf7agztb6vmdqsk556au4xymlxmo3hswgmi24",
  },
};

const mintBadge = async (cluster: string, user: any) => {
  if (!window.ethereum) {
    alert("Please install MetaMask to mint badges!");
    return false;
  }

  const metadata = badgeMetadataMap[cluster];
  if (!metadata) {
    alert(`No metadata found for cluster: ${cluster}`);
    return false;
  }

  if (!(window as any).ethereum) {
    alert("MetaMask is not installed.");
    return;
  }

  try {
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();

    const skill = metadata.skill;
    const contract = getBadgeContract(signer);

    const hasBadge = await contract.hasBadge(userAddress, skill);
    if (hasBadge) {
      alert("Badge already minted.");
      return;
    }

    await contract.mintBadge(userAddress, skill);
    alert("Badge minted successfully!");

  } catch (error) {
    console.error("Minting failed:", error);
    alert("Failed to mint badge. See console for more info.");
  }
};

export default function Page() {
  const [hasMetaMask, setHasMetaMask] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [contractError, setContractError] = useState<string | null>(null);
  const { isLoaded, user } = useUser();
  const { isSignedIn, userId } = useAuth();
  const [username, setUsername] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMinting, setIsMinting] = useState(false);

  useEffect(() => {
    setHasMetaMask(typeof window.ethereum !== "undefined");
    
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      checkConnectedWallet();
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  useEffect(() => {
    if (isLoaded && isSignedIn && user?.fullName) {
      setUsername(user.fullName);
    }
  }, [isLoaded, isSignedIn, user]);

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setIsWalletConnected(false);
      setWalletAddress("");
    } else {
      setWalletAddress(accounts[0]);
    }
  };

  const checkConnectedWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_accounts", []);
        if (accounts.length > 0) {
          setIsWalletConnected(true);
          setWalletAddress(accounts[0]);
        }
      } catch (error) {
        console.error("Error checking connected wallet:", error);
      }
    }
  };

  const connectMetaMask = async () => {
    if (!hasMetaMask) {
      window.open("https://metamask.io/download.html", "_blank");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setIsWalletConnected(true);
      setWalletAddress(accounts[0]);
    } catch (error) {
      console.error("Failed to connect MetaMask:", error);
      alert("Failed to connect wallet. Please try again.");
    }
  };

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
    setContractError(null);
    
    try {
      const formData = new FormData();
      formData.append("certificate", files[0]);
      formData.append("name", username);

      const response = await axios.post<VerificationResult>(
        "http://localhost:8000/verify-certificate",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.data.valid_certificate) {
        setVerificationResult(response.data);

        // Save certificate to database
        const newForm = new FormData();
        newForm.append('file', files[0]);
        newForm.append('userId', userId || "");
        const urlResponse = await axios.post("/api/certificate", newForm);
        const certificateUrl = urlResponse.data?.url?.url;
        
        await axios.put('/api/user/update', {
          certificates: [certificateUrl],
          clerk_Id: userId
        });

        console.log("updated ");

        // Mint badge if eligible
        if (response.data.platform_verified && isWalletConnected) {
          setIsMinting(true);
          try {
            const cluster = response.data.courses_found[0].cluster;
            const success = await mintBadge(cluster, username);
            if (success) {
              alert('Badge minted successfully!');
            }
          } catch (error) {
            console.error("Minting error:", error);
            setContractError("Failed to interact with the badge contract. Please try again.");
          } finally {
            setIsMinting(false);
          }
        }
      } else {
        setVerificationResult(response.data);
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
      {/* Wallet Connection Status */}
      <div className="absolute top-4 left-4">
        {hasMetaMask ? (
          isWalletConnected ? (
            <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">
                {`${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`}
              </span>
            </div>
          ) : (
            <button
              onClick={connectMetaMask}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full transition"
            >
              <Image 
                src="/metamask.svg" 
                alt="MetaMask" 
                width={20} 
                height={20} 
                className="w-5 h-5"
              />
              Connect Wallet
            </button>
          )
        ) : (
          <button
            onClick={() => window.open("https://metamask.io/download.html", "_blank")}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-full transition"
          >
            <Download size={16} />
            Install MetaMask
          </button>
        )}
      </div>

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
                <span className={`font-medium ${
                  verificationResult.user_name_verified ? 'text-green-500' : 'text-red-500'
                }`}>
                  {verificationResult.user_name_verified ? 'Verified' : 'Not Found'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Platform Verified:</span>
                <span className={`font-medium ${
                  verificationResult.platform_verified ? 'text-green-500' : 'text-red-500'
                }`}>
                  {verificationResult.platform_verified ? 'Verified' : 'Not Found'}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-500">Certificate Status:</span>
                <span className={`font-medium ${
                  verificationResult.valid_certificate ? 'text-green-500' : 'text-red-500'
                }`}>
                  {verificationResult.valid_certificate ? 'Valid' : 'Invalid'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Wallet Connected:</span>
                <span className={`font-medium ${
                  isWalletConnected ? 'text-green-500' : 'text-yellow-500'
                }`}>
                  {isWalletConnected ? 'Connected' : 'Not Connected'}
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

          {contractError && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded text-red-600 dark:text-red-300">
              {contractError}
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

          {verificationResult.valid_certificate && verificationResult.platform_verified && !isWalletConnected && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded text-yellow-700 dark:text-yellow-300">
              <p>Connect your wallet to mint a badge for this certificate!</p>
              <button
                onClick={connectMetaMask}
                className="mt-2 flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition"
              >
                {hasMetaMask ? (
                  <>
                    <Image 
                      src="/metamask.svg" 
                      alt="MetaMask" 
                      width={16} 
                      height={16} 
                    />
                    Connect MetaMask
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Install MetaMask
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons - Bottom Right */}
      <div className="fixed bottom-6 right-6 flex gap-4">
        {!isWalletConnected && hasMetaMask && (
          <button
            onClick={connectMetaMask}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg transition-all"
          >
            <Image 
              src="/metamask.svg" 
              alt="MetaMask" 
              width={20} 
              height={20} 
            />
            Connect Wallet
          </button>
        )}

        <button
          onClick={verifyCertificate}
          disabled={files.length === 0 || isLoading || isMinting}
          className={`flex items-center gap-2 px-6 py-3 rounded-full text-white font-medium shadow-lg transition-all
            ${files.length > 0 && !isLoading && !isMinting
              ? 'bg-green-600 hover:bg-green-700 hover:shadow-xl transform hover:-translate-y-1'
              : 'bg-neutral-400 dark:bg-neutral-700 cursor-not-allowed'
            }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Verifying...
            </>
          ) : isMinting ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Minting...
            </>
          ) : (
            <>
              <Check size={20} />
              Verify Certificate
            </>
          )}
        </button>
      </div>

      {/* MetaMask Required Notice */}
      {!hasMetaMask && (
        <div className="fixed bottom-4 left-[20%] p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-yellow-800 dark:text-yellow-200 max-w-md">
          <p className="font-medium">MetaMask Required</p>
          <p>To mint badges for your certificates, you need to install the MetaMask wallet extension.</p>
          <button 
            onClick={() => window.open("https://metamask.io/download.html", "_blank")}
            className="mt-2 flex items-center gap-2 text-blue-600 dark:text-blue-400 underline"
          >
            <Download size={16} />
            Download MetaMask
          </button>
        </div>
      )}
    </div>
  );
}