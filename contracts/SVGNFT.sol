// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "base64-sol/base64.sol";

/*
ERC721URIStorage is the same as the normal ERC721 with just some additional functions.

 */

contract SVGNFT is ERC721URIStorage {
 uint public tokenCounter;

 event CreatedSVGNFT(uint indexed tokenId, string tokenURI);

    constructor() ERC721("SVGNFT", "svgNFT") {tokenCounter = 0;}

    function create(string memory svg) public {
     _safeMint(msg.sender, tokenCounter);
     string memory imageURI = svgToImageURI(svg);
     string memory tokenURI = formatTokenURI(imageURI);
     _setTokenURI(tokenCounter, tokenURI);

     tokenCounter = tokenCounter + 1;

     emit CreatedSVGNFT(tokenCounter, tokenURI);
    }


    function svgToImageURI(string memory svg) public pure returns (string memory){
      string memory baseURL = "data:image/svg+xml;base64,";
      string memory svgBase64Encoded = Base64.encode(abi.encodePacked(svg));

      string memory imageURI = string(abi.encodePacked(baseURL, svgBase64Encoded));

      return imageURI;

    }

    function formatTokenURI(string memory imageURI) public pure returns (string memory){
     bytes memory json = abi.encodePacked('{"name": "SVG NFT", "description": "An NFT based on SVG!", "attributes": "", "image": "', imageURI, '"}');
     string memory jsonBase64Encoded = Base64.encode(json);
     string memory baseURL = "data:application/json;base64,";
     string memory tokenURI = string(abi.encodePacked(baseURL, jsonBase64Encoded));

     return tokenURI;
    }
}
