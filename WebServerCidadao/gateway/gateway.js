const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const fs = require('fs')
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('/home/lucas/WebServerCidadao/javascript/CAUtil.js');
const { buildCCPOrg5, buildWallet } = require('/home/lucas/WebServerCidadao/javascript/AppUtil.js');
const res = require('express/lib/response');

const channelName = 'mychannel';
const chaincodeName = 'teste';
const mspOrg5 = 'Org5MSP';
const walletPath = path.join(__dirname, 'wallet');
const org5UserId = 'appUser';

var ccp, caClient, wallet;

function prettyJSONString(inputString) {
	return JSON.stringify(JSON.parse(inputString), null, 2);
}


async function gatewayInit() {
	try {
		// build an in memory object with the network configuration (also known as a connection profile)
		ccp = buildCCPOrg5();

		// build an instance of the fabric ca services client based on
		// the information in the network configuration
		caClient = buildCAClient(FabricCAServices, ccp, 'ca.org5.example.com');

		// setup the wallet to hold the credentials of the application user
		wallet = await buildWallet(Wallets, walletPath);

		// in a real application this would be done on an administrative flow, and only once
		enrollAdmin(caClient, wallet, mspOrg5);

		// in a real application this would be done only when a new user was required to be added
		// and would be part of an administrative flow
		registerAndEnrollUser(caClient, wallet, mspOrg5, org5UserId, 'org2.department1');

    }   catch (error) {
        console.error(`******** Falha na inicialização do gateway: ${error}`);
    }
} 

async function gatewaySearch() {
	try {

		// Create a new gateway instance for interacting with the fabric network.
		// In a real application this would be done as the backend server session is setup for
		// a user that has been verified.
		const gateway = new Gateway();

		try {
			// setup the gateway instance
			// The user will now be able to create connections to the fabric network and be able to
			// submit transactions and query. All transactions submitted by this gateway will be
			// signed by this user using the credentials stored in the wallet.
			await gateway.connect(ccp, {
				wallet,
				identity: org5UserId,
				discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
			});

			// Build a network instance based on the channel where the smart contract is deployed
			const network = await gateway.getNetwork(channelName);

			// Get the contract from the network.
			const contract = network.getContract(chaincodeName);

			result = await contract.evaluateTransaction('GetAllAssets', "");

			console.log(`*** Result: ${prettyJSONString(result.toString())}`);
			fs.writeFileSync('/home/lucas/WebServerCidadao/Dados_Consultados.txt', result)
		} finally {
			gateway.disconnect();
		}
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
}

module.exports ={
	gatewayInit, gatewaySearch
}