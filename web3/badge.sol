// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BadgeNFT is ERC721URIStorage, Ownable {
    uint256 public nextTokenId;
    mapping(address => mapping(string => uint256)) public userBadges; // Maps user address -> skill -> tokenId
    mapping(string => uint256[]) public skillBadges; // Maps skill -> array of tokenIds
    
    event BadgeMinted(address indexed to, string indexed skill, uint256 tokenId, string tokenURI);
    event BadgeRevoked(address indexed from, string indexed skill, uint256 tokenId);

    constructor(address initialOwner) ERC721("Skill Badge", "SBDG") Ownable(initialOwner) {
        nextTokenId = 1; // Start from 1 instead of 0
    }

    function mintBadge(address to, string memory skill, string memory tokenURI) public onlyOwner {
        require(bytes(tokenURI).length > 0, "Token URI should not be empty");
        require(userBadges[to][skill] == 0, "User already has this badge");

        uint256 tokenId = nextTokenId;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);

        userBadges[to][skill] = tokenId;
        skillBadges[skill].push(tokenId);
        
        emit BadgeMinted(to, skill, tokenId, tokenURI);
        nextTokenId++;
    }
    
    function revokeBadge(address from, string memory skill) public onlyOwner {
        uint256 tokenId = userBadges[from][skill];
        require(tokenId != 0, "User does not have this badge");
        
        _burn(tokenId);
        userBadges[from][skill] = 0;
        
        emit BadgeRevoked(from, skill, tokenId);
    }
    
    function hasBadge(address user, string memory skill) public view returns (bool) {
        return userBadges[user][skill] != 0;
    }
    
    function getSkillBadges(string memory skill) public view returns (uint256[] memory) {
        return skillBadges[skill];
    }
}