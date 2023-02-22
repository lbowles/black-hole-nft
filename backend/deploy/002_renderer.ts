import { ethers } from "hardhat"
import { DeployFunction } from "hardhat-deploy/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()

  const utilities = await deployments.get("utils")

  await deploy("Renderer", {
    from: deployer,
    libraries: {
      utils: utilities.address,
    },
    log: true,
    autoMine: true,
    gasPrice: ethers.utils.parseUnits("37", "gwei"),
  })
}
export default func
func.tags = ["Renderer"]
func.dependencies = ["Libraries"]
