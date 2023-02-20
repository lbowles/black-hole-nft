import micro from "../../img/blackHoles/micro.svg"
import stellar from "../../img/blackHoles/stellar.svg"
import intermediate from "../../img/blackHoles/intermediate.svg"
import supermassive from "../../img/blackHoles/supermassive.svg"
import primordial from "../../img/blackHoles/primordial.svg"
import microAnimated from "../../img/blackHoles/microAnimated.svg"
import stellarAnimated from "../../img/blackHoles/stellarAnimated.svg"
import intermediateAnimated from "../../img/blackHoles/intermediateAnimated.svg"
import supermassiveAnimated from "../../img/blackHoles/supermassiveAnimated.svg"
import primordialAnimated from "../../img/blackHoles/primordialAnimated.svg"
import dropdown from "../../img/dropdown.svg"
import blockSpinner from "../../img/blockSpinner.svg"
import { useEffect, useState } from "react"

//TODO: add disclamer about burning

//take in as param
const baseOwnedNFTs = [
  { type: "MICRO", tokenId: 1232, SM: 1, selected: false },
  { type: "STELLAR", tokenId: 1322, SM: 3, selected: false },
  { type: "STELLAR", tokenId: 1432, SM: 3, selected: false },
  { type: "INTERMEDIATE", tokenId: 1632, SM: 3, selected: false },
  { type: "INTERMEDIATE", tokenId: 1732, SM: 3, selected: false },
  { type: "SUPERMASSIVE", tokenId: 1832, SM: 3, selected: false },
  { type: "SUPERMASSIVE", tokenId: 8332, SM: 3, selected: false },
  { type: "SUPERMASSIVE", tokenId: 1342, SM: 3, selected: false },
  { type: "PRIMORDIAL", tokenId: 1532, SM: 3, selected: false },
  { type: "PRIMORDIAL", tokenId: 1432, SM: 3, selected: false },
  { type: "PRIMORDIAL", tokenId: 3332, SM: 3, selected: false },
  { type: "PRIMORDIAL", tokenId: 4332, SM: 3, selected: false },
  { type: "PRIMORDIAL", tokenId: 5332, SM: 3, selected: false },
]
const nftTypeToImg: Record<string, string> = {
  MICRO: micro,
  STELLAR: stellar,
  INTERMEDIATE: intermediate,
  SUPERMASSIVE: supermassive,
  PRIMORDIAL: primordial,
}
const nftTypeToAnimatedImg: Record<string, string> = {
  MICRO: microAnimated,
  STELLAR: stellarAnimated,
  INTERMEDIATE: intermediateAnimated,
  SUPERMASSIVE: supermassiveAnimated,
  PRIMORDIAL: primordialAnimated,
}
const upgradeSMRequirement = {
  MICRO: 3,
  STELLAR: 6,
  INTERMEDIATE: 9,
  SUPERMASSIVE: 12,
  PRIMORDIAL: 15,
}

type IBurn = {
  ownedNFTs: { type: string; tokenId: number; SM: number; selected: boolean }[]
}

