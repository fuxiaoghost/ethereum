pragma solidity ^0.4.21;

contract IPFSAddress {
    mapping(address => bytes32) public bytesIpfs;
    mapping (address=>string) public stringIpfs;
    
    function saveBytes(bytes32 ipfs) public {
        bytesIpfs[msg.sender] = ipfs;
    }
    
    function saveString(string ipfs) public {
        stringIpfs[msg.sender] = ipfs;
    }
}
