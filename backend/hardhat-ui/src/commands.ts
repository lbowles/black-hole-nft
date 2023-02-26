import { BigNumber, ethers } from "ethers"
import { BlackHoles__factory } from "../../types/factories/BlackHoles__factory"
import { VoidableBlackHoles__factory } from "../../types/factories/VoidableBlackHoles__factory"
import { getTokensByOwnerLocal } from "./getTokensByOwner"

const blackholesDeployment = require(`../../deployments/localhost/BlackHoles.json`)
const voidableBlackHolesDeployment = require(`../../deployments/localhost/VoidableBlackHoles.json`)

export interface ICommand {
  name: string
  description: string
  command: string
  inputs: IInput[]
  execute: (provider: ethers.providers.JsonRpcProvider, inputs: IInput[]) => Promise<any>
}
interface IInput {
  name: string
  value?: string
  options?: string[]
}
const signer1key = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
const signer2key = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
export const COMMANDS: ICommand[] = [
  {
    name: "Increase time",
    description: "Increase time in block.timestamp",
    command: "evm_increaseTime",
    inputs: [
      {
        name: "amount",
        value: "1",
      },
      { name: "unit", value: "days" },
    ],
    execute: async (provider: ethers.providers.JsonRpcProvider, inputs: IInput[]) => {
      const [amountInput, unitInput] = inputs
      const amount = parseInt(amountInput.value!)
      const unit = unitInput.value
      const seconds = getSeconds(amount, unit!)
      provider.send("evm_increaseTime", [seconds])
    },
  },
  {
    name: "Mint black holes",
    description: "Mint black holes",
    command: "mint",
    inputs: [
      {
        name: "amount",
        value: "1",
      },
    ],
    execute: async (provider: ethers.providers.JsonRpcProvider, inputs: IInput[]) => {
      const [amountInput] = inputs
      console.log(provider.network.name, inputs)
      const amount = ethers.BigNumber.from(amountInput.value!)
      const signer = new ethers.Wallet(signer1key, provider)

      console.log(provider.network.name)

      const blackHoles = BlackHoles__factory.connect(blackholesDeployment.address, signer)

      const price = await blackHoles.getPrice()

      const tx = await blackHoles.mint(amount, { value: price.mul(amount) })
      console.log("Minted black holes:", tx.hash)
    },
  },
  {
    name: "Skip to merge",
    description:
      "Skips to merge with 6700 total minted. 300 in 2nd signer (0x70997970C51812dc3A010C7d01b50e0d17dc79C8)",
    command: "skipToMerge",
    inputs: [
      {
        name: "amount in second signer",
        value: "300",
      },
    ],
    execute: async (provider: ethers.providers.JsonRpcProvider, inputs: IInput[]) => {
      const signer = new ethers.Wallet(signer1key, provider)

      const signer2 = new ethers.Wallet(signer2key, provider)

      const [amountInSecondSigner] = inputs

      const blackholesDeployment = require(`../../deployments/localhost/BlackHoles.json`)
      const blackHoles = BlackHoles__factory.connect(blackholesDeployment.address, signer)

      const totalMinted = await blackHoles.totalMinted()
      let price = await blackHoles.getPrice()
      const threshold = await blackHoles.timedSaleThreshold()
      if (totalMinted.toNumber() === 0) {
        // Mint threshold
        await blackHoles.mint(threshold, { value: price.mul(threshold) })
      } else {
        // Set merging threshold to current total minted + 1 and mint one
        await blackHoles.setTimedSaleThreshold(totalMinted.add(1))
        await blackHoles.mint(1, { value: price })
      }

      // Mine block
      provider.send("evm_mine", [])

      price = await blackHoles.getPrice()

      const targetAmountInSecondSigner = amountInSecondSigner.value!
      await blackHoles
        .connect(signer2)
        .mint(targetAmountInSecondSigner, { value: price.mul(targetAmountInSecondSigner) })

      // Mine block
      provider.send("evm_mine", [])

      const remainingAmount = BigNumber.from(6570).sub(threshold).sub(targetAmountInSecondSigner)
      await blackHoles.mint(remainingAmount, { value: remainingAmount.mul(price) })

      // Mine block
      provider.send("evm_mine", [])

      // Set delays to 0
      await blackHoles.setTimedSaleDuration(0)
      await blackHoles.setMergingDelay(0)

      // Hardhat evm_increaseTime
      provider.send("evm_increaseTime", [100])
      provider.send("evm_mine", [])
    },
  },
  {
    name: "Skip to v2 merge",
    description: "Skips to merge with 6700 total minted. Some on both contracts",
    command: "skipToMergeV2",
    inputs: [
      {
        name: "amount in second signer",
        value: "300",
      },
    ],
    execute: async (provider: ethers.providers.JsonRpcProvider, inputs: IInput[]) => {
      const signer = new ethers.Wallet(signer1key, provider)

      const signer2 = new ethers.Wallet(signer2key, provider)

      const [amountInSecondSigner] = inputs

      const blackholesDeployment = require(`../../deployments/localhost/BlackHoles.json`)
      let blackHoles = BlackHoles__factory.connect(blackholesDeployment.address, signer)

      const totalMinted = await blackHoles.totalMinted()
      let price = await blackHoles.getPrice()
      const threshold = await blackHoles.timedSaleThreshold()
      if (totalMinted.toNumber() === 0) {
        // Mint threshold
        await blackHoles.mint(threshold, { value: price.mul(threshold) })
      } else {
        // Set merging threshold to current total minted + 1 and mint one
        await blackHoles.setTimedSaleThreshold(totalMinted.add(1))
        await blackHoles.mint(1, { value: price })
      }

      // Mine block
      provider.send("evm_mine", [])

      price = await blackHoles.getPrice()

      const targetAmountInSecondSigner = amountInSecondSigner.value!
      await blackHoles
        .connect(signer2)
        .mint(targetAmountInSecondSigner, { value: price.mul(targetAmountInSecondSigner) })

      // Mine block
      provider.send("evm_mine", [])

      const remainingAmount = BigNumber.from(6570).sub(threshold).sub(targetAmountInSecondSigner)
      await blackHoles.mint(remainingAmount, { value: remainingAmount.mul(price) })

      // Mine block
      provider.send("evm_mine", [])

      // Set delays to 0
      await blackHoles.setTimedSaleDuration(0)
      await blackHoles.setMergingDelay(0)

      blackHoles = blackHoles.connect(signer2)

      provider.send("evm_mine", [])

      const voidableBlackHoles = VoidableBlackHoles__factory.connect(voidableBlackHolesDeployment.address, signer2)

      await blackHoles.setApprovalForAll(voidableBlackHoles.address, true)

      const tokenIds = await getTokensByOwnerLocal({
        provider,
        address: signer2.address,
        tokenAddress: blackholesDeployment.address,
      })
      const migrateTokens = tokenIds.slice(0, Math.floor(tokenIds.length / 2))
      await voidableBlackHoles.mint(migrateTokens)

      // Hardhat evm_increaseTime
      provider.send("evm_mine", [])

      // Merge the first 20
      await voidableBlackHoles.merge(migrateTokens.slice(0, 20))

      provider.send("evm_mine", [])

      // Get balance on voidableBlackHoles
      const voidableBlackHolesBalance = await voidableBlackHoles.balanceOf(signer2.address)
      console.log("voidableBlackHolesBalance", voidableBlackHolesBalance.toString())

      // Get balance on blackHoles
      const blackHolesBalance = await blackHoles.balanceOf(signer2.address)
      console.log("blackHolesBalance", blackHolesBalance.toString())
    },
  },
]

export function getSeconds(amount: number, unit: string): number {
  switch (unit) {
    case "seconds":
      return amount
    case "minutes":
      return amount * 60
    case "hours":
      return amount * 3600
    case "days":
      return amount * 86400
    default:
      return 0
  }
}