export const Burn = () => {
  const [ownedNFTs, setOwnedNFTs] = useState<IBurn["ownedNFTs"]>(baseOwnedNFTs)
  const [finalPage, setFinalPage] = useState(false)
  const [totalSM, setTotalSM] = useState(0)
  const [upgradeType, setUpgradeType] = useState("")
  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null)
  const [mergeBtnDisabled, setMintBtnDisabled] = useState(false)
  const [mergeBtnLoading, setMintBtnLoading] = useState(false)
  const [selectedTokens, setSelectedTokens] = useState<number[]>([])

  const handleSelect = (index: number) => {
    const updatedNFTs = [...ownedNFTs]
    updatedNFTs[index].selected = !updatedNFTs[index].selected
    setOwnedNFTs(updatedNFTs)
  }

  const handleSelectAll = () => {
    const updatedNFTs = ownedNFTs.map((nft) => ({ ...nft, selected: true }))
    setOwnedNFTs(updatedNFTs)
  }

  const handleResetAll = () => {
    const updatedNFTs = ownedNFTs.map((nft) => ({ ...nft, selected: false }))
    setOwnedNFTs(updatedNFTs)
  }

  const findUpgradeType = (totalSelectedSM: number): string => {
    if (totalSelectedSM >= upgradeSMRequirement.PRIMORDIAL) {
      return "PRIMORDIAL"
    } else if (totalSelectedSM >= upgradeSMRequirement.SUPERMASSIVE) {
      return "SUPERMASSIVE"
    } else if (totalSelectedSM >= upgradeSMRequirement.INTERMEDIATE) {
      return "INTERMEDIATE"
    } else if (totalSelectedSM >= upgradeSMRequirement.STELLAR) {
      return "STELLAR"
    } else {
      return "MICRO"
    }
  }

  const updateSelectedTokens = (selectedToken: number) => {
    const index = selectedTokens.indexOf(selectedToken)
    if (index > -1) {
      const newArray = [selectedToken, ...selectedTokens.slice(0, index), ...selectedTokens.slice(index + 1)]
      setSelectedTokens(newArray)
      console.log(newArray)
    }
  }

  useEffect(() => {
    const selectedNFTs = ownedNFTs.filter((nft) => nft.selected)
    setSelectedTokens(selectedNFTs.map((nft) => nft.tokenId))
    const totalSelectedSM = selectedNFTs.reduce((acc, nft) => acc + nft.SM, 0)
    setTotalSM(totalSelectedSM)
    const type = findUpgradeType(totalSelectedSM)
    setUpgradeType(type)
  }, [ownedNFTs])

  return (
    <>
      <div className="flex justify-center w-screen  p-5 pb-0">
        <div className="w-96">
          <div className="bg-black border-2 border-gray-800 w-full p-5 mt-6">
            <p className="text-white text-2xl">Merge</p>
            <p className="text-gray-600 text-base pt-3">
              Solar Systems is a fully on-chain NFT collection which features procedurally generated planets orbiting
              around a star. Each Solar System is
            </p>
          </div>
        </div>
      </div>
      {!finalPage ? (
        <>
          <div className="flex justify-center w-screen z-1">
            <div className="w-96">
              <div className="flex justify-end w-full mt-6">
                {totalSM > 0 ? (
                  <>
                    <button
                      className="text-base hover:text-white text-gray-500 transition-all pr-2"
                      onClick={handleResetAll}
                    >
                      RESET |
                    </button>
                    <button
                      className="text-base hover:text-white text-gray-500 transition-all "
                      onClick={handleSelectAll}
                    >
                      SELECT ALL
                    </button>
                  </>
                ) : (
                  <button
                    className="text-base hover:text-white text-gray-500 transition-color "
                    onClick={handleSelectAll}
                  >
                    SELECT ALL
                  </button>
                )}
              </div>
              <div className="h-[380px] overflow-auto mt-1">
                <div className="grid grid-cols-4 gap-2 mt-2 max-h-[380px] overflow-auto pb-[72px]">
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
          <div className="flex justify-center w-screen p-5 -mt-[70px] z-2 relative">
            <div className="flex justify-between items-center w-full max-w-[380px] border-2 border-white bg-gray-900 text-lg text-white pl-5 pr-1 py-1">
              <div className="flex">
                {totalSM === 0 ? (
                  <p>SELECT BLACK HOLES TO MERGE ABOVE</p>
                ) : (
                  <>
                    <p>MERGE TOTAL: ‎</p>
                    <p>{totalSM} SM (Intermediate)</p>
                  </>
                )}
              </div>
              <button className="secondaryBtn text-lg py-1" disabled={totalSM === 0} onClick={() => setFinalPage(true)}>
                NEXT
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex justify-center w-screen  p-5 pb-0 mt-3">
          <div className="w-60">
            <p className="w-full text-center text-2xl text-white">You will receive</p>
            <p className="text-gray-600 text-base  w-full text-center">Select token ID to upgrade</p>
            <div className="border-2 border-white  mt-5">
              <img src={nftTypeToAnimatedImg[upgradeType]?.trim() ?? ""} className="p-1"></img>
              <div className="border-t-2 border-white p-5">
                <p className="text-xl text-white pb-1">{upgradeType}</p>
                <div className="flex justify-between items-end">
                  {totalSM > 0 && (
                    <div className="relative mt-3">
                      <select
                        value={selectedTokenId ?? ""}
                        onChange={(e) => {
                          const tokenId = Number(e.target.value)
                          setSelectedTokenId(tokenId)
                          updateSelectedTokens(tokenId)
                        }}
                        className="text-white block appearance-none bg-black border border-gray-500 hover:border-white px-3 py-1 leading-tight focus:outline-none transition-colors w-[116px]"
                      >
                        <option key={null} value="" disabled>
                          Select token
                        </option>
                        {ownedNFTs
                          .filter((nft) => nft.selected)
                          .sort((a, b) => {
                            // sort by SM (largest first) and then by tokenId (smallest first) if SM is the same
                            if (b.SM !== a.SM) {
                              return b.SM - a.SM
                            } else {
                              return a.tokenId - b.tokenId
                            }
                          })
                          .map((nft) => (
                            <option key={nft.tokenId} value={nft.tokenId}>
                              {"#" + nft.tokenId + " (" + nft.SM + " SM)"}
                            </option>
                          ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 ">
                        <img src={dropdown}></img>
                      </div>
                    </div>
                  )}
                  <div className="h-full items-end">
                    <p className="text-xl text-white pb-1">{totalSM} SM</p>
                  </div>
                </div>
              </div>
            </div>
            <button className="primaryBtn min-w-[240px] mt-10" disabled={mergeBtnDisabled || selectedTokenId === null}>
              {selectedTokenId ? (
                <>
                  {mergeBtnLoading ? (
                    <div className="w-full flex justify-center h-full">
                      <img className="h-full p-[12px]" src={blockSpinner}></img>
                    </div>
                  ) : (
                    <>MERGE INTO TOKEN #{selectedTokenId}</>
                  )}
                </>
              ) : (
                <>SELECT TOKEN ID ABOVE {selectedTokenId}</>
              )}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

// how do i make the drop down be ordered first by SM (largest first) then by token id (smallest frist) if the SM is the same
