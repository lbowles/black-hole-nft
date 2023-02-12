const { Address } = require("ethereumjs-util")
const { Transaction } = require("@ethereumjs/tx")
const linker = require("solc/linker")

async function deploy(vm, pk, bytecode, compileResult) {
  // Dependencies
  const libraries = {}
  await Promise.all(
    Object.entries(bytecode.linkReferences).map(async ([name]) => {
      const contractData = compileResult.contracts[name]
      const [contractName, contract] = Object.entries(contractData)[0]
      console.log(name)
      const bytecode = contract.evm.bytecode
      const address = await deploy(vm, pk, bytecode, compileResult)
      libraries[`${name}:${contractName}`] = address.toString()
    }),
  )
  const linkedBytecode = linker.linkBytecode(bytecode.object, libraries)

  const address = Address.fromPrivateKey(pk)
  const account = await vm.stateManager.getAccount(address)

  const txData = {
    value: 0,
    gasLimit: 200_000_000_000,
    gasPrice: 1,
    data: "0x" + linkedBytecode,
    nonce: account.nonce,
  }

  console.log("deploying")

  const tx = Transaction.fromTxData(txData).sign(pk)

  const deploymentResult = await vm.runTx({ tx })

  console.log(deploymentResult.gasUsed.toString())

  if (deploymentResult.execResult.exceptionError) {
    throw deploymentResult.execResult.exceptionError
  }

  return deploymentResult.createdAddress
}

module.exports = { deploy }
