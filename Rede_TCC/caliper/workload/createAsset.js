'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

class MyWorkload extends WorkloadModuleBase {
    constructor() {
        super();
        this.txIndex = -1;
        this.query = ['SELECT * FROM Dados_Cidadao', 'SELECT cpf FROM Dados_Cidadao', 'SELECT nome FROM Dados_Cidadao', 'SELECT dataNasc FROM Dados_Cidadao'] ;
    }

    /**
    * Initialize the workload module with the given parameters.
    * @param {number} workerIndex The 0-based index of the worker instantiating the workload module.
    * @param {number} totalWorkers The total number of workers participating in the round.
    * @param {number} roundIndex The 0-based index of the currently executing round.
    * @param {Object} roundArguments The user-provided arguments for the round from the benchmark configuration file.
    * @param {ConnectorBase} sutAdapter The adapter of the underlying SUT.
    * @param {Object} sutContext The custom context object provided by the SUT adapter.
    * @async
    */
    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);
    }
    async submitTransaction() {
        this.txIndex++;

        const assetID = `${this.roundIndex}_${this.workerIndex}_${this.txIndex}_${Date.now()}`;
        let query = this.query[this.txIndex % this.query.length];

        const request = {
            contractId: this.roundArguments.contractId,
            contractFunction: 'CreateAsset',
            invokerIdentity: 'User1',
            contractArguments: [assetID, query, new Date],
            readOnly: false
        };

        const result = await this.sutAdapter.sendRequests(request);
        let shortID = result.GetID().substring(8);

    }

}

function createWorkloadModule() {
    return new MyWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;