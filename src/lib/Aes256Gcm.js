import forge from 'node-forge';

function aesGcmEncryptToBase64(key, data) {
    let nonce = generateRandomNonce();
    let cipher = forge.cipher.createCipher('AES-GCM', key);
    cipher.start({iv: nonce,
        tagLength: 128 // optional, defaults to 128 bits});
    });  
    cipher.update(forge.util.createBuffer(forge.util.encodeUtf8(data)));
    cipher.finish();
    let encrypted = cipher.output;
    let nonceBase64 = base64Encoding(nonce);
    let gcmTagBase64 = base64Encoding(cipher.mode.tag.data);
    let encryptedBase64 = base64Encoding(encrypted.getBytes());
    return nonceBase64 + ':' + encryptedBase64 + ':' + gcmTagBase64;
}

function aesGcmDecryptFromBase64(key, data) {
    let dataSplit = data.split(":");
    let nonce = base64Decoding(dataSplit[0]);
    let ciphertext = base64Decoding(dataSplit[1]);
    let gcmTag = base64Decoding(dataSplit[2]);
    let decCipher = forge.cipher.createDecipher('AES-GCM', key);
    decCipher.start({iv: nonce,
        tagLength: 128, // optional, defaults to 128 bits});
        tag: gcmTag // authentication tag from encryption
    });  
    decCipher.update(forge.util.createBuffer(ciphertext));
    decCipher.finish();
    let aesDec = decCipher.output;
    return forge.util.decodeUtf8(aesDec);
}  

function generateRandomNonce() {
    return forge.random.getBytesSync(12);
}

function base64Encoding(input) {
    return forge.util.encode64(input);
}

function base64Decoding(input) {
    return forge.util.decode64(input);
}

function encrypt(strToEncrypt, key) {
    let ciphertextBase64 = aesGcmEncryptToBase64(key, strToEncrypt);
    return ciphertextBase64;
}

function decrypt(strToDecrypt, key) {
    let decryptedtext = aesGcmDecryptFromBase64(key, strToDecrypt);
    return decryptedtext;
}

export {encrypt, decrypt};