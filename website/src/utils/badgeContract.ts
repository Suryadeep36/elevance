import { ethers } from "ethers";
import BadgeNFTABI from "@/utils/abi.json"; 

const contractAddress = "0x0333C9bC99C768b45A5221E62cBf479ddb2001B5"; 

export const getBadgeContract = (signerOrProvider: any) => {
  return new ethers.Contract(contractAddress, BadgeNFTABI, signerOrProvider);
};
