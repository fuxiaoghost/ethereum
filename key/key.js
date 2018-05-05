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
    return privateKey.hexSlice();
}
console.log(generatePrivateKey());