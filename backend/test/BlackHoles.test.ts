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

  beforeEach(async function () {
    await ethers.provider.send("evm_setAutomine", [true])
    await deployments.fixture(["BlackHoles"])
    signers = await ethers.getSigners()
    const BlackHoles = await deployments.get("BlackHoles")
    blackHoles = BlackHoles__factory.connect(BlackHoles.address, signers[0]) as BlackHoles
    mintPrice = await blackHoles.price()
  })

  it("Should have the correct price set in the constructor", async function () {
    expect(await blackHoles.price()).to.equal(ethers.utils.parseEther("0.01"))
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

  it("Should not allow minting more NFTs than the max supply", async function () {
    await expect(blackHoles.mint(100001, { value: mintPrice.mul("100001") })).to.be.revertedWith("Exceeds max supply")
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

    console.log(json.image)
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

  it("Should not allow minting more than the max per wallet", async function () {
    const maxPerWallet = await blackHoles.maxMintPerWallet()
    console.log(maxPerWallet.toString())
    await blackHoles.mint(maxPerWallet.sub(5), { value: mintPrice.mul(maxPerWallet.sub(5)) })
    await expect(blackHoles.mint(6, { value: mintPrice.mul(6) })).to.be.revertedWith("Exceeds max quantity")
  })
})
