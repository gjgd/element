const dotenv = require('dotenv');
const path = require('path');
const fetch = require('node-fetch');

const element = require('../../index');

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const config = {
  mnemonic: process.env.ELEMENT_MNEMONIC,
  web3ProviderUrl: process.env.ELEMENT_PROVIDER,
  ipfsApiMultiAddr: process.env.ELEMENT_IPFS_MULTIADDR,
  anchorContractAddress: process.env.ELEMENT_CONTRACT_ADDRESS,
  couchdb_remote: process.env.ELEMENT_COUCHDB_REMOTE,
};

// These tests are for debuging syncing issues in production
describe.skip('Production Tests', () => {
  const blockchain = element.blockchain.ethereum.configure({
    hdPath: "m/44'/60'/0'/0/0",
    mnemonic: config.mnemonic,
    providerUrl: config.web3ProviderUrl,
    // when not defined, a new contract is created.
    anchorContractAddress: config.anchorContractAddress,
  });

  const storage = element.storage.ipfs.configure({
    multiaddr: config.ipfsApiMultiAddr,
  });

  const db = new element.adapters.database.ElementRXDBAdapter({
    name: 'production-tests',
    // Use a test DB for the production tests
    remote: config.couchdb_remote.replace('element-did', 'test-element-did'),
    adapter: 'memory',
  });

  const manager = new element.adapters.storage.StorageManager(db, storage, {
    autoPersist: true,
    retryIntervalSeconds: 1,
  });
  describe('blockchain', () => {
    it('should have 2 transactions in window', async () => {
      await blockchain.resolving;
      const txns = await blockchain.getTransactions(6421342, 6421354);
      expect(txns.length).toBe(2);
    });
  });

  describe('storage', () => {
    it('anchor file is resolvable', async () => {
      const anchorFile = await storage.read('QmPyAucuooAEMbdw1uT8veXrLSfBjdNoTqfDRsnt5hrzbS');
      expect(anchorFile).toEqual({
        batchFileHash: 'QmZxFCGwiYfutyXDR2TcWs728GrCeAsbVkM7Dazphf35QF',
        didUniqueSuffixes: ['WJl6h_dz3bvJscpWceWoK7AbD5khKdob0W92zh1sx7M'],
        merkleRoot: 'f0e895ea0791e90f3687498d16824299c9346dab93e6463c182b5b649d3e26ab',
      });
    });
  });

  describe('cloudant', () => {
    it('can await sync', async () => {
      const record = await db.read(
        'element:sidetree:cas-cachable:QmPyAucuooAEMbdw1uT8veXrLSfBjdNoTqfDRsnt5hrzbS',
      );
      expect(record).toBe(null);
      const record1 = await manager.read('QmPyAucuooAEMbdw1uT8veXrLSfBjdNoTqfDRsnt5hrzbS');
      expect(record1).toEqual({
        batchFileHash: 'QmZxFCGwiYfutyXDR2TcWs728GrCeAsbVkM7Dazphf35QF',
        didUniqueSuffixes: ['WJl6h_dz3bvJscpWceWoK7AbD5khKdob0W92zh1sx7M'],
        merkleRoot: 'f0e895ea0791e90f3687498d16824299c9346dab93e6463c182b5b649d3e26ab',
      });
      const record2 = await db.read(
        'element:sidetree:cas-cachable:QmPyAucuooAEMbdw1uT8veXrLSfBjdNoTqfDRsnt5hrzbS',
      );
      expect(record2.persisted).toBe(true);
    });

    it('should sync data with the remote URL', async () => {
      // Delete test remote DB to start fresh
      await fetch(db.remote, { method: 'DELETE' }).then(res => res.json());
      // Make sure record does not exist yet in the remote DB
      const error = await fetch(`${db.remote}/element:sidetree:cas-cachable:QmPyAucuooAEMbdw1uT8veXrLSfBjdNoTqfDRsnt5hrzbS`)
        .then(res => res.json());
      expect(error).toBeDefined();
      expect(error.error).toBe('not_found');
      // Sync DB
      await manager.db.awaitableSync();
      // Now record exists
      const record = await fetch(`${db.remote}/element:sidetree:cas-cachable:QmPyAucuooAEMbdw1uT8veXrLSfBjdNoTqfDRsnt5hrzbS`)
        .then(res => res.json());
      expect(record).toBeDefined();
      expect(record.id).toBe('element:sidetree:cas-cachable:QmPyAucuooAEMbdw1uT8veXrLSfBjdNoTqfDRsnt5hrzbS');
    });
  });

  // TODO: Fix this code to test creation of a production DID End to End.
  // it('can create a transaction with the manager', async () => {
  //   const mnemonic = 'panda lion unfold live venue spice urban member march gift obvious gossip';
  //   const mks = new element.MnemonicKeySystem(mnemonic);
  //   const rootKey = mks.getKeyForPurpose('root', 0);
  //   const recoveryKey = mks.getKeyForPurpose('recovery', 0);
  //   const txn0 = await sidetree.createTransactionFromRequests([
  //     element.op.create({
  //       primaryKey: rootKey,
  //       recoveryPublicKey: recoveryKey.publicKey,
  //     }),
  //   ]);
  //   expect(txn0.transactionTime).toBeDefined();
  //   const anchorFile = await ipfsStorage.read(txn0.anchorFileHash);
  //   const didUniqueSuffix = await element.op.getDidUniqueSuffix({
  //     primaryKey: rootKey,
  //     recoveryPublicKey: recoveryKey.publicKey,
  //   });
  //   expect(anchorFile.batchFileHash).toBeDefined();
  //   const ddo = await sidetree.resolve(`did:elem:${didUniqueSuffix}`);
  //   expect(ddo.id).toBe('did:elem:2Qe8QPUp3oitHs0IO1D68sF3uOmmpBrD8BKd0IPG7Po');
  // });
  // it('can sync manually', async () => {
  //   const res = await sidetree.storage.db.awaitableSync();
  //   expect(res.ok).toBe(true);
  //   expect(res.docs_written).toBe(5);
  //   // 1 transaction
  //   // 2 operation
  //   // 3 anchor file cache
  //   // 4 batch file cache
  //   // 5 did doc
  // });
});
