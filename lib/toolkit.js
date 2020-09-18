'use strict';

const SHA3 = require('crypto-js/sha3');
const keccak256 = require('keccak256');

let sha3 = (value) => {
	return SHA3(value, {
		outputLength: 256,
	}).toString();
};

let isAddress = (address) => {
	if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
		// Check if it has the basic requirements of an address
		return false;
	} else if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) {
		// If it's all small caps or all all caps, return true
		return true;
	} else {
		// Otherwise check each case
		return isChecksumAddress(address);
	}
};

let isChecksumAddress = function (address) {
	// Check each case
	address = address.replace('0x', '');
	let addressHash = sha3(address.toLowerCase());

	for (let i = 0; i < 40; i++) {
		// The nth letter should be uppercase if the nth digit of casemap is 1
		if ((parseInt(addressHash[i], 16) > 7 && address[i].toUpperCase() !== address[i]) || (parseInt(addressHash[i], 16) <= 7 && address[i].toLowerCase() !== address[i])) {
			return false;
		}
	}
	return true;
};

function toChecksumAddress(address, chainId = null) {
	if (typeof address !== 'string') {
		return '';
	}

	if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
		throw new Error(`Given address "${address}" is not a valid Ethereum address.`);
	}

	const stripAddress = stripHexPrefix(address).toLowerCase();
	const prefix = chainId != null ? chainId.toString() + '0x' : '';
	const keccakHash = keccak256(prefix + stripAddress)
		.toString('hex')
		.replace(/^0x/i, '');
	let checksumAddress = '0x';

	for (let i = 0; i < stripAddress.length; i++) {
		checksumAddress += parseInt(keccakHash[i], 16) >= 8 ? stripAddress[i].toUpperCase() : stripAddress[i];
	}

	return checksumAddress;
}

function checkAddressChecksum(address, chainId = null) {
	const stripAddress = stripHexPrefix(address).toLowerCase();
	const prefix = chainId != null ? chainId.toString() + '0x' : '';
	const keccakHash = keccak256(prefix + stripAddress)
		.toString('hex')
		.replace(/^0x/i, '');

	for (let i = 0; i < stripAddress.length; i++) {
		let output = parseInt(keccakHash[i], 16) >= 8 ? stripAddress[i].toUpperCase() : stripAddress[i];
		if (stripHexPrefix(address)[i] !== output) {
			return false;
		}
	}
	return true;
}

function stripHexPrefix(value) {
	return value.slice(0, 2) === '0x' ? value.slice(2) : value;
}

module.exports = {
	isAddress,
	isChecksumAddress,
	toChecksumAddress,
	checkAddressChecksum,
};
