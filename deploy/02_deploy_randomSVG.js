const networkConfig  = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy, get, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  let linkTokenAddress;
 let vrfCoordinatorAddress;
 
 // log(networkConfig)

  if (chainId == 31337) {
   let linkToken = await get("LinkToken");
    linkTokenAddress = linkToken.address;

    let vrfCoordinatorMock = await get("VRFCoordinatorMock");
    vrfCoordinatorAddress = vrfCoordinatorMock.address;
  } else {
    linkTokenAddress = networkConfig[chainId]["linkToken"];
    vrfCoordinatorAddress = networkConfig[chainId]["vrfCoordinator"];
  }

  const keyHash = networkConfig[chainId]["keyHash"];
  const fee = networkConfig[chainId]["fee"];

  let args = [vrfCoordinatorAddress, linkTokenAddress, keyHash, fee];

  log(
    "_________________________________________________________________________________"
  );
  const RandomSVG = await deploy("RandomSVG", {
    from: deployer,
    args: args,
    log: true,
  });
 
 log("You have deployed your NFT contract!")

 const networkName = networkConfig[chainId]["name"]

 log(`${args.toString()}`)

 log(`Verify with: \n npx hardhat verify --network ${networkName} ${RandomSVG.address} ${args.toString().replace(/,/g, " ")}`)


 // Fund with link
 const linkTokenContract = await ethers.getContractFactory("LinkToken")
 const accounts = await hre.ethers.getSigners()
 const signer = accounts[0]
 const linkToken = new ethers.Contract(linkTokenAddress, linkTokenContract.interface, signer)

 log("We are here\n")

 let fund_tx = await linkToken.transfer(RandomSVG.address, fee)
 

 const RandomSVGContract = await ethers.getContractFactory("RandomSVG")
 const randomSVG = new ethers.Contract(RandomSVG.address, RandomSVGContract.interface, signer)

 let creation_tx = await randomSVG.create({ gasLimit: 300000 })
 let receipt = await creation_tx.wait(1)

 console.log(receipt)
 let tokenId = receipt.events[3].topics[2]

 log(`You've made your NFT! This is the token number ${tokenId.toString()}`)
 log(`Let's wait for the chainlink node to respond`)

 if (chainId != 31337) {
  await new Promise(r => setTimeout(r, 180000))
  log("Now let's finish the mint")
  let finish_tx = await randomSVG.finishMint(tokenId, { gasLimit: 2000000 })
  await finish_tx.wait(1)
  log(`You can view the tokenURI here ${await randomSVG.tokenURI(tokenId)}`)
  
 } else {
  const VRFCoordinatorMock = await get("VRFCoordinatorMock");
  vrfCoordinator = await ethers.getContractAt("VRFCoordinatorMock", VRFCoordinatorMock.address, signer);
  let vrf_tx = await vrfCoordinator.callBackWithRandomness(receipt.logs[3].topics[1], 77777, randomSVG.address)

  await vrf_tx.wait(1)

  log("Now let's finish the mint")
  let finish_tx = await randomSVG.finishMint(tokenId, { gasLimit: 2000000 })
  await finish_tx.wait(1)
  log(`You can view the tokenURI here: ${await randomSVG.tokenURI(tokenId)}`)

 }
};

module.exports.tags = ["all", "rsvg"]; // hh deploy --tags rsvg

// yarn add ethers hardhat @nomiclabs/hardhat-waffle ethereum-waffle chai @nomiclabs/hardhat-ethers web3modal @openzeppelin/contracts ipfs-http-client axios
// yarn add -D tailwindcss@latest postcss@latest autoprefixer@latest