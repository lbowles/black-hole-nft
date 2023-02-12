import { ethers } from "hardhat"
import { BigNumber } from "ethers"

export async function waitForBlocks(n: BigNumber) {
  await ethers.provider.send("hardhat_mine", [n.toHexString().replace("0x0", "0x")])
}
