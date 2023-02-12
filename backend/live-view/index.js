const fs = require("fs")
const path = require("path")
const serve = require("./serve")
const boot = require("./boot")
const call = require("./call")
const compile = require("./compile")
const { deploy } = require("./deploy")

const SOURCE = path.join(__dirname, "..", "contracts", "Renderer.sol")

async function main() {
  const { vm, pk } = await boot()

  async function handler() {
    // Try to read .gas-used file
    let lastGasUsed = 0
    try {
      lastGasUsed = parseInt(fs.readFileSync(path.join(__dirname, ".gas-used")).toString())
    } catch (error) {
      // Ignore
    }

    const { result: compileResult, targetContract } = compile(SOURCE)
    const { abi, bytecode } = targetContract
    const { address, gasUsed } = await deploy(vm, pk, bytecode, compileResult)
    const [result] = await call(vm, address, abi, "renderSample")

    // Write gas used to a file
    fs.writeFileSync(path.join(__dirname, ".gas-used"), gasUsed.toString())

    // Calculate percentage change in gas used
    const gasUsedChange = ((gasUsed.toNumber() - lastGasUsed) / lastGasUsed) * 100
    console.log(
      `${gasUsed.toNumber().toLocaleString()} gas used (${gasUsedChange >= 0 ? "+" : ""}${(
        Math.round(gasUsedChange * 100) / 100
      ).toFixed(2)}%)`,
    )

    return result
  }

  const { notify } = await serve(handler)

  fs.watch(path.dirname(SOURCE), notify)
  console.log("Watching", path.dirname(SOURCE))
  console.log("Serving  http://localhost:9901/")
}

main()
