import { defineConfig } from "@wagmi/cli"
import { react } from "@wagmi/cli/plugins"
import deployments from "./src/deployments.json"

const contracts = Object.keys(deployments.contracts).map((name) => ({
  name,
  address: { [deployments.chainId]: deployments.contracts[name].address },
  abi: deployments.contracts[name].abi,
}))

export default defineConfig({ out: "src/generated.ts", contracts, plugins: [react()] })
