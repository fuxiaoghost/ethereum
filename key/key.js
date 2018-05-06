import { randomBytes } from 'crypto';
import secp256k1 from 'secp256k1';
import SHA3 from 'keccakjs';

/**
 * 私钥：secp256k1(ECDSA)生成私钥(256 bits 随机数/32位)
 */
function generatePrivateKey() {
    var privateKey = null;
    do {
        privateKey =  randomBytes(32)

    }while(!secp256k1.privateKeyVerify(privateKey));
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
 * 地址：公钥的sha3-256编码的后20字节，16进制编码的字符串
 * @param {string} publicKey 公钥
 */
function generateAddress(publicKey) {
    let h = new SHA3(256);
    h.update(publicKey.slice(1)); //去掉前缀
    return h.digest('hex').slice(-40);
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

let privateKey = loadPrivateKeyFromHexString("833e376d0894438c72a02e0e026f601894992f43bbabdccdfd92bea15ef718bb");
let publicKey = generatePublicKey(privateKey);

console.log(privateKey.hexSlice());
console.log(publicKey.hexSlice());
console.log(generateAddress(publicKey));