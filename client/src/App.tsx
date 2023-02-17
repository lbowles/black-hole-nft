import "./App.css"
import { Navbar } from "./components/Navbar/Navbar"
import "@rainbow-me/rainbowkit/styles.css"
import { WagmiConfig, createClient, configureChains, mainnet } from "wagmi"
import { publicProvider } from "wagmi/providers/public"
import { darkTheme, getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit"
import { Routes, Route } from "react-router-dom"
import { Home } from "./pages/Home/Home"
import * as allChains from "@wagmi/chains"
import deployments from "./deployments.json"

// Loop over all chains and check if they match deployments.chainId
const deployedChain = Object.values(allChains).filter((chain) => {
  return deployments.chainId === chain.id.toString()
})[0]

console.log(deployedChain)

// Check if in development
const isDev = process.env.NODE_ENV === "development"

const { chains, provider, webSocketProvider } = configureChains([deployedChain], [publicProvider()])

const { connectors } = getDefaultWallets({
  appName: "BlackHoles",
  chains,
})

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
  webSocketProvider,
})

function App() {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider
        showRecentTransactions={true}
        chains={chains}
        theme={{
          ...darkTheme({ accentColor: "#393A3E" }),
          fonts: {
            body: "VT323, monospace",
          },
        }}
      >
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mint" element={<div className="text-white">mint</div>} />
          <Route path="/burn" element={<div>burn</div>} />
        </Routes>
      </RainbowKitProvider>
    </WagmiConfig>
  )
}
export default App
