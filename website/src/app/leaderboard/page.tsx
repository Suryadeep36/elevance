"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { ethers } from "ethers";
import { getBadgeContract } from "@/utils/badgeContract";
import axios from 'axios';
// Define TypeScript interfaces
interface User {
  username: string;
  badges: number;
  clusters: string[];
}

interface ClusterColors {
  [key: string]: string;
}
interface FetchBadge {
  name: string;
  imgUrl: string
}


// Map cluster names to colors
const clusterColors: ClusterColors = {
  'Cloud Engineer': 'bg-blue-500',
  'Web Developer': 'bg-purple-500',
  'Machine Learning': 'bg-green-500',
  'App Developer': 'bg-orange-500',
  'Cybersecurity Engineer': 'bg-red-500',
};



const Leaderboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);


  useEffect(() => {
    const fetchBadges = async (userAddress: string): Promise<FetchBadge[]> => {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = getBadgeContract(signer);

      const newBadges: FetchBadge[] = [];
      const allBadges = ['Web Developer', 'App Developer', 'Machine Learning', 'Cloud Engineer', 'Cybersecurity Engineer'];
      const skillToImageMap: Record<string, string> = {
        "Web Developer": "https://gateway.pinata.cloud/ipfs/bafybeicyd3lbzjrh7ty6ywgejwhsmfoafajwg2jhfn66cnd456uaioaae4",
        "App Developer": "https://gateway.pinata.cloud/ipfs/bafkreib7scz6va5kldas2yvudtedizua4avp3axlssgxisbff5czk6cbmm",
        "Machine Learning": "https://gateway.pinata.cloud/ipfs/bafkreif5rb6xsxhdrqi2afwbjvj3jhf4nyn65yehekmgsccu435g6yxidi",
        "Cloud Engineer": "https://gateway.pinata.cloud/ipfs/bafkreihbfzwzbvo2qp7ra7fq2kk5j6mhxbv3ced5fkebtolnr7binjrb4i",
        "Cybersecurity Engineer": "https://gateway.pinata.cloud/ipfs/bafkreigu7ulweobgswi5z4hi44gjkn42u3j7fi73xh46ppjgfzrclov47q",
      };

      for (const badge of allBadges) {
        const hasBadge = await contract.hasBadge(userAddress, badge);
        if (hasBadge) {
          newBadges.push({ name: badge, imgUrl: skillToImageMap[badge] });
        }
      }

      return newBadges;
    };

    const fetchAllUsersWithBadges = async () => {
      try {
        if (!(window as any).ethereum) {
          console.warn('MetaMask not available');
          return;
        }

        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const signer = await provider.getSigner();
        const currentAddress = await signer.getAddress();

        if (!currentAddress) {
          console.warn("No wallet address found");
          return;
        }

        const response = await axios.get('/api/user/getAll');
        if (response.data.success) {
          const enrichedUsers = [];

          for (const user of response.data.allUsers) {
            if (!user.metamaskAddress) continue;
            const badges = await fetchBadges(user.metamaskAddress);
            const clusters = badges.map(badge => badge.name);
            enrichedUsers.push({
              username: user.username,
              badges: badges.length,
              clusters,
            });
          }
          enrichedUsers.sort((a, b) => b.badges - a.badges);
          setUsers(enrichedUsers);
          console.log(enrichedUsers)
        }
      } catch (error) {
        console.error("Error fetching users with badges:", error);
      }
    };

    fetchAllUsersWithBadges();
  }, []);


  useEffect(() => {
    const results = users.filter(user =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(results);
  }, [searchTerm, users]);

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg shadow-xl w-full max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='mt-20 mb-10'
      >
        <h1 className="text-3xl font-bold mb-6 text-center">Skill Master Leaderboard</h1>

        {/* Search Bar */}
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="bg-gray-800 text-white pl-10 pr-4 py-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search by username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Leaderboard */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-12 bg-gray-700 p-4 text-gray-300 font-semibold">
            <div className="col-span-1 text-center">#</div>
            <div className="col-span-3">Username</div>
            <div className="col-span-2 text-center">Badges</div>
            <div className="col-span-6">Skill Clusters</div>
          </div>

          {/* User List */}
          <AnimatePresence>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`grid grid-cols-12 p-4 items-center ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'} hover:bg-gray-700 transition-colors duration-150`}
                >
                  <div className="col-span-1 text-center font-semibold text-lg text-gray-400">{index + 1}</div>
                  <div className="col-span-3 font-medium text-blue-400">{user.username}</div>
                  <motion.div
                    className="col-span-2 text-center font-bold text-yellow-500"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {user.badges}
                  </motion.div>
                  <div className="col-span-6 flex flex-wrap gap-2">
                    {user.clusters.map((cluster, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 + i * 0.1 }}
                        className={`${clusterColors[cluster]} px-2 py-1 rounded-full text-xs font-medium`}
                      >
                        {cluster}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-8 text-center text-gray-400"
              >
                No users found matching "{searchTerm}"
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Leaderboard;