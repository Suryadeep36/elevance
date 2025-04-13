import { ethers } from "ethers";
import BadgeNFTABI from "@/utils/abi.json"; 

const contractAddress = "0xc695500d805FE92557303120E5b392d15c2B3E52"; 

export const getBadgeContract = (signerOrProvider: any) => {
  return new ethers.Contract(contractAddress, BadgeNFTABI, signerOrProvider);
};
