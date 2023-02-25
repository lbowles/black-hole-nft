import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { expect } from "chai"
import { BigNumber } from "ethers"
import { XMLParser } from "fast-xml-parser"
import { deployments, ethers } from "hardhat"
import { BlackHoles, BlackHoles__factory, VoidableBlackHoles, VoidableBlackHoles__factory } from "../types"

describe.only("VoidableBlackHoles", function () {
  let signers: SignerWithAddress[]
  let voidableBlackHoles: VoidableBlackHoles
  let blackHoles: BlackHoles
  let beforeMerge: BigNumber

  beforeEach(async function () {
    await ethers.provider.send("evm_setAutomine", [true])
    await deployments.fixture(["VoidableBlackHoles"])
    signers = await ethers.getSigners()
    const VoidableBlackHoles = await deployments.get("VoidableBlackHoles")
    voidableBlackHoles = VoidableBlackHoles__factory.connect(VoidableBlackHoles.address, signers[0])

    const BlackHoles = await deployments.get("BlackHoles")
    blackHoles = BlackHoles__factory.connect(BlackHoles.address, signers[0])

    /* Complete sale (mint 6,700 tokens) */
    expect(await blackHoles.isMergingEnabled()).to.be.false

    // Mint in threshold sale
    let mintPrice = await blackHoles.getPrice()
    let threshold = await blackHoles.timedSaleThreshold()
    await blackHoles.mint(threshold, { value: mintPrice.mul(threshold) })

    // Mint up to 6,700 tokens in timed sale
    mintPrice = await blackHoles.getPrice()
    let totalMinted = await blackHoles.totalMinted()
    let remaining = 6700 - totalMinted.toNumber()
    await blackHoles.mint(remaining, { value: mintPrice.mul(remaining) })

    expect(await blackHoles.totalMinted()).to.equal(6700)

    // Progress time by timed sale duration and merge delay
    const timedSaleStartTimestamp = await blackHoles.timedSaleStartedTimestamp()
    const mergingDelay = await blackHoles.mergingDelay()
    const mergeOpenTimestamp = timedSaleStartTimestamp.add(mergingDelay)

    await voidableBlackHoles.setMergeOpenTimestamp(mergeOpenTimestamp)

    // Take snapshot
    beforeMerge = await ethers.provider.send("evm_snapshot", [])
    await ethers.provider.send("evm_increaseTime", [mergeOpenTimestamp.toNumber()])
    await ethers.provider.send("evm_mine", [])
  })

  /**
   * Colours
   */

  it("Should wait for the merge delay to pass before merging", async function () {
    // Revert to beforeMerge snapshot
    await ethers.provider.send("evm_revert", [beforeMerge])
    // Get merge timestamp
    const mergeTimestamp = await voidableBlackHoles.mergeOpenTimestamp()
    const currentTimestamp = await ethers.provider.getBlock("latest").then((block) => block.timestamp)

    expect(await voidableBlackHoles.isMergingEnabled()).to.be.false

    await ethers.provider.send("evm_increaseTime", [mergeTimestamp.sub(currentTimestamp).toNumber() + 1])
    await ethers.provider.send("evm_mine", [])

    expect(await voidableBlackHoles.isMergingEnabled()).to.be.true
  })

  it("Should migrate tokens from the old contract to the new contract", async function () {
    await blackHoles.setApprovalForAll(voidableBlackHoles.address, true)

    expect(await voidableBlackHoles.mint([1, 2, 3, 4]))
      // Burn
      .to.emit(blackHoles, "Transfer")
      .withArgs(signers[0].address, ethers.constants.One, 1)
      .and.to.emit(blackHoles, "Transfer")
      .withArgs(signers[0].address, ethers.constants.One, 2)
      .and.to.emit(blackHoles, "Transfer")
      .withArgs(signers[0].address, ethers.constants.One, 3)
      .and.to.emit(blackHoles, "Transfer")
      .withArgs(signers[0].address, ethers.constants.One, 4)
      // Mint
      .and.to.emit(voidableBlackHoles, "Transfer")
      .withArgs(ethers.constants.AddressZero, signers[0].address, 1)
      .and.to.emit(voidableBlackHoles, "Transfer")
      .withArgs(ethers.constants.AddressZero, signers[0].address, 2)
      .and.to.emit(voidableBlackHoles, "Transfer")
      .withArgs(ethers.constants.AddressZero, signers[0].address, 3)
      .and.to.emit(voidableBlackHoles, "Transfer")
      .withArgs(ethers.constants.AddressZero, signers[0].address, 4)

    expect(await voidableBlackHoles.balanceOf(signers[0].address)).to.equal(4)
    expect(await voidableBlackHoles.totalSupply()).to.equal(4)
    expect(await voidableBlackHoles.totalMinted()).to.equal(4)
  })

  it("Should return a valid token URI for a given token ID", async function () {
    // Mint a new token
    await blackHoles.setApprovalForAll(voidableBlackHoles.address, true)
    await voidableBlackHoles.mint([1])

    const tokenId = 1
    const name = "Voidable BlackHole #" + tokenId
    const description = "Fully on-chain, procedurally generated, animated black holes. Ready to be merged."
    const metadata = await voidableBlackHoles.tokenURI(tokenId)

    // Decode base64 encoded json
    const decoded = Buffer.from(metadata.split(",")[1], "base64").toString()
    const json = JSON.parse(decoded)

    expect(json.name).to.equal(name)
    expect(json.description).to.equal(description)
    expect(json.image).to.contain("data:image/svg+xml;base64")

    // console.log(json.image)
    const svg = Buffer.from(json.image.split(",")[1], "base64").toString()
    const parser = new XMLParser()
    expect(parser.parse(svg, true)).to.not.throw
  })

  it("Should merge tokens", async function () {
    expect(await voidableBlackHoles.unmigratedBlackHoles()).to.equal(blackHoles.address)

    expect(await voidableBlackHoles.isMergingEnabled()).to.be.true

    // Migrate tokens
    await blackHoles.setApprovalForAll(voidableBlackHoles.address, true)

    // Numbers from 1 to 10
    let tokenIds = Array.from(Array(400).keys()).map((n) => n + 1)
    expect(await voidableBlackHoles.mint(tokenIds))

    /* Merge */
    // Update correct token's metadata and burn the right tokens
    expect(await voidableBlackHoles.merge([1, 2, 3, 4]))
      .to.emit(voidableBlackHoles, "MetadataUpdate")
      .withArgs(1)
      .and.to.emit(voidableBlackHoles, "Transfer")
      .withArgs(2, ethers.constants.AddressZero, signers[0].address)
      .and.to.emit(voidableBlackHoles, "Transfer")
      .withArgs(3, ethers.constants.AddressZero, signers[0].address)
      .and.to.emit(voidableBlackHoles, "Transfer")
      .withArgs(4, ethers.constants.AddressZero, signers[0].address)

    let tokenMetadata = await voidableBlackHoles.blackHoleForTokenId(1)
    expect(tokenMetadata.mass).to.equal(4)

    const upgradeIntervals = await voidableBlackHoles.getUpgradeIntervals()

    console.log(upgradeIntervals)

    let lastTokenId = 4

    let totalGas = BigNumber.from(0)

    for (let level = 0; level < 4; level++) {
      // Merge to next level
      // Array of numbers from 5 to 12
      const mergeIds = Array.from(Array(upgradeIntervals[level].toNumber()).keys()).map((i) => i + lastTokenId + 1)
      const [simuulatedResult, simulatedResultSvg] = await voidableBlackHoles.simulateMerge([1, ...mergeIds])

      const tx = await voidableBlackHoles.merge([1, ...mergeIds])
      const receipt = await tx.wait()

      totalGas = totalGas.add(receipt.gasUsed)

      tokenMetadata = await voidableBlackHoles.blackHoleForTokenId(1)
      expect(tokenMetadata.mass).to.equal(simuulatedResult.mass)
      console.log(tokenMetadata)
      expect(tokenMetadata.level).to.equal(level + 1)

      lastTokenId = mergeIds[mergeIds.length - 1]
    }

    console.log("Total gas used:", totalGas.toString())
  })

  it("Should return the correct colour adjustment for a given mass", async function () {
    const upgradeIntervals = await voidableBlackHoles.getUpgradeIntervals()
    console.log(upgradeIntervals.map((i) => i.toNumber()))
    for (let i = 1; i <= upgradeIntervals[3].toNumber(); i += 1) {
      const adjustment = await voidableBlackHoles.getAdjustmentForMass(i)
      // Expect the adjustment to be between 0 and and 20
      expect(adjustment).to.be.gte(0).and.lte(20)
      // Expect the adjustment to be 0 when the mass is equal to one of the upgrade intervals - 1
      if (upgradeIntervals.find((interval, index) => interval.toNumber() === i && index !== 0 && index !== 3)) {
        expect(adjustment).to.equal(20)
      }
      if (upgradeIntervals.find((interval, index) => interval.toNumber() - 1 === i && index !== 0 && index !== 3)) {
        console.log("adjustment for mass", i, "is", adjustment.toString())
        expect(adjustment).to.equal(0)
      }

      // For mass of 1 it should be 20
      if (i === 1) {
        expect(adjustment).to.equal(20)
      }

      // For mass of upgradeIntervals[3].toNumber() it should be 0
      if (i === upgradeIntervals[3].toNumber()) {
        expect(adjustment).to.equal(0)
      }
    }
  })
})
