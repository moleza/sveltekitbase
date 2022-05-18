import textobf from 'text-obfuscator';

function decodeCookie(cookie) {
    try {
        let b = Buffer.from(textobf.decode(cookie,4), 'base64');
        let s = b.toString();
    return JSON.parse(s);
    } catch(ex) {
        return null;
    }
}

function encodeCookie(store) {
    try {
        let b = Buffer.from(JSON.stringify(store));
        return textobf.encode(b.toString('base64'),4);
    } catch(ex) {
        return null;
    }
}

export { decodeCookie, encodeCookie }