// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;


contract  simpleIPFS{
    mapping(string => string) Files;
    
    /// Set the value of a stock
    function storeHash(string memory fileName, string memory fileHash) public {
        Files[fileName] = fileHash;
        }
    
    /// Get the value of a stock
    function getHash(string memory fileName) public view returns (string memory) {
        return Files[fileName];
        }
}
