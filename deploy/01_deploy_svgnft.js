const fs = require("fs")
let networkConfig = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
 const { deploy, log } = deployments
 
 const { deployer } = await getNamedAccounts()
 const chainId = await getChainId()
 
 const SVGNFT = await deploy("SVGNFT", {from: deployer, log: true}) // It only has address and the abi and some extra stuffs
 
 log(`You have deployed an NFT contract to ${SVGNFT.address}`)

 let filePath = "./img/triangle.svg"
 let svg = fs.readFileSync(filePath, { encoding: "utf8" })
 
 const svgNFTContract = await ethers.getContractFactory("SVGNFT") // JSON file is passed as argument. This has interface, bytecode, errors, events, structs, deploy, signer and some extra stuffs
 const accounts = await hre.ethers.getSigners()
 const signer = accounts[0]

 const svgNFT = new ethers.Contract(SVGNFT.address, svgNFTContract.interface, signer)
 const networkName = networkConfig[chainId]["name"]


 // log("________________________________________________Testing________________________________________")
 
 // log(`svgNFT:`)
 // // log(svgNFT)
 // log(`\nsvgNFTContract: `)
 // // log(svgNFTContract)
 // log(`\nSVGNFT:`)
 // // log(SVGNFT)
 
 // log(`\n\nsvgNFT.address: ${svgNFT.address}`)
 // log(`svgNFTContract.address: ${svgNFTContract.address}`)
 // log(`SVGNFT.address: ${SVGNFT.address}`)
 // log("_________________________________________End of Testing________________________________________")

 log(`Verify with: \n npx hardhat verify --network ${networkName} ${svgNFT.address}`)

 let tx = await svgNFT.create(svg)
 await tx.wait(1)

 log("You've made an NFT")
 log(`You can view the token URI here: ${await svgNFT.tokenURI(0)}`)


}

module.exports.tags = ["all", "svg"]
