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
		
		ccp = buildCCPOrg5();

		caClient = buildCAClient(FabricCAServices, ccp, 'ca.org5.example.com');

		wallet = await buildWallet(Wallets, walletPath);

		await enrollAdmin(caClient, wallet, mspOrg5);

		registerAndEnrollUser(caClient, wallet, mspOrg5, org5UserId, 'org1.department1');

    }   catch (error) {
        console.error(`******** Falha na inicialização do gateway: ${error}`);
    }
} 

async function gatewaySearch() {
	try {
		// Cria um novo gateway
		const gateway = new Gateway();
		try {
			// Conecta no gateway
			await gateway.connect(ccp, {
				wallet,
				identity: org5UserId,
				discovery: { enabled: true, asLocalhost: true } 
			});
			// Recupera o nome do canal onde será realizada a transação
			const network = await gateway.getNetwork(channelName);
			// Recupera o nome do chaincode
			const contract = network.getContract(chaincodeName);
			// Recupera a lista de todas as transações do ledger da rede blockchain
			result = await contract.evaluateTransaction('GetAllAssets', "");

			console.log(`*** Resultado: ${prettyJSONString(result.toString())}`);
			fs.writeFileSync('/home/lucas/WebServerCidadao/Dados_Consultados.txt', result)
		} finally {
			gateway.disconnect();
		}
	} catch (error) {
		console.error(`******** Falha na aplicação: ${error}`);
	}
}

module.exports ={
	gatewayInit, gatewaySearch
}