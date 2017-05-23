const crypto = require("crypto");
const keypair = require("keypair");


/**
 * Generate a new 1024-bit RSA key.
 * @returns Object {public:<pem> private:<pem>}
 */
exports.generate = () => {
	return keypair({bits:2048});
}

/**
 * Return the hash of a string.
 *
 * @param String str the string to hash.
 * @returns String the sha-256 hash of `str`, hex-encoded.
 */
exports.hash = (str) => {
	const hash = crypto.createHash("sha256");
	hash.update(str);
	return hash.digest("hex");
}

/**
 * Sign a string with a RSA key.
 *
 * @param String str the data to sign
 * @param Object key The private key to use.
 * @returns String hex-encoded signature of the string.
 */
exports.sign = (str, key) => {
	const sign = crypto.createSign("RSA-SHA256");
	sign.update(str);
	return sign.sign(key, "hex");
}

/**
 * Verify a signature with a RSA key.
 *
 * @param String str The data to verify
 * @param String sig The signature of the data
 * @param Object key the public key to use.
 */
exports.verify = (str, sig, key) => {
	const verify = crypto.createVerify("RSA-SHA256");
	verify.update(str);
	return verify.verify(key, sig, "hex");
}
