const { Address } = require("ethereumjs-util")
const { Transaction } = require("@ethereumjs/tx")
const linker = require("solc/linker")

async function deploy(vm, pk, bytecode, compileResult) {
  // Dependencies
  const libraries = {}
  let totalGas = 0
  await Promise.all(
    Object.entries(bytecode.linkReferences).map(async ([name]) => {
      const contractData = compileResult.contracts[name]
      const [contractName, contract] = Object.entries(contractData)[0]
      console.log(name)
      const bytecode = contract.evm.bytecode
      const { address, gasUsed } = await deploy(vm, pk, bytecode, compileResult)
      totalGas += gasUsed
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

  const tx = Transaction.fromTxData(txData).sign(pk)

  const deploymentResult = await vm.runTx({ tx })

  if (deploymentResult.execResult.exceptionError) {
    throw deploymentResult.execResult.exceptionError
  }

  totalGas += deploymentResult.gasUsed.toNumber()

  return { address: deploymentResult.createdAddress, gasUsed: totalGas }
}

module.exports = { deploy }
