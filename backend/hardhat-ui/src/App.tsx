import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { ICommand, COMMANDS } from "./commands"

interface ISnapshot {
  id: string
  name: string
  date: Date
}

export function getSeconds(amount: number, unit: string): number {
  switch (unit) {
    case "seconds":
      return amount
    case "minutes":
      return amount * 60
    case "hours":
      return amount * 3600
    case "days":
      return amount * 86400
    default:
      return 0
  }
}

function commandToString(command: ICommand) {
  const args = command.inputs.map((input) => `${input.name}: ${input.value}`).join(", ")
  return `"${command.name}" (${args})`
}

function timeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  let interval = Math.floor(seconds / 31536000)
  interval = Math.floor(seconds / 60)
  if (interval > 1) {
    return interval + " minutes"
  }
  return Math.floor(seconds) + " seconds"
}

function App() {
  const [provider, setProvider] = useState<ethers.providers.JsonRpcProvider | undefined>()
  const [providerUrl, setProviderUrl] = useState("http://localhost:8545")
  const [networkInfo, setNetworkInfo] = useState<ethers.providers.Network | undefined>()
  const [commandOutput, setCommandOutput] = useState("")
  const [commands, setCommands] = useState<ICommand[]>(COMMANDS)
  const [snapshots, setSnapshots] = useState<ISnapshot[]>([])
  const [lastCommand, setLastCommand] = useState<ICommand | undefined>()

  const handleProviderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProviderUrl(event.target.value)
  }

  const handleProviderSubmit = async (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault()
    const newProvider = new ethers.providers.JsonRpcProvider(providerUrl)
    setProvider(newProvider)
    setNetworkInfo(await newProvider.getNetwork())
  }

  const handleInputChange = (commandIndex: number, inputIndex: number, value: string) => {
    setCommands((prevCommands) => {
      const newCommands = [...prevCommands]
      newCommands[commandIndex].inputs[inputIndex].value = value
      return newCommands
    })
  }

  const showOutput = (output: string) => {
    setCommandOutput(output)
  }

  const handleCommandExecute = async (command: ICommand) => {
    try {
      await command.execute(provider!, command.inputs)
      showOutput(`Command ${commandToString(command)} executed successfully`)
      setLastCommand(command)
    } catch (error) {
      console.error(error)
      showOutput(`Error executing command ${command.name}: ${error}`)
    }
  }

  const handleSnapshot = async () => {
    const block = await provider!.getBlock("latest")

    const snapshotId = await provider?.send("evm_snapshot", [])
    setSnapshots((prevSnapshots) => [
      ...prevSnapshots,
      {
        name: lastCommand ? commandToString(lastCommand) : "No prev command",
        id: snapshotId,
        date: new Date(),
      },
    ])
    console.log("Snapshot ID:", snapshotId)
  }

  const handleSnapshotRevert = async (index: number) => {
    const { id: snapshotId } = snapshots[index]
    await provider?.send("evm_revert", [snapshotId])
    showOutput(`Reverted to snapshot ${snapshotId}`)
  }

  useEffect(() => {
    handleProviderSubmit()
  }, [])

  return (
    <div className="App">
      <form onSubmit={handleProviderSubmit}>
        <label>
          Provider URL:
          <input type="text" value={providerUrl} onChange={handleProviderChange} />
        </label>
        <button type="submit">Connect</button>
      </form>
      {networkInfo && (
        <p>
          Connected to provider: {provider?.connection.url} on network {networkInfo.name} (chainId {networkInfo.chainId}
          )
        </p>
      )}
      {provider && (
        <div>
          <h2>Commands:</h2>
          <ul>
            {commands.map((command, commandIndex) => (
              <li key={command.name}>
                <strong>{command.name}</strong>: {command.description}
                <form
                  onSubmit={(event) => {
                    event.preventDefault()
                    handleCommandExecute(command)
                  }}
                >
                  {command.inputs.map((input, inputIndex) => (
                    <label key={inputIndex}>
                      {input.name}
                      <input
                        type="text"
                        value={input.value || ""}
                        onChange={(event) => handleInputChange(commandIndex, inputIndex, event.target.value)}
                      />
                    </label>
                  ))}
                  <button type="submit">Execute</button>
                </form>
              </li>
            ))}
          </ul>
          {commandOutput && <p>{commandOutput}</p>}
          <div>
            <h2>Snapshots:</h2>
            <button onClick={handleSnapshot}>Take snapshot</button>
          </div>
          {snapshots.length > 0 && (
            <ul>
              {snapshots.map((snapshot, index) => (
                <li key={index}>
                  <button onClick={() => handleSnapshotRevert(index)}>
                    Revert to snapshot "{snapshot.name}" ({snapshot.id}) - {timeAgo(snapshot.date)} ago
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default App
