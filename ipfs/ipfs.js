import crypto from 'crypto';
import fs from 'fs';
import bs58 from 'bs58';
import multihashes from 'multihashes';
import Unixfs from 'ipfs-unixfs';
import {DAGNode} from 'ipld-dag-pb';


function ipfsHash(filePath) {
    var buffer = fs.readFileSync(filePath);
    const unixFs = new Unixfs('file', buffer);
    DAGNode.create(unixFs.marshal(), (err, dagNode) => {
        let json = dagNode.toJSON();
        console.log("File:0x" + buffer.toString('hex'));
        console.log("UnixFs:0x" + unixFs.marshal().toString('hex'));
        console.log("Header+UnixFS:0x" + dagNode.serialized.toString('hex'));
        console.log("Multihash:0x" + dagNode.multihash.toString('hex'));
        console.log("Address:" + json.multihash);
        console.log("---------------------------------------------------------------------");
    });
}

function customHash(filePath) {
    // 读取文件Buffer
    var buffer = fs.readFileSync(filePath);

    // 转为Unix File System
    const unixFs = new Unixfs('file', buffer).marshal();

    // 添加tag
    let tag = Buffer.from([10])
    
    // 添加File Size
    let size = Buffer.from([unixFs.length]);
    var newBuffer = Buffer.concat([tag, size, unixFs]);

    // sha2-256
    let sha256 = crypto.createHash('sha256').update(newBuffer).digest();

    // multihash
    let multihash = multihashes.encode(sha256, 'sha2-256');

    // base58
    let base58 = bs58.encode(multihash).toString('hex');
    console.log("File:0x" + buffer.toString('hex'));
    console.log("UnixFs:0x" + unixFs.toString('hex'));
    console.log("Header+UnixFS:0x" + newBuffer.toString('hex'));
    console.log("Sha256:0x" + sha256.toString('hex'));
    console.log("Multihash:0x" + multihash.toString('hex'));
    console.log("Address:" + base58);
    console.log("---------------------------------------------------------------------");
}

ipfsHash('/Users/Kirn/Documents/Workspace/Dawn/ethereum/assets/test.txt');
customHash('/Users/Kirn/Documents/Workspace/Dawn/ethereum/assets/test.txt');