import { randomBytes } from 'crypto';
import secp256k1 from 'secp256k1';
import createKeccakHash from 'keccak';
import util from 'ethjs-util';
import BN from 'bn.js';
import EthereumTx from 'ethereumjs-tx';

/**
 * 私钥：secp256k1(ECDSA)生成私钥(256 bits 随机数/32位)
 */
function generatePrivateKey() {
    var privateKey = null;
    do {
        privateKey = randomBytes(32)

    } while (!secp256k1.privateKeyVerify(privateKey));
    return privateKey;
}

/**
 * secp256k1(ECDSA)通过私钥生成公钥
 * @param {string} privateKey 私钥
 * @param {boolean} compressed 是否为压缩格式
 */
function generatePublicKey(privateKey, compressed = false) {
    let publicKey = secp256k1.publicKeyCreate(privateKey, compressed);
    return publicKey;
}

/**
 * 地址：公钥的keccak256编码的后20字节，16进制编码的字符串
 * @param {string} publicKey 公钥
 */
function generateAddress(publicKey) {
    return createKeccakHash('keccak256').update(publicKey.slice(1)).digest('hex').slice(-40);
}

/**
 * 导入16进制编码的私钥 
 * @param {string} hexString 16进制编码的私钥
 */
function loadPrivateKeyFromHexString(hexString) {
    if (hexString.slice(0, 2) == '0x') {
        hexString = hexString.slice(2);
    }
    if (hexString.length != 64) {
        return null;
    }
    return new Buffer(hexString, 'hex')
}

/**
 * 各种类型数据转buffer
 * @param {*} v 数据
 */
function bufferFrom(v) {
    if (!Buffer.isBuffer(v)) {
        if (Array.isArray(v)) {
            v = Buffer.from(v)
        } else if (typeof v === 'string') {
            if (util.isHexString(v)) {
                v = Buffer.from(util.padToEven(util.stripHexPrefix(v)), 'hex')
            } else {
                v = Buffer.from(v)
            }
        } else if (typeof v === 'number') {
            v = util.intToBuffer(v)
        } else if (v === null || v === undefined) {
            v = Buffer.allocUnsafe(0)
        } else if (BN.isBN(v)) {
            v = v.toArrayLike(Buffer)
        } else if (v.toArray) {
            // converts a BN to a Buffer
            v = Buffer.from(v.toArray())
        } else {
            throw new Error('invalid type')
        }
    }
    return v
}

/**
 * secp256k1数据签名
 * @param {*} msg 需要签名的数据
 * @param {Buffer} privateKeyBuffer 私钥Buffer
 */
function sign(msg, privateKeyBuffer) {
    if (!secp256k1.privateKeyVerify(privateKey)) {
        console.log("Invalid private key！");
        return null;
    }
    // 生成需要签名数据的keccak256哈希
    let hash = createKeccakHash('keccak256').update(msg).digest();
    let sig = secp256k1.sign(hash, privateKeyBuffer);
    let ret = {};
    // 分离签名得到r,s,v
    ret.r = sig.signature.slice(0, 32);
    ret.s = sig.signature.slice(32, 64);
    ret.v = sig.recovery;
    return ret;
}

/**
 * 通过签名和原始数据恢复公钥
 * @param {*} r signature[0-32)
 * @param {*} s signature(32,64]
 * @param {*} v recovery(0 or 1)
 * @param {*} msg 原始数据
 */
function recovery(r, s, v, msg) {
    let signature = Buffer.concat([bufferFrom(r), bufferFrom(s)], 64)
    let recovery = v;
    if (recovery !== 0 && recovery !== 1) {
        throw new Error('Invalid signature v value')
    }
    let hash = createKeccakHash('keccak256').update(msg).digest();
    let senderPubKey = secp256k1.recover(hash, signature, recovery);
    return secp256k1.publicKeyConvert(senderPubKey, false);
}

/**
 * 
 * @param {*} msg 原始数据
 * @param {*} r signature[0-32)
 * @param {*} s signature(32,64]
 * @param {*} pubKeyBuffer 公钥
 */
function verify(msg, r, s, pubKeyBuffer) {
    let signature = Buffer.concat([bufferFrom(r), bufferFrom(s)], 64)
    let hash = createKeccakHash('keccak256').update(msg).digest();
    return secp256k1.verify(hash, signature, pubKeyBuffer);
}

/**
 * 拼接签名
 * @param {Object} ret 
 */
function signBuffer(ret) {
    return Buffer.concat([
        bufferFrom(ret.r),
        bufferFrom(ret.s),
        bufferFrom(ret.v)
    ]);
}

/**
 * 交易签名并序列化
 * @param {Buffer} privateKeyBuffer 私钥
 * @param {Object} txParams 交易结构体
 */
function signTx(privateKeyBuffer, txParams) {
      const tx = new EthereumTx(txParams);
      tx.sign(privateKey);
      const serializedTx = tx.serialize();
      return serializedTx;
}


let privateKey = loadPrivateKeyFromHexString("833e376d0894438c72a02e0e026f601894992f43bbabdccdfd92bea15ef718bb");
let publicKey = generatePublicKey(privateKey);
console.log("地址" + ":" + generateAddress(publicKey));

let msg = "Hello World";
let signRet = sign(msg, privateKey);

let txParams = {
    nonce: '0x19',
    gasPrice: '0x3b9aca00',
    gasLimit: '0x18c63',
    to: '0xc59565465f95cd80e7317dd5a03929e6900090ff',
    value: '0x00',
    data: '0xb2c21c9100000000000000000000000000000000000000000000000000000000000000400000000000000000000000005902598fc6c9c85bec8452f9ba3fca2f8b226a1b000000000000000000000000000000000000000000000000000000000000000548656c6c6f000000000000000000000000000000000000000000000000000000',
    chainId: 3
}

let serializedTx = signTx(privateKey, txParams).hexSlice();


console.log("私钥" + ':' + privateKey.hexSlice());
console.log("公钥" + ":" + publicKey.hexSlice());
console.log("地址" + ":" + generateAddress(publicKey));
console.log("签名" + ":" + signBuffer(signRet).hexSlice());
console.log("提取公钥" + ":" + recovery(signRet.r, signRet.s, signRet.v, msg).hexSlice());
console.log("验签" + ":" + verify(msg, signRet.r, signRet.s, publicKey));
console.log("交易数据" + ":" + serializedTx);
