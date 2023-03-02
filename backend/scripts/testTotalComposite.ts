import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { deployments, ethers } from "hardhat"
import { BlackHoles, BlackHoles__factory, BlackHolesV2, BlackHolesV2__factory } from "../types"
import svg2img from "svg2img"
import fs from "fs"

async function main() {
  let signers: SignerWithAddress[]
  let blackHolesV2: BlackHolesV2
  let blackHoles: BlackHoles

  signers = await ethers.getSigners()

  await deployments.fixture(["BlackHolesV2"])

  const BlackHolesV2 = await deployments.get("BlackHolesV2")
  blackHolesV2 = BlackHolesV2__factory.connect(BlackHolesV2.address, signers[0])

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

  await blackHolesV2.setMergeOpenTimestamp(mergeOpenTimestamp)

  // Wait for blocks
  await ethers.provider.send("evm_increaseTime", [mergeOpenTimestamp.toNumber()])
  await ethers.provider.send("evm_mine", [])

  // Migrate tokens
  await blackHoles.setApprovalForAll(blackHolesV2.address, true)

  // Wait for blocks
  await ethers.provider.send("evm_mine", [])

  // Numbers from 1 to 10
  let tokenIds = Array.from(Array(400).keys()).map((n) => n + 1)
  await blackHolesV2.migrate(blackHoles.address, tokenIds)

  // Wait for blocks
  await ethers.provider.send("evm_mine", [])

  /* Merge */

  const upgradeIntervals = await blackHolesV2.getUpgradeIntervals()

  console.log(upgradeIntervals)

  let totalGas = ethers.BigNumber.from(0)

  let svg = ""

  // Create directory
  const outputPath = "composite-out"
  // Create dir if it doesn't exist
  if (!fs.existsSync(outputPath)) fs.mkdirSync(outputPath)

  // fs.writeFileSync("composite-out/test.html", svg)

  let currentMass = 0
  const interval = 1

  for (let i = 1; i < upgradeIntervals[3].toNumber() + 1; i += interval) {
    // Merge to next level
    // Array of numbers from 5 to 12
    const mergeIds = Array.from(Array(interval).keys()).map((i) => tokenIds.pop()!)

    const [, simulatedResultSvg] = await blackHolesV2.blackHoleForMass(1, i)

    const tx = await blackHolesV2.merge([1, ...mergeIds])

    // Wait for blocks
    await ethers.provider.send("evm_mine", [])

    const receipt = await tx.wait()

    totalGas = totalGas.add(receipt.gasUsed)

    const tokenMetadata = await blackHolesV2.blackHoleForTokenId(1)
    console.log(
      `Mass: ${tokenMetadata.mass.toNumber()}, Level: ${tokenMetadata.level.toNumber()}, Name: ${tokenMetadata.name}`,
    )
    currentMass = tokenMetadata.mass.toNumber()

    svg2img(simulatedResultSvg, (error, buffer) => {
      if (error) {
        console.error(error)
        return
      }

      fs.writeFile(`${outputPath}/${currentMass}.png`, buffer, (error) => {
        if (error) {
          console.error(error)
          return
        }

        console.log(`Successfully wrote SVG to ${outputPath}`)
      })
    })
  }

  console.log("Total gas used:", totalGas.toString())

  await new Promise((resolve) => setTimeout(resolve, 1000))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
