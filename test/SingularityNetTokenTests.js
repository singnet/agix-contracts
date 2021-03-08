"use strict";
let BigNumber = require("bignumber.js");
var  SingularityNetToken = artifacts.require("./SingularityNetToken.sol");

let Contract = require("@truffle/contract");
const { assert } = require("chai");

var ethereumjsabi  = require('ethereumjs-abi');
var ethereumjsutil = require('ethereumjs-util');

async function testErrorRevert(prom)
{
    let rezE = -1
    try { await prom }
    catch(e) {
        rezE = e.message.indexOf('revert');
        //console.log("Catch Block: " + e.message);
    }
    assert(rezE >= 0, "Must generate error and error message must contain revert");
}
  
contract('SingularityNetToken', function(accounts) {

    var singularityNetToken;
    
    before(async () => 
        {
            singularityNetToken = await SingularityNetToken.deployed();
        });

        const getInitialSupplyAndVerify = async (_totalSupply) => {
            
            const totalSupply = await singularityNetToken.totalSupply.call()

            assert.equal(totalSupply.toNumber(), _totalSupply);
        }

        const getDecimalsAndVerify = async (_decimals) => {

            const decimals = await singularityNetToken.decimals.call()

            assert.equal(decimals.toNumber(), _decimals);

        }

        const mintAndVerify = async (_account, _amount) => {

            const totalSupply_b = await singularityNetToken.totalSupply.call()
            const wallet_bal_b = (await singularityNetToken.balanceOf(_account));

            const _amountBN = new BigNumber(_amount);

            await singularityNetToken.mint(_account, _amountBN.toString(), {from:_account})

            const totalSupply_a = await singularityNetToken.totalSupply.call();
            const wallet_bal_a = (await singularityNetToken.balanceOf(_account));

            //assert.equal(totalSupply_b.toNumber() + _amount, totalSupply_a.toNumber());
            assert.equal(_amountBN.plus(totalSupply_b).toString(), totalSupply_a);
            assert.equal(_amountBN.plus(wallet_bal_b).toString(), wallet_bal_a);

        }

        const transferAndVerify = async (_accountFrom, _accountTo, _amount) => {

            const _amountBN = new BigNumber(_amount);

            const sender_bal_b = (await singularityNetToken.balanceOf(_accountFrom));
            const receiver_bal_b = (await singularityNetToken.balanceOf(_accountTo));

            await singularityNetToken.transfer(_accountTo, _amountBN.toString(), {from:_accountFrom})

            const sender_bal_a = (await singularityNetToken.balanceOf(_accountFrom));
            const receiver_bal_a = (await singularityNetToken.balanceOf(_accountTo));

            assert.equal(_amountBN.plus(receiver_bal_b).toString(), receiver_bal_a);
            assert.equal(sender_bal_b, _amountBN.plus(sender_bal_a).toString());

        }

        const pauseContractAndVerify = async (_accountFrom) => {

            await singularityNetToken.pause({from:_accountFrom});
            const paused = (await singularityNetToken.paused());

            assert.equal(paused, true);
        }
        
        const unPauseContractAndVerify = async (_accountFrom) => {

            await singularityNetToken.unpause({from:_accountFrom});
            const paused = (await singularityNetToken.paused());

            assert.equal(paused, false);

        }

        const getPauserRole = async () => {

            return await singularityNetToken.PAUSER_ROLE.call();
        }

        const grantPauseRole = async (_accountFrom, _pauserAccount) => {

            const pauseRole = await getPauserRole();
            await singularityNetToken.grantRole(pauseRole, _pauserAccount, {from:_accountFrom});

        }

        const grantMinterRole = async (_accountFrom, _minterAccount) => {

            const minterRole = await singularityNetToken.MINTER_ROLE.call();
            await singularityNetToken.grantRole(minterRole, _minterAccount, {from:_accountFrom});

        }

        const getRandomNumber = (max) => {
            const min = 10; // To avoid zero rand number
            return Math.floor(Math.random() * (max - min) + min);
        }

        const sleep = async (sec) => {
            console.log("Waiting for cycle to complete...Secs - " + sec);
            return new Promise((resolve) => {
                setTimeout(resolve, sec * 1000);
              });
        }

    // ************************ Test Scenarios Starts From Here ********************************************

    it("0. Initial Deployment Configuration - Decimals, Initial Suppy and Owner", async function() 
    {
        // accounts[0] -> Contract Owner

        // Check for the Initial Supply which Should be Zero
        await getInitialSupplyAndVerify(0);

        // Check for the Configured Decimals - Should be 8
        await getDecimalsAndVerify(8);

    });

    it("1. Mint Token - First & sub sequent mints", async function() 
    {
        // accounts[0] -> Contract Owner

        // Mint 2B tokens
        const mintAmountBN = new BigNumber("200000000000000000");
        await mintAndVerify(accounts[0], mintAmountBN.toString());

        // Test minting with a different Account - Should Fail
        await testErrorRevert(singularityNetToken.mint(accounts[1], mintAmountBN.toString(), {from:accounts[1]}));

        // Try to Mint more than Initial Supply - Additional 10M
        const mintAdditionalAmtBN = new BigNumber("1000000000000000");
        //await testErrorRevert(singularityNetToken.mint(accounts[0], initSupply, {from:accounts[0]}));
        await mintAndVerify(accounts[0], mintAdditionalAmtBN.toString());

    });


    it("2. Transfer Token - Transfer to Different Account and Validation", async function() 
    {
        // accounts[0] -> Contract Owner

        // Transfer 1M tokens
        const transferAmountBN = new BigNumber("100000000000000");
        await transferAndVerify(accounts[0], accounts[1], transferAmountBN.toString());

    });


    it("3. Admin Functionality - Pause and Resume validation", async function() 
    {
        // accounts[0] -> Contract Owner

        // Pause the Contract
        await pauseContractAndVerify(accounts[0]);

        // Transfer should fail
        const transferAmountBN = new BigNumber("100000000000000");
        await testErrorRevert(transferAndVerify(accounts[0], accounts[1], transferAmountBN.toString()));

        // UnPause the Contract Again
        await unPauseContractAndVerify(accounts[0]);

        // Only the Owner or with Pauser Role should be able to pause the Contract
        await testErrorRevert(singularityNetToken.pause({from:accounts[1]}));

    });
    

    it("4. Admin Functionality - Assign Pause Role and Validate", async function() 
    {
        // accounts[0] -> Contract Owner

        // Grant Account[9] with Pauser Role
        await grantPauseRole(accounts[0], accounts[9])

        // Pause the Contract with Account[9]
        await pauseContractAndVerify(accounts[9]);

        // UnPause the Contract Again
        await unPauseContractAndVerify(accounts[9]);

    });
    
    it("5. Admin Functionality - Assign Minter Role and Validate", async function() 
    {
        // accounts[0] -> Contract Owner

        // Grant Account[8] with Minter Role
        await grantMinterRole(accounts[0], accounts[8])

        // Mint 10M tokens with the Minter Account
        const mintAmountBN = new BigNumber("1000000000000000");
        await mintAndVerify(accounts[8], mintAmountBN.toString());
    });



});
