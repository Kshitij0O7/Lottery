const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const { abi, evm } = require('../compile');

let lottery;
let accounts;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
  lottery = await new web3.eth.Contract(abi)
    .deploy({ data: evm.bytecode.object})
    .send({from: accounts[0], gas: '1000000'});
});

describe('Lottery', () => {
  it('isDeployed', () => {
    assert.ok(lottery.options.address);
  });
  it('one account entered', async () =>{
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('0.02', 'ether')
    });
    const players = await lottery.methods.getPlayers().call({
      from: accounts[0]
    });

    assert.equal(accounts[0], players[0]);
    assert.equal(1, players.length);   //first arguement represents the value it should be & second one represents the value it is
  });
  it('multiple accounts entered', async () =>{
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('0.02', 'ether')
    });
    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei('0.02', 'ether')
    });
    await lottery.methods.enter().send({
      from: accounts[2],
      value: web3.utils.toWei('0.02', 'ether')
    });

    const players = await lottery.methods.getPlayers().call({
      from: accounts[0]
    });

    assert.equal(accounts[0], players[0]);
    assert.equal(accounts[1], players[1]);
    assert.equal(accounts[2], players[2]);
    assert.equal(3, players.length);
  });
  it('minimum amount is given', async () =>{
    try{
      await lottery.methods.enter(),send({
        from: accounts[0],
        value: 150 // the amount specified is in wei hence we used that toWei function above to avoid manual conversion
      });
      assert(false);
    } catch(err){
      assert(err);
    }
  });
  it('only manager picks Winner', async () =>{
    try{
      await lottery.methods.pickWinner().send({
        from: accounts[1]
      });
      assert(false);
    } catch(err){
      assert(err);
    }
  });
  it('money sent to winner', async () =>{
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('2', 'ether')
    });

    const initBalance = await web3.eth.getBalance(accounts[0]);
    await lottery.methods.pickWinner().send({from: accounts[0]});
    const finalBalance = await web3.eth.getBalance(accounts[0]);
    const difference = finalBalance - initBalance;

    assert(difference > web3.utils.toWei('1.8', 'ether'));

  });
  it('contract returned to initial state', async () =>{
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('2', 'ether')
    });

    await lottery.methods.pickWinner().send({from: accounts[0]});

    const players = await lottery.methods.getPlayers().call({from: accounts[0]});
    const remainingBalance = await web3.eth.getBalance(lottery.options.address);

    assert.equal(0, players.length);
    assert.equal(0, remainingBalance);
  });
});
