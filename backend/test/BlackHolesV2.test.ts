import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { expect } from "chai"
import { BigNumber } from "ethers"
import { XMLParser } from "fast-xml-parser"
import { deployments, ethers } from "hardhat"
import {
  BlackHoles,
  BlackHoles__factory,
  VoidableBlackHoles,
  BlackHolesV2 as BlackHolesV2,
  BlackHolesV2__factory,
  VoidableBlackHoles__factory,
} from "../types"

describe("BlackHolesV2", function () {
  let signers: SignerWithAddress[]
  let blackHolesV2: BlackHolesV2
  let voidableBlackHoles: VoidableBlackHoles
  let blackHoles: BlackHoles
  let beforeMerge: BigNumber

  beforeEach(async function () {
    await ethers.provider.send("evm_setAutomine", [true])
    await deployments.fixture(["BlackHolesV2"])
    signers = await ethers.getSigners()
    const BlackHolesV2 = await deployments.get("BlackHolesV2")
    blackHolesV2 = BlackHolesV2__factory.connect(BlackHolesV2.address, signers[0])

    const BlackHoles = await deployments.get("BlackHoles")
    blackHoles = BlackHoles__factory.connect(BlackHoles.address, signers[0])

    const VoidableBlackHoles = await deployments.get("VoidableBlackHoles")
    voidableBlackHoles = VoidableBlackHoles__factory.connect(VoidableBlackHoles.address, signers[0])

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
   * Should migrate tokens from both old contracts to new contracts
   * Should merge migrated tokens on new contract
   */
  it("Should migrate tokens from Black Holes to the new contract", async function () {
    // Tokens 1 - 10
    const tokensToMerge = Array.from({ length: 10 }, (_, index) => index + 1)
    await blackHoles.merge(tokensToMerge)

    // Get token 1 mass
    const token1Mass = await blackHoles.massForTokenId(1)

    // We migrate token 1
    await blackHoles.setApprovalForAll(blackHolesV2.address, true)

    expect(await blackHolesV2.migrate(blackHoles.address, [1]))
      .to.emit(blackHolesV2, "Transfer")
      .withArgs(signers[0].address, ethers.constants.One, 1)
      .and.to.emit(blackHolesV2, "Transfer")
      .withArgs(ethers.constants.AddressZero, signers[0].address, 1)

    // Expect mass to be the same as before
    expect(await blackHolesV2.massForTokenId(1)).to.equal(token1Mass)

    expect(await blackHolesV2.balanceOf(signers[0].address)).to.equal(1)
  })

  it("Should migrate tokens from Voidable Black Holes to the new contract", async function () {
    // Merge tokens to voidableBlackHoles
    await blackHoles.setApprovalForAll(voidableBlackHoles.address, true)

    // Migrate tokens 1-10
    const tokensToMigrate = Array.from({ length: 10 }, (_, index) => index + 1)
    await voidableBlackHoles.mint(tokensToMigrate)

    // Merge tokens 1-10
    await voidableBlackHoles.merge(tokensToMigrate)

    // Get token 1 mass
    const token1Mass = await voidableBlackHoles.massForTokenId(1)

    // Migrate token 1
    await voidableBlackHoles.setApprovalForAll(blackHolesV2.address, true)

    expect(await blackHolesV2.migrate(voidableBlackHoles.address, [1]))
      .to.emit(voidableBlackHoles, "Transfer")
      .withArgs(signers[0].address, ethers.constants.One, 1)
      .and.to.emit(blackHolesV2, "Transfer")
      .withArgs(ethers.constants.AddressZero, signers[0].address, 1)

    // Expect mass to be the same as before
    expect(await blackHolesV2.massForTokenId(1)).to.equal(token1Mass)

    expect(await blackHolesV2.balanceOf(signers[0].address)).to.equal(1)
  })

  it("Should merge migrated tokens on new contract", async function () {
    // Merge tokens 1-10 and 11-20 on old contract
    let tokensToMerge = Array.from({ length: 10 }, (_, index) => index + 1)
    await blackHoles.merge(tokensToMerge)
    tokensToMerge = Array.from({ length: 10 }, (_, index) => index + 11)
    await blackHoles.merge(tokensToMerge)

    const token1Mass = await blackHoles.massForTokenId(1)
    const token11Mass = await blackHoles.massForTokenId(11)

    expect(token1Mass.toNumber()).to.equal(token11Mass.toNumber())

    // Migrate tokens 1 and 11
    await blackHoles.setApprovalForAll(blackHolesV2.address, true)
    await blackHolesV2.migrate(blackHoles.address, [1, 11])

    // Merge tokens 1 and 11 on new contract
    expect(await blackHolesV2.merge([11, 1]))
      .to.emit(blackHolesV2, "Transfer")
      .withArgs(signers[0].address, ethers.constants.AddressZero, 1)
      .and.to.emit(blackHolesV2, "MetadataUpdate")
      .withArgs(11)

    // Expect token 11 on new contract to have mass of both combined
    expect(await blackHolesV2.massForTokenId(11)).to.equal(token1Mass.add(token11Mass))
  })

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

  it("Should return valid svg for each level", async function () {
    const upgradeIntervals = [1, ...(await blackHolesV2.getUpgradeIntervals())]
    console.log(upgradeIntervals)
    for (let i = 0; i < upgradeIntervals.length - 1; i++) {
      const [, svg] = await blackHolesV2.blackHoleForMass(1, upgradeIntervals[i])
      const parser = new XMLParser()
      expect(parser.parse(svg, true)).to.not.throw
    }
  })

  it("Should merge tokens", async function () {
    expect(await blackHolesV2.unmigratedBlackHoles()).to.equal(blackHoles.address)

    expect(await blackHolesV2.isMergingEnabled()).to.be.true

    // Migrate tokens
    await blackHoles.setApprovalForAll(blackHolesV2.address, true)

    // Numbers from 1 to 10
    let tokenIds = Array.from(Array(400).keys()).map((n) => n + 1)
    expect(await blackHolesV2.migrate(blackHoles.address, tokenIds))

    /* Merge */
    // Update correct token's metadata and burn the right tokens
    expect(await blackHolesV2.merge([1, 2, 3, 4]))
      .to.emit(blackHolesV2, "MetadataUpdate")
      .withArgs(1)
      .and.to.emit(blackHolesV2, "Transfer")
      .withArgs(2, ethers.constants.AddressZero, signers[0].address)
      .and.to.emit(blackHolesV2, "Transfer")
      .withArgs(3, ethers.constants.AddressZero, signers[0].address)
      .and.to.emit(blackHolesV2, "Transfer")
      .withArgs(4, ethers.constants.AddressZero, signers[0].address)

    let tokenMetadata = await blackHolesV2.blackHoleForTokenId(1)
    expect(tokenMetadata.mass).to.equal(4)

    const upgradeIntervals = await blackHolesV2.getUpgradeIntervals()

    let lastTokenId = 4

    let totalGas = BigNumber.from(0)
    let currentMass = 1

    for (let level = 0; level < 4; level++) {
      // Merge to next level
      // Array of numbers from 5 to 12
      const mergeIds = Array.from(Array(upgradeIntervals[level].toNumber()).keys()).map((i) => i + lastTokenId + 1)

      const tx = await blackHolesV2.merge([1, ...mergeIds])
      const receipt = await tx.wait()

      totalGas = totalGas.add(receipt.gasUsed)

      tokenMetadata = await blackHolesV2.blackHoleForTokenId(1)
      currentMass = tokenMetadata.mass.toNumber()
      // console.log(`Mass: ${tokenMetadata.mass}`)
      console.log(tokenMetadata)
      expect(tokenMetadata.level).to.equal(level + 1)

      lastTokenId = mergeIds[mergeIds.length - 1]
    }

    console.log("Total gas used:", totalGas.toString())
  })

  it("Should return the correct colour adjustment for a given mass", async function () {
    const upgradeIntervals = await blackHolesV2.getUpgradeIntervals()
    console.log(upgradeIntervals.map((i) => i.toNumber()))
    for (let i = 1; i <= upgradeIntervals[3].toNumber(); i += 1) {
      const adjustment = await blackHolesV2.getAdjustmentForMass(i)
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

  // TODO: Check that it fails to migrate if token address is not a whitelisted contract
})
