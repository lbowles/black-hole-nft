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

    console.log("Compiling", path.basename(SOURCE))

    const { result: compileResult, targetContract } = compile(SOURCE)
    const { abi, bytecode } = targetContract
    const { address, gasUsed } = await deploy(vm, pk, bytecode, compileResult)

    // Calculate percentage change in gas used
    const gasUsedChange = ((gasUsed - lastGasUsed) / lastGasUsed) * 100
    console.log(
      `${gasUsed.toLocaleString()} gas used for deployment (${gasUsedChange >= 0 ? "+" : ""}${(
        Math.round(gasUsedChange * 100) / 100
      ).toFixed(2)}%)`,
    )

    let result = ""
    for (let level = 0; level < 5; level++) {
      const { results, gasUsed: callGas } = await call(vm, address, abi, "renderSample", [
        Math.floor(Math.random() * 1000),
        level,
      ])
      result += `<iframe style="width: 500px; height: 500px;" srcdoc='${results[0]}'></iframe>`
      console.log(`${callGas.toNumber().toLocaleString()} gas used for call (${level})`)
    }

    // Write gas used to a file
    fs.writeFileSync(path.join(__dirname, ".gas-used"), gasUsed.toString())

    return result
  }

  const { notify } = await serve(handler)

  fs.watch(path.dirname(SOURCE), notify)
  console.log("Watching", path.dirname(SOURCE))
  console.log("Serving  http://localhost:9901/")
}

main()
