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
    const { result: compileResult, targetContract } = compile(SOURCE)
    const { abi, bytecode } = targetContract
    const address = await deploy(vm, pk, bytecode, compileResult)
    const [result] = await call(vm, address, abi, "renderSample")

    return result
  }

  const { notify } = await serve(handler)

  fs.watch(path.dirname(SOURCE), notify)
  console.log("Watching", path.dirname(SOURCE))
  console.log("Serving  http://localhost:9901/")
}

main()
