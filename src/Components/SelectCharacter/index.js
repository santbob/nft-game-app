import React, { useState, useEffect } from 'react';
import './SelectCharacter.css';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, transformCharacterData, transformImageURI } from './../../constants';
import MyEpicGame from './../../utils/MyEpicGame.json';
import LoadingIndicator from './../LoadingIndicator';

const SelectCharacter = ({ setCharacterNFT }) => {
  const [characters, setCharacters] = useState([]);
  const [gameContract, setGameContract] = useState(null);
  const [mintingCharacter, setMintingCharacter] = useState(false);

  const mintCharacterNFTAction = (characterId) => async () => {
    try {
      if (gameContract) {
        setMintingCharacter(true);
        console.log('Minting character in progress...');
        const mintTxn = await gameContract.mintCharacterNFT(characterId);
        await mintTxn.wait();
        console.log("MintTxn: ", mintTxn);
        setMintingCharacter(false);
      }
      else {
        console.error("MintCharacterAction Error: ", "Game Contract is null");
      }
    } catch (err) {
      console.error("MintCharacterAction Error:", err);
      setMintingCharacter(false);
    }
  }

  const renderCharacters = () => characters.map((character, index) => (
    <div className="character-item" key={character.name}>
      <div className="name-container">
        <p>{character.name}</p>
      </div>
      <img src={transformImageURI(character.imageURI)} alt={character.name} />
      <button
        type="button"
        className="character-mint-button"
        onClick={mintCharacterNFTAction(index)}
      >{`Mint ${character.name}`}</button>
    </div>
  ));

  useEffect(() => {

    const { ethereum } = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, MyEpicGame.abi, signer);

      setGameContract(contract);
    } else {
      console.log('No ethereum found');
    }
  }, []);

  useEffect(() => {
    const getCharacters = async () => {
      const charactersTxn = await gameContract.getAllDefaultCharacters();
      console.log(`All the default characters fetched `, charactersTxn);

      const blah = charactersTxn.map(transformCharacterData);
      console.log(`Transformed characters`, blah);

      setCharacters(blah);
    }

    const onCharacterMinted = async (sender, tokenId, characterIndex) => {
      console.log(`CharacterNFT minted - sender ${sender} tokenId: ${tokenId} characterIndex: ${characterIndex}`);

      if (gameContract) {
        const character = await gameContract.checkIfUserHasNFT();
        console.log(`CharacterNFT minted - character ${character}`);
        setCharacterNFT(transformCharacterData(character));
      }
    }

    if (gameContract) {
      getCharacters();
      gameContract.on('ComradeNFTMinted', onCharacterMinted);
    }

    return () => {
      /*
       * When your component unmounts, let;s make sure to clean up this listener
       */
      if (gameContract) {
        gameContract.off('ComradeNFTMinted', onCharacterMinted);
      }
    };
  }, [gameContract]);

  return (
    <div className="select-character-container">
      <h2>Mint Your Hero. Choose wisely.</h2>
      {/* Only show this when there are characters in state */}
      {characters.length > 0 && (
        <div className="character-grid">{renderCharacters()}</div>
      )}

      {mintingCharacter && (
        <div className="loading">
          <div className="indicator">
            <LoadingIndicator />
            <p>Minting In Progress...</p>
          </div>
          <img
            src="https://media2.giphy.com/media/61tYloUgq1eOk/giphy.gif?cid=ecf05e47dg95zbpabxhmhaksvoy8h526f96k4em0ndvx078s&rid=giphy.gif&ct=g"
            alt="Minting loading indicator"
          />
        </div>
      )}
    </div>
  )
}

export default SelectCharacter;