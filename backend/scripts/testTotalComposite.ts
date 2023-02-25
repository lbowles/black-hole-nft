import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { deployments, ethers } from "hardhat"
import { BlackHoles, BlackHoles__factory, VoidableBlackHoles, VoidableBlackHoles__factory } from "../types"

const fs = require("fs")

async function main() {
  let signers: SignerWithAddress[]
  let voidableBlackHoles: VoidableBlackHoles
  let blackHoles: BlackHoles

  signers = await ethers.getSigners()

  await deployments.fixture(["VoidableBlackHoles"])

  const VoidableBlackHoles = await deployments.get("VoidableBlackHoles")
  voidableBlackHoles = VoidableBlackHoles__factory.connect(VoidableBlackHoles.address, signers[0])

  const BlackHoles = await deployments.get("BlackHoles")
  blackHoles = BlackHoles__factory.connect(BlackHoles.address, signers[0])

  // Mint in threshold sale
  let mintPrice = await blackHoles.getPrice()
  console.log("treshold sale mint price", ethers.utils.formatEther(mintPrice))
  let threshold = await blackHoles.timedSaleThreshold()
  console.log("threshold", threshold.toNumber())
  await blackHoles.mint(threshold.add(3), { value: mintPrice.mul(threshold.add(3)) })

  // Wait for blocks
  await ethers.provider.send("evm_mine", [])

  // Mint up to 6,700 tokens in timed sale
  mintPrice = ethers.utils.parseEther("0.004")
  console.log("open mint price", ethers.utils.formatEther(mintPrice))
  let totalMinted = await blackHoles.totalMinted()
  let remaining = 6700 - totalMinted.toNumber()
  await blackHoles.mint(remaining, { value: mintPrice.mul(remaining) })

  // Wait for blocks
  await ethers.provider.send("evm_mine", [])

  console.log("total minted", (await blackHoles.totalMinted()).toNumber())

  // Progress time by timed sale duration and merge delay
  const timedSaleStartTimestamp = await blackHoles.timedSaleStartedTimestamp()
  const mergingDelay = await blackHoles.mergingDelay()
  const mergeOpenTimestamp = timedSaleStartTimestamp.add(mergingDelay)

  await voidableBlackHoles.setMergeOpenTimestamp(mergeOpenTimestamp)

  // Wait for blocks
  await ethers.provider.send("evm_increaseTime", [mergeOpenTimestamp.toNumber()])
  await ethers.provider.send("evm_mine", [])

  // Migrate tokens
  await blackHoles.setApprovalForAll(voidableBlackHoles.address, true)

  // Wait for blocks
  await ethers.provider.send("evm_mine", [])

  // Numbers from 1 to 10
  let tokenIds = Array.from(Array(400).keys()).map((n) => n + 1)
  await voidableBlackHoles.mint(tokenIds)

  // Wait for blocks
  await ethers.provider.send("evm_mine", [])

  /* Merge */

  const upgradeIntervals = await voidableBlackHoles.getUpgradeIntervals()

  console.log(upgradeIntervals)

  let totalGas = ethers.BigNumber.from(0)

  let svg = ""

  fs.writeFileSync("test.html", svg)

  let currentMass = 1

  for (let mass = 5; mass < upgradeIntervals[3].toNumber() + 5; mass += 5) {
    // Merge to next level
    // Array of numbers from 5 to 12
    const mergeIds = Array.from(Array(mass - currentMass).keys()).map((i) => tokenIds.pop()!)

    console.log("Merging", mergeIds)

    const [simuulatedResult, simulatedResultSvg] = await voidableBlackHoles.simulateMerge([1, ...mergeIds])

    const tx = await voidableBlackHoles.merge([1, ...mergeIds])

    // Wait for blocks
    await ethers.provider.send("evm_mine", [])

    const receipt = await tx.wait()

    totalGas = totalGas.add(receipt.gasUsed)

    const tokenMetadata = await voidableBlackHoles.blackHoleForTokenId(1)
    console.log(
      `Mass: ${tokenMetadata.mass.toNumber()}, Level: ${tokenMetadata.level.toNumber()}, Name: ${tokenMetadata.name}`,
    )
    currentMass = tokenMetadata.mass.toNumber()

    svg += `<iframe style="width: 500px; height: 500px;" srcdoc='${simulatedResultSvg}'></iframe>`
    fs.writeFileSync("test.html", svg)
  }

  console.log("Total gas used:", totalGas.toString())
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
