import { task } from "hardhat/config"
import { BlackHoles, BlackHoles__factory } from "../types"

task("token", "Get tokenURI for token id", async ({ id }, hre) => {
  const { ethers, deployments } = hre
  const [signer] = await ethers.getSigners()
  const BlackHoles = await deployments.get("BlackHoles")
  const blackHoles = BlackHoles__factory.connect(BlackHoles.address, signer) as BlackHoles

  const uri = await blackHoles.tokenURI(id)
  console.log(`Token URI: ${uri}`)
}).addParam<number>("id", "ID of token to get URI for")
