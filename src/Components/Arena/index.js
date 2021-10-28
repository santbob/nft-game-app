import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, transformCharacterData } from '../../constants';
import MyEpicGame from '../../utils/MyEpicGame.json';
import './Arena.css';
import LoadingIndicator from './../LoadingIndicator';

/*
 * We pass in our characterNFT metadata so we can a cool card in our UI
 */
const Arena = ({ characterNFT, setCharacterNFT }) => {
  // State
  const [gameContract, setGameContract] = useState(null);
  const [bigBoss, setBigBoss] = useState(null);
  const [attackState, setAttackState] = useState('');
  const [showToast, setShowToast] = useState(false);

  const runAttackAction = async () => {
    try {
      if (gameContract) {
        setAttackState('attacking');
        console.log("Attacking boss");
        const attackTxn = await gameContract.attackBoss();
        await attackTxn.wait();
        console.log("AttackTxn", attackTxn);
        setAttackState('hit');
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    } catch (err) {
      console.error(err);
      setAttackState('');
    }
  }
  // UseEffects
  useEffect(() => {
    const { ethereum } = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        MyEpicGame.abi,
        signer
      );

      setGameContract(contract);
    } else {
      console.log('Ethereum object not found');
    }
  }, []);

  useEffect(() => {
    const fetchBigBoss = async () => {
      const bossTxn = await gameContract.getBigBoss();
      console.log("BigBoss data ", bossTxn);
      setBigBoss(transformCharacterData(bossTxn));
    }

    const onAttackComplete = async (bossNewHp, playerNewHp) => {
      const bossHp = bossNewHp.toNumber();
      const playerHp = playerNewHp.toNumber();

      console.log(`AttackComplete: Boss Hp: ${bossHp} Player Hp: ${playerHp}`);

      setBigBoss((prevState) => {
        return { ...prevState, hp: bossHp }
      })

      setCharacterNFT((prevState) => {
        return { ...prevState, hp: playerHp }
      })
    }

    if (gameContract) {
      fetchBigBoss()
      gameContract.on('AttackComplete', onAttackComplete)
    }

    return () => {
      if (gameContract) {
        gameContract.off('AttackComplete', onAttackComplete)
      }
    }
  }, [gameContract]);

  return (
    <div className="arena-container">
      {showToast && (
        <div id="toast" className="show">
          <div id="desc">{`💥 ${bigBoss.name} was hit for ${characterNFT.attackDamage}!`}</div>
        </div>
      )}

      {bigBoss && (
        <div className="boss-container">
          <div className={`boss-content`}>
            <h2>🔥 {bigBoss.name} 🔥</h2>
            <div className="image-content">
              <img src={bigBoss.imageURI} alt={`Boss ${bigBoss.name}`} />
              <div className="health-bar">
                <progress value={bigBoss.hp} max={bigBoss.maxHp} />
                <p>{`${bigBoss.hp} / ${bigBoss.maxHp} HP`}</p>
              </div>
            </div>
          </div>
          <div className="attack-container">
            <button className="cta-button" onClick={runAttackAction}>
              {`💥 Attack ${bigBoss.name}`}
            </button>
          </div>
          {attackState === 'attacking' && (
            <div className="loading-indicator">
              <LoadingIndicator />
              <p>Attacking ⚔️</p>
            </div>
          )}
        </div>
      )}

      {characterNFT && (
        <div className="players-container">
          <div className="player-container">
            <h2>Your Character</h2>
            <div className="player">
              <div className="image-content">
                <h2>{characterNFT.name}</h2>
                <img
                  src={characterNFT.imageURI}
                  alt={`Character ${characterNFT.name}`}
                />
                <div className="health-bar">
                  <progress value={characterNFT.hp} max={characterNFT.maxHp} />
                  <p>{`${characterNFT.hp} / ${characterNFT.maxHp} HP`}</p>
                </div>
              </div>
              <div className="stats">
                <h4>{`⚔️ Attack Damage: ${characterNFT.attackDamage}`}</h4>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Arena;