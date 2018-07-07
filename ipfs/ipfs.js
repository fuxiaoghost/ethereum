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
        console.log(dagNode.serialized);
        console.log(dagNode.multihash);
        console.log(json.multihash);
    });
}

function customHash(filePath) {
    // 读取文件Buffer
    var buffer = fs.readFileSync(filePath);

    // 转为Unix File System
    const unixFs = new Unixfs('file', buffer).marshal();

    // 添加tag
    let tag = Buffer.from([10])
    
    // 添加size
    let size = Buffer.from([unixFs.length]);
    var newBuffer = Buffer.concat([tag, size, unixFs]);

    // sha256
    let sha256 = crypto.createHash('sha256').update(newBuffer).digest();

    // multihash
    let multihash = multihashes.encode(sha256, 'sha2-256');

    // base58
    let base58 = bs58.encode(multihash).toString('hex');
    console.log(newBuffer);
    console.log(multihash);
    console.log(base58);
}

ipfsHash('/Users/Kirn/Documents/Workspace/Dawn/ethereum/assets/test.txt');
customHash('/Users/Kirn/Documents/Workspace/Dawn/ethereum/assets/test.txt');