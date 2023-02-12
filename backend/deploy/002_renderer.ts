import { DeployFunction } from "hardhat-deploy/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()

  const utilities = await deployments.get("utils")
  const trigonometry = await deployments.get("Trigonometry")

  await deploy("Renderer", {
    from: deployer,
    libraries: {
      utils: utilities.address,
      Trigonometry: trigonometry.address,
    },
    log: true,
  })
}
export default func
func.tags = ["Renderer"]
func.dependencies = ["Libraries"]
