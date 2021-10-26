import React, {useEffect, useState} from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';

import { ethers } from 'ethers';
import MyEpicGame from './utils/MyEpicGame.json';
import SelectCharacter from './Components/SelectCharacter';
import { CONTRACT_ADDRESS, transformCharacterData } from './constants';

// Constants
const TWITTER_HANDLE = 'santbob';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;


const App = () => {

  const [currentAccount, setCurrentAccount] = useState(null);
  const [characterNFT, setCharacterNFT] = useState(null);

  const checkWalletAndChain = async () => {
    const { ethereum } = window;

      if(!ethereum){
        console.log("Make sure you have MetaMask wallet")
        return false;
      } else {
        console.log("Cool! you have the MetaMask wallet")
      }
      
      let chainId = await ethereum.request({ method: 'eth_chainId' });
      console.log("Connected to chain " + chainId);

      // String, hex code of the chainId of the Rinkebey test network
      const rinkebyChainId = "0x4"; 
      if (chainId !== rinkebyChainId) {
        alert("You are not connected to the Rinkeby Test Network!");
        return false;
      }

      return true;
  }


  const checkIfWalletIsConnected = async () => {
    const {ethereum} = window;

    const hasValidWallet = await checkWalletAndChain();
    if(!hasValidWallet) {
      return;
    }

    const accounts = await ethereum.request({method: 'eth_accounts'})

    if(accounts.length !== 0) {
      const account = accounts[0];
      console.log('Found an authorized account:', account);
      setCurrentAccount(account);
    } else {
      console.log('No authorized account found');
    }
  }

  const connectWalletAction = async () => {

    const {ethereum} = window;

    const hasValidWallet = await checkWalletAndChain();
    if(!hasValidWallet) {
      return;
    }

    const accounts = await ethereum.request({method: 'eth_requestAccounts'});

    if(accounts && accounts.length > 0) {
      const account = accounts[0]
      console.log("Found an authorized account:", account);
      setCurrentAccount(account)
      //setupListener()
    } else {
      console.log("no valid account found")
    }
  }

  const renderContent = () => {
    if(!currentAccount) {
        return (<div className="connect-wallet-container">
            <img
              src="https://media.giphy.com/media/3o7bu12GHm4G5frn6U/giphy.gif"
              alt="Monty Python Gif"
            />
            {/*
             * Button that we will use to trigger wallet connect
             * Don't forget to add the onClick event to call your method!
             */}
            <button
              className="cta-button connect-wallet-button"
              onClick={connectWalletAction}
            >
              Connect Wallet To Get Started
            </button>
          </div>)
    } else if (currentAccount && !characterNFT) {
        return <SelectCharacter setCharacterNFT={setCharacterNFT} />
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected()
  }, [])

  useEffect(() => {

    const fetchMintedNFTCharacter = async () => {
      console.log('Checking for Character NFT on address:', currentAccount);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(CONTRACT_ADDRESS, MyEpicGame.abi, signer);

      const txn = await gameContract.checkIfUserHasNFT();

      if (txn.name) {
        console.log('User has character NFT');
        setCharacterNFT(transformCharacterData(txn));
      } else {
        console.log('No character NFT found!');
      }
    }

    if(currentAccount) {
      console.log("Account exists let me find if there is an character exist for this Account");
      fetchMintedNFTCharacter();
    }

  },[currentAccount])

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">⚔️ Facist Slayer ⚔️</p>
          <p className="sub-text">Team up to protect the Metaverse from Facists!</p>
          {renderContent()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built with @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
