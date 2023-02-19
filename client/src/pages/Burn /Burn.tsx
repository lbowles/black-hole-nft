import micro from "../../img/blackHoles/micro.svg"
import stellar from "../../img/blackHoles/stellar.svg"
import intermediate from "../../img/blackHoles/intermediate.svg"
import supermassive from "../../img/blackHoles/supermassive.svg"
import primordial from "../../img/blackHoles/primordial.svg"
import { useEffect, useState } from "react"

//take in as param
const baseOwnedNFTs = [
  { type: "MICRO", tokenId: 1232, SM: 1, selected: false },
  { type: "STELLAR", tokenId: 1332, SM: 3, selected: false },
  { type: "STELLAR", tokenId: 1332, SM: 3, selected: false },
  { type: "INTERMEDIATE", tokenId: 1332, SM: 3, selected: false },
  { type: "INTERMEDIATE", tokenId: 1332, SM: 3, selected: false },
  { type: "SUPERMASSIVE", tokenId: 1332, SM: 3, selected: false },
  { type: "SUPERMASSIVE", tokenId: 1332, SM: 3, selected: false },
  { type: "SUPERMASSIVE", tokenId: 1332, SM: 3, selected: false },
  { type: "PRIMORDIAL", tokenId: 1332, SM: 3, selected: false },
  { type: "PRIMORDIAL", tokenId: 1332, SM: 3, selected: false },
  { type: "PRIMORDIAL", tokenId: 1332, SM: 3, selected: false },
  { type: "PRIMORDIAL", tokenId: 1332, SM: 3, selected: false },
  { type: "PRIMORDIAL", tokenId: 1332, SM: 3, selected: false },
]
const nftTypeToImg: Record<string, string> = {
  MICRO: micro,
  STELLAR: stellar,
  INTERMEDIATE: intermediate,
  SUPERMASSIVE: supermassive,
  PRIMORDIAL: primordial,
}

type IBurn = {
  ownedNFTs: { type: string; tokenId: number; SM: number; selected: boolean }[]
}

export const Burn = () => {
  const [ownedNFTs, setOwnedNFTs] = useState<IBurn["ownedNFTs"]>(baseOwnedNFTs)
  const [totalSM, setTotalSM] = useState(0)

  const handleSelect = (index: number) => {
    const updatedNFTs = [...ownedNFTs]
    updatedNFTs[index].selected = !updatedNFTs[index].selected
    setOwnedNFTs(updatedNFTs)
  }

  useEffect(() => {
    const selectedNFTs = ownedNFTs.filter((nft) => nft.selected)
    const totalSelectedSM = selectedNFTs.reduce((acc, nft) => acc + nft.SM, 0)
    setTotalSM(totalSelectedSM)
  }, [ownedNFTs])

  return (
    <>
      <div className="flex justify-center w-screen  p-5">
        <div className="w-96">
          <div className="bg-black border-2 border-gray-800 w-full p-5 mt-6">
            <p className="text-white text-2xl">Merge</p>
            <p className="text-gray-600 text-base pt-3">
              Solar Systems is a fully on-chain NFT collection which features procedurally generated planets orbiting
              around a star. Each Solar System is
            </p>
          </div>
          <div className="flex justify-end w-full mt-6">
            <button className="text-base hover:text-white text-gray-500 transition-all ">SELECT ALL</button>
          </div>
          <div className="h-[380px] overflow-auto">
            <div className="grid grid-cols-4 gap-2 mt-2 max-h-[380px] overflow-auto pb-[60px]">
              {ownedNFTs.map((nft, i) => {
                const img = nftTypeToImg[nft.type]?.trim() ?? ""
                const selectedStyle = nft.selected
                  ? "border-white  text-white"
                  : "border-gray-800 hover:border-gray-600 text-gray-700 "
                return (
                  <button className={selectedStyle + " border-2 transition-colors"} onClick={() => handleSelect(i)}>
                    <img src={img}></img>
                    <div className="border-t-2 border-gray-800 p-1 text-sm">
                      <p className="w-full text-left">{nft.type}</p>
                      <div className="flex justify-between w-full">
                        <p>#{nft.tokenId}</p>
                        <p>{nft.SM} SM</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center w-screen p-5 -mt-[90px]">
        <div className="flex justify-between items-center w-full max-w-[380px] border-2 border-white bg-gray-900 text-lg text-white pl-5 pr-1 py-1">
          <div className="flex">
            <p>MERGE TOTAL: ‎</p>
            <p>{totalSM} SM (Intermediate)</p>
          </div>
          <button className="secondaryBtn text-lg py-1">NEXT</button>
        </div>
      </div>
    </>
  )
}
