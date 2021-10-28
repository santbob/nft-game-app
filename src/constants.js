const CONTRACT_ADDRESS = '0x29Ce1beBfd53c4838aef33E73021eD9c857112bA';

const transformCharacterData = (characterData) => {
  return {
    name: characterData.name,
    imageURI: characterData.imageURI,
    hp: characterData.hp.toNumber(),
    maxHp: characterData.maxHp.toNumber(),
    attackDamage: characterData.attackDamage.toNumber(),
  };
};

const transformImageURI = (imageURI) => {
  if(!imageURI.startsWith('http')) {
    return `https://cloudflare-ipfs.com/ipfs/${imageURI}`;
  }
  return imageURI;
}

export { CONTRACT_ADDRESS, transformCharacterData, transformImageURI };