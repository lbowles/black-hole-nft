import { ethers } from "ethers"
import { BlackHoles__factory } from "../../types/factories/BlackHoles__factory"

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
      const signer = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider)

      console.log(provider.network.name)

      const blackholesDeployment = require(`../../deployments/localhost/BlackHoles.json`)
      const blackHoles = BlackHoles__factory.connect(blackholesDeployment.address, signer)

      const price = await blackHoles.getPrice()

      const tx = await blackHoles.mint(amount, { value: price.mul(amount) })
      console.log("Minted black holes:", tx.hash)
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
