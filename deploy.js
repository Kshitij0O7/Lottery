const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const { abi, evm } = require('./compile');
const provider = new HDWalletProvider(
  'present canoe trouble myself rude into receive bronze profit casino bronze gossip',
  'https://rinkeby.infura.io/v3/173c654ba53d48f89ceea2b0ca3360be'
);
const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log('Attempting to deploy from account ', accounts[0]);

  const result = await new web3.eth.Contract(abi)
    .deploy({data: evm.bytecode.object})
    .send({from: accounts[0], gas: 1000000});

  console.log(JSON.stringify(abi));
  console.log('Contract deployed to ', result.options.address);

  provider.engine.stop(); // to prevent a hanging deployment
};

deploy(); // the code could have been written outside the function and no need to create a function
          // but did it so that we can use async and await as the web3 instance returns a promise
