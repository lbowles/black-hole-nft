// Get the block timestamp
import { ethers } from "hardhat"

async function main() {
  // get latest block timestamp
  const latestBlock = await ethers.provider.getBlock("latest")
  console.log("Latest block timestamp: ", latestBlock.timestamp)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
