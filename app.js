const ethereum_address = require('./lib/toolkit');
const fs = require('fs');
const _ = require('lodash');
const Ajv = require('ajv');
const uniswapToken = require('@uniswap/token-lists');

var ethereum = fs.readdirSync('./ethereum');
var erc20schema = require(`./lib/erc20.json`);
var tokensarray = [];
var ajv = new Ajv();

try {
	_.forEach(ethereum, function (value) {
		if (ethereum_address.isAddress(value) && ethereum_address.checkAddressChecksum(value)) {
			console.log(`Validating : ${value}`);

			var tempload = require(`./ethereum/${value}/info.json`);
			if (ajv.validate(erc20schema, tempload)) {
				var tempobj = { chainId: 1, decimals: tempload.decimals || 18, name: tempload.name, symbol: tempload.symbol, address: value, logoURI: `https://raw.githubusercontent.com/thirmprotocol/OpenList/master/ethereum/${value}/logo.png` };
				tokensarray.push(tempobj);
			}
		} else {
			console.log(`Validating : ${value} - wrong checksum`);
			throw 'error';
		}
	});
} catch (e) {
	console.log(e);
	process.exit(1);
}

try {
	var tokenlist = {
		name: 'Open List',
		logoURI: 'https://raw.githubusercontent.com/thirmprotocol/OpenList/master/lib/logo.png',
		keywords: ['DeFi'],
		timestamp: '2020-08-26T16:54:08.134+00:00',
		version: { major: 1, minor: 0, patch: 2 },
		tokens: tokensarray,
	};

	if (ajv.validate(uniswapToken.schema, tokenlist)) {
		fs.writeFileSync('list.json', JSON.stringify(tokenlist));
	}
} catch (e) {
	console.log(e);
	process.exit(1);
}
