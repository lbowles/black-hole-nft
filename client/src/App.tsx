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
import useSound from "use-sound"
import { useEffect, useState } from "react"
import soundUrl from "./sounds/loop.mp3"
import { EnterScreen } from "./components/EnterScreen/EnterScreen"
import { useNavigate } from "react-router-dom"
import unmute from "./img/unmute.svg"
import mute from "./img/mute.svg"

// Loop over all chains and check if they match deployments.chainId
const deployedChain = Object.values(allChains).filter((chain) => {
  return deployments.chainId === chain.id.toString()
})[0]

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
  const [isMuted, setIsMuted] = useState(false)
  const [globalVolume, setGlobalVolume] = useState(0.5)
  const [play, { stop }] = useSound(soundUrl, { loop: true, volume: globalVolume, preloaded: true })
  const [enterHome, setEnterHome] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    if (enterHome) {
      play()
    } else {
      stop()
    }
  }, [enterHome, play, stop])

  const enterScreenComponent = (
    <EnterScreen
      onEnter={() => {
        setEnterHome(true)
      }}
    />
  )

  const pageNotFound = (
    <p className="pt-20 text-white text-xl f-full text-center">
      Not found,{" "}
      <a
        onClick={() => {
          navigate("/")
        }}
        className="text-xl text-gray-500 hover:text-white transition-colors cursor-pointer"
      >
        Return
      </a>
    </p>
  )

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
        {enterHome && <Navbar />}
        <div className="min-h-[70vh]">
          <button
            className="fixed bottom-4 right-4 bg-none text-white rounded-md p-2"
            onClick={() => {
              setIsMuted(!isMuted)
              if (isMuted) {
                setGlobalVolume(0.5)
              } else {
                setGlobalVolume(0)
              }
            }}
          >
            <img src={!isMuted ? unmute : mute} className="h-7"></img>
          </button>
          <Routes>
            <Route path="/" element={enterHome ? <Home /> : enterScreenComponent} />
            <Route path="/mint" element={enterHome ? <Mint /> : enterScreenComponent} />
            <Route path="/merge" element={enterHome ? <Burn /> : enterScreenComponent} />
            <Route path="*" element={pageNotFound} />
          </Routes>
        </div>
        <Footer />
      </RainbowKitProvider>
    </WagmiConfig>
  )
}
export default App
