import opensea from "../../img/icons/opensea.svg"
import twitter from "../../img/icons/twitter.svg"
import gihub from "../../img/icons/github.svg"
import etherscan from "../../img/icons/etherscan.svg"
import useSound from "use-sound"
import linkClickEffect from "../../sounds/linkClick.mp3"
import deployments from "../../deployments.json"
import { useState } from "react"

export const LinksTab = () => {
  const [linkClickSound] = useSound(linkClickEffect)
  return (
    <div className="bg-black border-y-2 border-r-2 border-gray-800 p-[15px] w-14 grid grid-flow-row absolute top-1/2 left-0 transform -translate-y-1/2 gap-3">
      <a
        target="_blank"
        href="https://opensea.io/collection/onchain-blackholes-v1"
        onClick={() => {
          linkClickSound()
        }}
      >
        <img src={opensea}></img>
      </a>
      <a
        target="_blank"
        href="https://twitter.com/0xBlackHoles"
        onClick={() => {
          linkClickSound()
        }}
      >
        <img src={twitter}></img>
      </a>
      <a
        target="_blank"
        href="https://github.com/lbowles/black-hole-nft"
        onClick={() => {
          linkClickSound()
        }}
      >
        <img src={gihub}></img>
      </a>
      <a
        target="_blank"
        href={`https://etherscan.io/address/${deployments.contracts.BlackHolesV2.address}`}
        onClick={() => {
          linkClickSound()
        }}
      >
        <img src={etherscan}></img>
      </a>
    </div>
  )
}
