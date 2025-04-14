import { ethers } from "ethers";
import BadgeNFTABI from "@/utils/abi.json"; 

const contractAddress = "0xbFEb885369b29442188609f15963623466A96002"; 

export const getBadgeContract = (signerOrProvider: any) => {
  return new ethers.Contract(contractAddress, BadgeNFTABI, signerOrProvider);
};
