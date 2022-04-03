const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const fs = require('fs')
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('/home/lucas/WebServer2/javascript/CAUtil.js');
const { buildCCPOrg2, buildWallet } = require('/home/lucas/WebServer2/javascript/AppUtil.js');
const res = require('express/lib/response');

const channelName = 'mychannel';
const chaincodeName = 'teste';
const mspOrg = 'Org2MSP';
const walletPath = path.join(__dirname, 'wallet');
const orgUserId = 'appUser';

var ccp, caClient, wallet;

function prettyJSONString(inputString) {
	return JSON.stringify(JSON.parse(inputString), null, 2);
}
async function gatewayInit() {
	try {
		
		ccp = buildCCPOrg2();

		caClient = buildCAClient(FabricCAServices, ccp, 'ca.org2.example.com');

		wallet = await buildWallet(Wallets, walletPath);

		await enrollAdmin(caClient, wallet, mspOrg2);

		registerAndEnrollUser(caClient, wallet, mspOrg2, org2UserId, 'org2.department1');

    }   catch (error) {
        console.error(`******** Falha na inicialização do gateway: ${error}`);
    }
} 

async function gatewayQuery(dbQuery) {
	try {
		// Cria um novo gateway
		const gateway = new Gateway();
		try {
			// Conecta no gateway
			await gateway.connect(ccp, {
				wallet,
				identity: org2UserId,
				discovery: { enabled: true, asLocalhost: true } 
			});
			// Recupera o nome do canal onde será realizada a transação
			const network = await gateway.getNetwork(channelName);
			// Recupera o nome do chaincode
			const contract = network.getContract(chaincodeName);
			// Gera ID para a transação
			var id = "id" + Math.random().toString(16).slice(2)			
			console.log('\n--> Enviar Transação: CreateAsset');
			// Envia a transação para a blockchain com os argumentos ID, query pesquisada e data atual
			result = await contract.submitTransaction('CreateAsset', id, dbQuery, new Date);
			console.log('*** Transação OK');
			if (`${result}` !== '') {
				console.log(`*** Resultado: ${prettyJSONString(result.toString())}`);
			}

			console.log('\n--> Ler Transação: ReadAsset');
			result = await contract.evaluateTransaction('ReadAsset', id);
			console.log(`*** Result: ${prettyJSONString(result.toString())}`);

		} finally {
			gateway.disconnect();
		}
	} catch (error) {
		console.error(`******** Falha na aplicação: ${error}`);
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
				identity: org2UserId,
				discovery: { enabled: true, asLocalhost: true } 
			});
			// Recupera o nome do canal onde será realizada a transação
			const network = await gateway.getNetwork(channelName);
			// Recupera o nome do chaincode
			const contract = network.getContract(chaincodeName);
			// Recupera a lista de todas as transações do ledger da rede blockchain
			result = await contract.evaluateTransaction('GetAllAssets', "");

			console.log(`*** Resultado: ${prettyJSONString(result.toString())}`);
			fs.writeFileSync('/home/lucas/WebServer2/Dados_Consultados.txt', result)
		} finally {
			gateway.disconnect();
		}
	} catch (error) {
		console.error(`******** Falha na aplicação: ${error}`);
	}
}

module.exports ={
	gatewayQuery, gatewayInit, gatewaySearch
}