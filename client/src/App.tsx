import "./App.css"
import { Navbar } from "./components/Navbar/Navbar"
import { ethers } from "ethers"
import "@rainbow-me/rainbowkit/styles.css"
import { WagmiConfig, createClient, configureChains, mainnet } from "wagmi"
import { publicProvider } from "wagmi/providers/public"
import { darkTheme, getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit"
import { Routes, Route } from "react-router-dom"
import { Home } from "./pages/Home/Home"
import * as allChains from "@wagmi/chains"
import deployments from "./deployments.json"
import { Footer } from "./components/Footer/Footer"
import { Mint } from "./pages/Mint/Mint"
import { Burn } from "./pages/Burn /Burn"

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

//temp data
const preOpenMintPrice = ethers.utils.parseEther("0.003")
const openMintPrice = ethers.utils.parseEther("0.005")
const mintEnded = false
const openMintStarted = true
const now = new Date()
const openMintDate = new Date(now.getTime() + 24 * 60 * 60 * 1000)
const amountMinted = 123

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
        <div className="min-h-[70vh]">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/mint" element={<Mint />} />
            <Route path="/burn" element={<Burn />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </div>
        <Footer />
      </RainbowKitProvider>
    </WagmiConfig>
  )
}
export default App
