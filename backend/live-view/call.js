const { defaultAbiCoder, Interface } = require("@ethersproject/abi")

async function call(vm, address, abi, name, args = [], types = ["string"]) {
  const iface = new Interface(abi)
  const data = iface.encodeFunctionData(name, args)

  const renderResult = await vm.runCall({
    to: address,
    caller: address,
    origin: address,
    data: Buffer.from(data.slice(2), "hex"),
  })

  if (renderResult.execResult.exceptionError) {
    throw renderResult.execResult.exceptionError
  }

  const logs = renderResult.execResult.logs?.map(([address, topic, data]) => data.toString().replace(/\x00/g, ""))

  if (logs?.length) {
    console.log(logs)
  }

  const results = defaultAbiCoder.decode(types, renderResult.execResult.returnValue)

  return { results, gasUsed: renderResult.gasUsed }
}

module.exports = call
