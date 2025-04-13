// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BadgeNFT is ERC721URIStorage, Ownable {
    uint256 public nextTokenId;
    mapping(address => mapping(string => uint256)) public userBadges; // Maps user address -> skill -> tokenId
    mapping(string => uint256[]) public skillBadges; // Maps skill -> array of tokenIds

    event BadgeMinted(address indexed to, string indexed skill, uint256 tokenId, string tokenURI);

    constructor(address initialOwner) ERC721("Skill Badge", "SBDG") Ownable(initialOwner) {
        nextTokenId = 1; // Start from 1 instead of 0
    }

   function mintBadge(address to, string memory skill) public onlyOwner {
        string memory tokenURI;

        // Map skill to the correct IPFS URL
        if (keccak256(abi.encodePacked(skill)) == keccak256(abi.encodePacked("Web Developer"))) {
            tokenURI = "https://gateway.pinata.cloud/ipfs/bafkreid7ynhgat725ymwjx2oijltcyabottskoxeuiwxigwitw6tz2lnli";  // Replace with actual CID for Web Dev badge
        } else if (keccak256(abi.encodePacked(skill)) == keccak256(abi.encodePacked("App Developer"))) {
            tokenURI = "https://gateway.pinata.cloud/ipfs/bafkreibu5n7fj4wvs6vsl5kzgztr2rj3xufs2kryxxzyqxmeib2vngpw24";  // Replace with actual CID for App Dev badge
        } else if (keccak256(abi.encodePacked(skill)) == keccak256(abi.encodePacked("Machine Learning"))) {
            tokenURI = "https://gateway.pinata.cloud/ipfs/bafkreibxxlgv4dphmpglmyic35fezeqm5icxvgtl7fxnp3jynr4ricwxzm";  // Replace with actual CID for ML badge
        } else if (keccak256(abi.encodePacked(skill)) == keccak256(abi.encodePacked("Cloud Engineer"))) {
            tokenURI = "https://gateway.pinata.cloud/ipfs/bafkreigwi7lcc6rrpu4vurf7agztb6vmdqsk556au4xymlxmo3hswgmi24";  // Replace with actual CID for Cloud/DevOps badge
        } else if (keccak256(abi.encodePacked(skill)) == keccak256(abi.encodePacked("Cybersecurity Engineer"))) {
            tokenURI = "https://gateway.pinata.cloud/ipfs/bafkreiat3tkr2p5w33vnnqnhqv5hcgwqwdna23mbgukh2v2vrwhdjmjyfm";  // Replace with actual CID for Cybersecurity badge
        } else {
            revert("Unknown skill");
        }
    


        uint256 tokenId = nextTokenId;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);

        userBadges[to][skill] = tokenId;
        skillBadges[skill].push(tokenId);

        emit BadgeMinted(to, skill, tokenId, tokenURI);
        nextTokenId++;
    }

    function hasBadge(address user, string memory skill) public view returns (bool) {
        return userBadges[user][skill] != 0;
    }

    function getSkillBadges(string memory skill) public view returns (uint256[] memory) {
        return skillBadges[skill];
    }
}
