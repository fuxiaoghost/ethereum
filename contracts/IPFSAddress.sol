pragma solidity ^0.4.21;

contract IPFSAddress {
    mapping(address => bytes32) public bytesIpfs;
    mapping (address=>string) public stringIpfs;
    
    // save as bytes32
    function saveBytes(bytes32 ipfs) public {
        bytesIpfs[msg.sender] = ipfs;
    }
    
    // save as string 
    function saveString(string ipfs) public {
        stringIpfs[msg.sender] = ipfs;
    }
}
