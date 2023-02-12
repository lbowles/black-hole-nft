import * as fs from "fs"
import { DeployFunction } from "hardhat-deploy/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import readline from "readline"
import { waitForBlocks } from "../test/helpers"
import { BlackHoles__factory } from "../types"

function userInput(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close()
      resolve(ans)
    }),
  )
}

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, ethers } = hre
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()
  const signers = await ethers.getSigners()

  let name = "BlackHoles"
  let symbol = "BLACKHOLES"

  const currentBlock = await ethers.provider.getBlockNumber()

  if (hre.network.name !== "mainnet") {
    name = "Test"
    symbol = "TEST"
  }

  console.log(`Current block: ${currentBlock}`)

  // Prompt user to confirm if network, name, symbol are correct each on its own line
  console.log(`\nDeploying to ${hre.network.name}`)
  console.log(`Name: ${name}`)
  console.log(`Symbol: ${symbol}`)
  if (hre.network.name !== "hardhat") {
    const confirm = await userInput("Continue? (y/n)\n> ")
    if (confirm !== "y") {
      console.log("Aborting deployment")
      return
    }
  }

  const utilities = await deployments.get("utils")
  const trigonometry = await deployments.get("Trigonometry")
  const renderer = await deployments.get("Renderer")

  const latestBlock = await ethers.provider.getBlock("latest")
  const fee = await ethers.provider.getFeeData()

  console.log(ethers.utils.formatUnits(fee.gasPrice!, "gwei"), "gwei")
  const deployerBalance = await ethers.provider.getBalance(deployer)
  console.log(ethers.utils.formatEther(deployerBalance), "ETH")

  await deploy("BlackHoles", {
    from: deployer,
    log: true,
    libraries: {
      utils: utilities.address,
      Trigonometry: trigonometry.address,
    },
    args: [name, symbol, ethers.utils.parseEther("0.01"), 1000, renderer.address],
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
  })
}
export default func
func.tags = ["BlackHoles"]
func.dependencies = ["Renderer", "Libraries"]