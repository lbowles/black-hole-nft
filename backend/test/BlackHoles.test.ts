import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { expect } from "chai"
import { BigNumber } from "ethers"
import { XMLParser } from "fast-xml-parser"
import { deployments, ethers } from "hardhat"
import { BlackHoles, BlackHoles__factory } from "../types"

describe("BlackHoles", function () {
  let signers: SignerWithAddress[]
  let blackHoles: BlackHoles
  let mintPrice: BigNumber
  let threshold: BigNumber

  beforeEach(async function () {
    await ethers.provider.send("evm_setAutomine", [true])
    await deployments.fixture(["BlackHoles"])
    signers = await ethers.getSigners()
    const BlackHoles = await deployments.get("BlackHoles")
    blackHoles = BlackHoles__factory.connect(BlackHoles.address, signers[0]) as BlackHoles
    mintPrice = await blackHoles.getPrice()
    threshold = await blackHoles.timedSaleThreshold()
  })

  it("Should have the correct price set in the constructor", async function () {
    expect(await blackHoles.price()).to.equal(ethers.utils.parseEther("0.003"))
    expect(await blackHoles.timedSalePrice()).to.equal(ethers.utils.parseEther("0.004"))
  })

  it("Should mint a new NFT and assign it to the caller", async function () {
    const initialSupply = await blackHoles.totalSupply()
    await blackHoles.connect(signers[0]).mint(1, { value: mintPrice })
    const finalSupply = await blackHoles.totalSupply()
    expect(finalSupply).to.equal(initialSupply.add(1))
    expect(await blackHoles.ownerOf(finalSupply)).to.equal(signers[0].address)
  })

  it("Should increase the total supply", async function () {
    let initialSupply = await blackHoles.totalSupply()
    await blackHoles.connect(signers[1]).mint(20, { value: mintPrice.mul(20) })

    expect(await blackHoles.totalSupply()).to.equal(initialSupply.add(20))

    initialSupply = await blackHoles.totalSupply()
  })

  it("Should return the correct token URI for a given token ID", async function () {
    // Mint a new token
    await blackHoles.mint(1, { value: mintPrice })

    const tokenId = 1
    const name = "BlackHole #" + tokenId
    const description = "Fully on-chain, procedurally generated, animated black holes."
    const metadata = await blackHoles.tokenURI(tokenId)

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

  it("Should allow the owner to withdraw their balance", async function () {
    const [owner, minter] = signers
    const initialBalance = await owner.getBalance()
    await blackHoles.connect(minter).mint(1, { value: mintPrice })
    await blackHoles.connect(owner).withdraw()
    const finalBalance = await owner.getBalance()
    expect(finalBalance).to.be.gt(initialBalance)
  })

  it("Should not allow a non-owner to withdraw the contract's balance", async function () {
    await expect(blackHoles.connect(signers[1]).withdraw()).to.be.revertedWith("Ownable: caller is not the owner")
  })

  it("Should allow the owner to airdrop to an array of recipients", async function () {
    const [owner, recipient1, recipient2] = signers
    const initialSupply = await blackHoles.totalSupply()
    const recipients = [recipient1.address, recipient2.address]
    const quantity = 10
    await blackHoles.connect(owner).airdrop(recipients, quantity)
    const finalSupply = await blackHoles.totalSupply()
    expect(finalSupply).to.equal(initialSupply.add(recipients.length * quantity))

    // Check if recipient's balance has increased
    expect(await blackHoles.balanceOf(recipient1.address)).to.equal(quantity)
    expect(await blackHoles.balanceOf(recipient2.address)).to.equal(quantity)
  })

  it("Should not allow a non-owner to airdrop to an array of recipients", async function () {
    const recipients = [signers[1].address]
    const quantity = 10
    await expect(blackHoles.connect(signers[1]).airdrop(recipients, quantity)).to.be.revertedWith(
      "Ownable: caller is not the owner",
    )
  })

  it("Should set the price correctly", async function () {
    // Get current price
    const currentPrice = await blackHoles.price()

    // Set new price
    const newPrice = currentPrice.mul(2)
    await blackHoles.setPrice(newPrice)

    // Check if price has been updated
    expect(await blackHoles.price()).to.equal(newPrice)

    // Try to mint with old price
    await expect(blackHoles.mint(1, { value: currentPrice })).to.be.revertedWith("Insufficient fee")

    // Mint with new price
    await blackHoles.mint(1, { value: newPrice })

    // Check if supply has increased
    expect(await blackHoles.totalSupply()).to.equal(1)
  })

  it("Should refund if the amount sent is greater than the price", async function () {
    const initialBalance = await signers[0].getBalance()
    await blackHoles.mint(1, { value: mintPrice.mul(10) })
    const finalBalance = await signers[0].getBalance()
    expect(finalBalance)
      .to.be.lt(initialBalance.sub(mintPrice))
      .and.gt(initialBalance.sub(mintPrice.mul(10)))
  })

  it("Should start timed sale once the threshold is reached", async function () {
    // Mint state is OPEN (0) at the start
    expect(await blackHoles.getMintState()).to.equal(0)

    // Price should be normal price
    expect(await blackHoles.getPrice()).to.equal(mintPrice)

    expect(await blackHoles.mint(threshold, { value: mintPrice.mul(1000) })).to.emit(blackHoles, "TimedSaleStarted")

    // Mint state is TIMED_SALE (1) after threshold is reached
    expect(await blackHoles.getMintState()).to.equal(1)

    // Price should change to timed sale price
    expect(await blackHoles.getPrice()).to.equal(await blackHoles.timedSalePrice())
  })

  it("Should mint in timed sale", async function () {
    // Trigger timed sale
    mintPrice = await blackHoles.getPrice()
    expect(await blackHoles.connect(signers[1]).mint(threshold, { value: mintPrice.mul(threshold) })).to.emit(
      blackHoles,
      "TimedSaleStarted",
    )

    // Mint in timed sale
    const initialSupply = await blackHoles.totalSupply()

    // Get new price
    mintPrice = await blackHoles.getPrice()

    // Mint
    expect(await blackHoles.mint(1, { value: mintPrice }))
      .to.emit(blackHoles, "Transfer")
      .withArgs(ethers.constants.AddressZero, signers[0].address, 1)

    // Check if supply has increased
    expect(await blackHoles.totalSupply()).to.equal(initialSupply.add(1))

    // Check if recipient's balance has increased
    expect(await blackHoles.balanceOf(signers[0].address)).to.equal(1)

    // Progress time by 24 hours
    await ethers.provider.send("evm_increaseTime", [24 * 60 * 60])
    await ethers.provider.send("evm_mine", [])

    await expect(blackHoles.mint(1, { value: mintPrice })).to.be.revertedWith("Mint is closed")
  })

  it("Should mint the correct amount when crossing the threshold", async function () {
    // Mint up to just before timed sale
    let mintQuantity = threshold.sub(5)
    mintPrice = await blackHoles.getPrice()
    expect(await blackHoles.connect(signers[1]).mint(mintQuantity, { value: mintPrice.mul(mintQuantity) })).to.emit(
      blackHoles,
      "TimedSaleStarted",
    )

    // Mint mint just over threshold
    mintQuantity = BigNumber.from(7)

    const initialBalance = await signers[0].getBalance()

    // Try to mint 7
    const tx = await blackHoles.mint(mintQuantity, { value: mintPrice.mul(mintQuantity) })
    const receipt = await tx.wait()

    // Expect to receive 6 due to higher price
    expect(receipt.events?.filter((event) => event.event === "Transfer").length).to.equal(6)

    // Check refund amount
    const finalBalance = await signers[0].getBalance()
    const newMintPrice = await blackHoles.getPrice()
    expect(finalBalance).to.be.eq(
      initialBalance
        .sub(mintPrice.mul(5).add(newMintPrice.mul(1))) // Mint amount
        .sub(receipt.effectiveGasPrice.mul(receipt.gasUsed)), // Gas
    )
  })

  it("Should merge tokens", async function () {
    /* Complete sale (mint 11,000 tokens) */
    expect(await blackHoles.isMergingEnabled()).to.be.false

    // Mint in threshold sale
    mintPrice = await blackHoles.getPrice()
    await blackHoles.mint(threshold, { value: mintPrice.mul(threshold) })

    // Mint in timed sale
    mintPrice = await blackHoles.getPrice()
    await blackHoles.mint(threshold.mul(10), { value: mintPrice.mul(threshold.mul(10)) })

    expect(await blackHoles.isMergingEnabled()).to.be.false

    // Progress time by timed sale duration
    const timedSaleDuration = await blackHoles.timedSaleDuration()
    await ethers.provider.send("evm_increaseTime", [timedSaleDuration.toNumber()])
    await ethers.provider.send("evm_mine", [])

    expect(await blackHoles.isMergingEnabled()).to.be.false

    await expect(blackHoles.merge([1, 2, 3, 4])).to.be.revertedWith("Merging not enabled")

    // Progress time by merging delay
    const mergingDelay = await blackHoles.mergingDelay()
    await ethers.provider.send("evm_increaseTime", [mergingDelay.toNumber()])
    await ethers.provider.send("evm_mine", [])

    expect(await blackHoles.isMergingEnabled()).to.be.true

    /* Merge */
    const totalMinted = (await blackHoles.totalMinted()).toNumber()
    expect(totalMinted).to.equal(threshold.add(threshold.mul(10)).toNumber())

    const baseUpgradeMass = (await blackHoles.getBaseUpgradeMass()).toNumber()
    const maxLevelTokenCap = (await blackHoles.MAX_SUPPLY_OF_INTERSTELLAR()).toNumber()
    const maxLevel = (await blackHoles.MAX_LEVEL()).toNumber()
    expect(baseUpgradeMass).to.equal(Math.floor(totalMinted / maxLevelTokenCap / 2 ** (maxLevel - 1)))

    // Update correct token's metadata and burn the right tokens
    expect(await blackHoles.merge([1, 2, 3, 4]))
      .to.emit(blackHoles, "MetadataUpdate")
      .withArgs(1)
      .and.to.emit(blackHoles, "Transfer")
      .withArgs(2, ethers.constants.AddressZero, signers[0].address)
      .and.to.emit(blackHoles, "Transfer")
      .withArgs(3, ethers.constants.AddressZero, signers[0].address)
      .and.to.emit(blackHoles, "Transfer")
      .withArgs(4, ethers.constants.AddressZero, signers[0].address)

    let tokenMetadata = await blackHoles.blackHoleForTokenId(1)
    expect(tokenMetadata.mass).to.equal(4)

    let lastTokenId = 4

    let totalGas = BigNumber.from(0)

    for (let level = 1; level <= 4; level++) {
      // Burn to next level
      // Array of numbers from 5 to 12
      const mergeIds = Array.from(Array(baseUpgradeMass * 2 ** (level - 1)).keys()).map((i) => i + lastTokenId + 1)
      const tx = await blackHoles.merge([1, ...mergeIds])
      const receipt = await tx.wait()

      totalGas = totalGas.add(receipt.gasUsed)

      tokenMetadata = await blackHoles.blackHoleForTokenId(1)
      console.log(tokenMetadata)
      expect(tokenMetadata.level).to.equal(level)

      lastTokenId = mergeIds[mergeIds.length - 1]
    }

    console.log("Total gas used:", totalGas.toString())
  })

  it("Should provide the correct names for each level", async function () {
    const names = ["Micro", "Stellar", "Intermediate", "Supermassive", "Primordial"]

    for (let i = 0; i < 5; i++) {
      expect(await blackHoles.nameForBlackHoleLevel(i)).to.equal(names[i])
    }
  })

  it("Should provide the correct level for each mass", async function () {
    // Mint 1,000 tokens
    mintPrice = await blackHoles.getPrice()
    await blackHoles.mint(10_000, { value: mintPrice.mul(10_000) })

    // Get base upgrade mass
    const baseUpgradeMass = (await blackHoles.getBaseUpgradeMass()).toNumber()

    // Check each level
    for (let level = 0; level < 4; level++) {
      const mass = baseUpgradeMass * 2 ** level
      expect(await blackHoles.levelForMass(mass)).to.equal((level + 1).toString())
    }
  })
})
