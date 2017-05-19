const NodeRSA = require("node-rsa");

let crypto = {};
module.exports = crypto;

/**
 * Generate a new 1024-bit RSA key.
 * @returns NodeRSA a NodeRSA instance.
 */
crypto.generate = () => new NodeRSA({
	b: 2048, 
	signingScheme:"pkcs1-sha256", 
	encryptionScheme:"pkcs1_oaep"
});

/**
 * Export a private key as PEM for storage.
 * @returns String the PEM-encoded (pkcs8) key.
 */
crypto.exportPrivate = (key) => key.exportKey("pkcs8-private");

/**
 * Export the public part of a key as PEM.
 * @returns String the PEM-encoded (pkcs8) public key.
 */
crypto.exportPublic = (key) key.exportKey("pkcs8-public");
