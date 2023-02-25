import { DeployFunction } from "hardhat-deploy/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import readline from "readline"
import { BlackHoles__factory } from "../types"
import * as hre from "hardhat"

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

const func = async function () {
  const { deployments, getNamedAccounts, ethers } = hre
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()
  const signers = await ethers.getSigners()

  let name = "Voidable BlackHoles"
  let symbol = "BLACKHOLESVOID"

  const currentBlock = await ethers.provider.getBlockNumber()

  if (hre.network.name !== "mainnet") {
    name = "Test"
    symbol = "TEST"
  }

  const utilities = await deployments.get("utils")
  const renderer = await deployments.get("Renderer")
  const blackHoles = await deployments.get("BlackHoles")

  const blackHolesContract = BlackHoles__factory.connect(blackHoles.address, signers[0])

  const timedSaleStartTimestamp = await blackHolesContract.timedSaleStartedTimestamp()
  const mergingDelay = await blackHolesContract.mergingDelay()
  const mergeOpenTimestamp = timedSaleStartTimestamp.add(mergingDelay)

  console.log(`Current block: ${currentBlock}`)

  // Prompt user to confirm if network, name, symbol are correct each on its own line
  console.log(`\nDeploying to ${hre.network.name}`)
  console.log(`Name: ${name}`)
  console.log(`Symbol: ${symbol}`)
  console.log("Black Holes Address", blackHoles.address)
  console.log("Renderer Address", renderer.address)
  console.log(
    "MergeOpenTimestamp",
    mergeOpenTimestamp.toString(),
    new Date(mergeOpenTimestamp.toNumber() * 1000).toISOString(),
  )
  if (hre.network.name !== "hardhat") {
    const confirm = await userInput("Continue? (y/n)\n> ")
    if (confirm !== "y") {
      console.log("Aborting deployment")
      return
    }
  }

  const fee = await ethers.provider.getFeeData()

  console.log(ethers.utils.formatUnits(fee.gasPrice!, "gwei"), "gwei")
  const deployerBalance = await ethers.provider.getBalance(deployer)
  console.log(ethers.utils.formatEther(deployerBalance), "ETH")

  await deploy("VoidableBlackHoles", {
    from: deployer,
    log: true,
    libraries: {
      utils: utilities.address,
    },
    args: [name, symbol, mergeOpenTimestamp, renderer.address, blackHoles.address],
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
    // gasPrice: ethers.utils.parseUnits("37", "gwei"),
  })
}

func()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
