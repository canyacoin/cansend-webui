import config from 'app.config';
let network = config.network || 1;

/*
	~note...
	able to switch networks by updating the 'network' field in the config.json file
	options are available below (1 = main, 42 = kovan) - add more as necessary
	will default to 1:main if 'network' field not defined in config
	need to recompile code after change

	~todo... 
	wrap this up into self-contained package to detect current network
	and applied the correct addresses based on the preset configuration
*/

const TokenContractData = {
	addresses : {
		1 : "0x1d462414fe14cf489c7A21CaC78509f4bF8CD7c0",
		42 : "0x5bb4c0347733deb01cf50fde998218478289bc80"
	},
	abi : [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balances","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"allowed","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"totalTokens","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"type":"function"},{"inputs":[],"payable":false,"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"}]
}

const MultisenderContractData = {
	addresses : {
		1 : "0x611eee5ef33c90a1cb2da72eb3f6cda5c6bf5dd2",
		42 : "0xb7269c3b2634308113d4cf078e674454e947dc15"
	},
	abi : [{"constant":true,"inputs":[],"name":"feeTokensToCollect","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_newWholeTokensPerTenRecipients","type":"uint256"}],"name":"changeFeeAmount","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"feeTokenDecimals","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalFeesCollected","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"feeToken","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_newOwner","type":"address"}],"name":"transferOwnerShip","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"wholeTokensPerTenRecipients","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_token","type":"address"},{"name":"_recipients","type":"address[]"},{"name":"_amounts","type":"uint256[]"}],"name":"multiSend","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"MAX_RECIPIENTS","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_newMaxRecipients","type":"uint256"}],"name":"changeRecipientsNo","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"feeTokenAddress","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_destination","type":"address"}],"name":"claimTokens","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_feeTokenAddress","type":"address"},{"name":"_feeTokenDecimals","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_token","type":"address"},{"indexed":false,"name":"_total","type":"uint256"},{"indexed":false,"name":"_feesToCollect","type":"uint256"}],"name":"TokensSent","type":"event"}]
}



/* --- contract definitions --- */

export const TokenContract = {
	address : TokenContractData.addresses[network] ? TokenContractData.addresses[network] : TokenContractData.addresses[1],
	abi : TokenContractData.abi
}

export const MultisenderContract = {
	address : MultisenderContractData.addresses[network] ? MultisenderContractData.addresses[network] : MultisenderContractData.addresses[1],
	abi : MultisenderContractData.abi
}

const Contracts = {
	Token : TokenContract,
	Multisender : MultisenderContract
};

export default Contracts;