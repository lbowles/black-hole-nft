import { useAddRecentTransaction } from "@rainbow-me/rainbowkit"
import { BigNumber } from "ethers"
import { useEffect, useState } from "react"
import useSound from "use-sound"
import { useAccount, useProvider, useWaitForTransaction } from "wagmi"
import { ActionButton } from "../../components/ActionButton/ActionButton"
import { Countdown } from "../../components/Countdown/Countdown"
import deployments from "../../deployments.json"
import {
  useBlackHolesAllBlackHoleLevelNames,
  useBlackHolesGetBaseUpgradeMass,
  useBlackHolesIsMergingEnabled,
  useBlackHolesMerge,
  useBlackHolesMergingDelay,
  useBlackHolesTimedSaleEndTimestamp,
  useBlackHolesUpgradeIntervals,
  usePrepareBlackHolesMerge,
} from "../../generated"
import intermediate from "../../img/blackHoles/intermediate.svg"
import intermediateAnimated from "../../img/blackHoles/intermediateAnimated.svg"
import micro from "../../img/blackHoles/micro.svg"
import microAnimated from "../../img/blackHoles/microAnimated.svg"
import primordial from "../../img/blackHoles/primordial.svg"
import primordialAnimated from "../../img/blackHoles/primordialAnimated.svg"
import stellar from "../../img/blackHoles/stellar.svg"
import stellarAnimated from "../../img/blackHoles/stellarAnimated.svg"
import supermassive from "../../img/blackHoles/supermassive.svg"
import supermassiveAnimated from "../../img/blackHoles/supermassiveAnimated.svg"
import blockSpinner from "../../img/blockSpinner.svg"
import dropdown from "../../img/dropdown.svg"
import generalClickEffect from "../../sounds/generalClick.mp3"
import linkClickEffect from "../../sounds/linkClick.mp3"
import mergeEffect from "../../sounds/merge.mp3"
import { getOpenSeaLink } from "../../utils/getOpenSeaLink"
import { BlackHoleMetadata, getTokensByOwner } from "../../utils/getTokensByOwner"

// sort by SM (largest first) and then by tokenId (smallest first) if SM is the same
function compareBlackHoles(a: BlackHoleMetadata, b: BlackHoleMetadata) {
  if (b.mass.toString() !== a.mass.toString()) {
    return parseInt(b.mass.toString()) - parseInt(a.mass.toString())
  } else {
    return parseInt(a.tokenId.toString()) - parseInt(b.tokenId.toString())
  }
}

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

export const Burn = () => {
  const [ownedNFTs, setOwnedNFTs] = useState<(BlackHoleMetadata & { selected: boolean })[]>([])
  const [finalPage, setFinalPage] = useState(false)
  const [totalSM, setTotalSM] = useState(0)
  const [upgradeType, setUpgradeType] = useState("")
  const [nextUpgradeDetails, setNextUpgradeDetails] = useState<[number, string] | null>()
  const [targetTokenIndexInOwnedArray, setTargetTokenIndexInOwnedArray] = useState<number>()
  const [selectedTokenIndexes, setSelectedTokenIndexes] = useState<number[]>([])
  const [mergeSuccess, setMergeSuccess] = useState(false)
  const [mergeStartTimestamp, setMergeStartTimestamp] = useState<BigNumber>()

  const [generalClickSound] = useSound(generalClickEffect)
  const [linkClickSound] = useSound(linkClickEffect)
  const [mergeSound] = useSound(mergeEffect)

  const [mergeTokenIds, setMergeTokenIds] = useState<BigNumber[]>([])
  const [loadingTokens, setLoadingTokens] = useState<boolean>(true)

  const { address } = useAccount()
  const provider = useProvider()
  const addRecentTransaction = useAddRecentTransaction()

  const { data: baseUpgradeMass, isLoading: baseUpgradeMassLoading } = useBlackHolesGetBaseUpgradeMass()
  const { data: upgradeIntervals } = useBlackHolesUpgradeIntervals()
  const { data: levelNames } = useBlackHolesAllBlackHoleLevelNames()
  const { data: isMergingEnabled } = useBlackHolesIsMergingEnabled()
  const { data: timedSaleEndTimestamp } = useBlackHolesTimedSaleEndTimestamp()
  const { data: mergingDelay } = useBlackHolesMergingDelay()

  const { config: mergeConfig } = usePrepareBlackHolesMerge({
    args: [mergeTokenIds],
    enabled: mergeTokenIds.length >= 2 && isMergingEnabled,
  })
  const {
    write: merge,
    data: mergeSignResult,
    isLoading: isMergeSignLoading,
    isSuccess: isMergeSignSuccess,
  } = useBlackHolesMerge(mergeConfig)

  const { data: mergeTx, isLoading: isMergeTxLoading } = useWaitForTransaction({
    hash: mergeSignResult?.hash,
    confirmations: 1,
  })

  const handleSelect = (index: number) => {
    linkClickSound()
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
    if (!upgradeIntervals) return "UNKNOWN"

    let level = 0
    for (let i = 0; i < upgradeIntervals.length - 1; i++) {
      if (totalSelectedSM >= upgradeIntervals[i].toNumber()) {
        level = i + 1
      }
    }
    return levelNames![level].toUpperCase()
  }

  const findNextUpgrade = (totalSelectedSM: number): [number, string] | null => {
    if (!upgradeIntervals || !levelNames || !baseUpgradeMass) return [0, "UNKNOWN"]

    let level = 0
    for (let i = 0; i < upgradeIntervals.length - 1; i++) {
      if (totalSelectedSM < upgradeIntervals[i].toNumber()) {
        level = i + 1
        break
      }
    }

    // If level is 0 there is no next upgrade
    if (level === 0) {
      return null
    }

    return [upgradeIntervals[level - 1].toNumber() - totalSelectedSM, levelNames[level].toUpperCase()]
  }

  // SelectedTokenIndexes contains a list of pointers to the main ownedNFTs array
  // This is so that we don't unnecessarily duplicate data
  const updateMergeTokenIds = (targetTokenIndexInOwnedTokens: number) => {
    const index = selectedTokenIndexes.indexOf(targetTokenIndexInOwnedTokens)
    if (index > -1) {
      const newArray = [
        targetTokenIndexInOwnedTokens,
        ...selectedTokenIndexes.slice(0, index),
        ...selectedTokenIndexes.slice(index + 1),
      ]
      const tokenIds = newArray.map((index) => BigNumber.from(ownedNFTs[index].tokenId))
      console.log(
        "this will be merged",
        tokenIds.map((id) => id.toString()),
      )
      setMergeTokenIds(tokenIds)
    }
  }

  const upgradeToNextLevel = (sMRequired: number) => {
    let requiredSM = sMRequired
    let tempTotalSM = totalSM
    const updatedNFTs = [...ownedNFTs]
    ownedNFTs.forEach((nft, index) => {
      if (tempTotalSM >= requiredSM) {
        return
      }
      if (nft.selected === false) {
        updatedNFTs[index].selected = true
        setOwnedNFTs(updatedNFTs)
        tempTotalSM = tempTotalSM + parseInt(nft.mass.toString())
        setTotalSM(tempTotalSM)
      }
    })
  }

  useEffect(() => {
    if (!timedSaleEndTimestamp || !mergingDelay) return

    if (timedSaleEndTimestamp.toNumber() === 0) {
      setMergeStartTimestamp(undefined)
      return
    }

    setMergeStartTimestamp(timedSaleEndTimestamp.add(mergingDelay))
  }, [timedSaleEndTimestamp, mergingDelay])

  // Get owned NFTs
  useEffect(() => {
    if (!address || !provider || finalPage) return
    const getOwnedNFTs = async () => {
      setLoadingTokens(true)
      const ownedNFTs = await getTokensByOwner({
        address: address,
        provider,
        tokenAddress: deployments.contracts.BlackHoles.address,
      })
      setOwnedNFTs(ownedNFTs.map((token) => ({ ...token, selected: false })).sort(compareBlackHoles))
      // console.log(ownedNFTs.map((token) => ({ ...token, selected: false })).sort(compareBlackHoles))
      setLoadingTokens(false)
    }
    getOwnedNFTs()
  }, [address, provider, finalPage])

  useEffect(() => {
    if (!baseUpgradeMass || ownedNFTs.length == 0) return
    const selectedIndexes = ownedNFTs
      .map((nft, index) => (nft.selected ? index : null))
      .filter((i) => i !== null) as number[]
    setSelectedTokenIndexes(selectedIndexes)
    const totalSelectedSM = selectedIndexes.reduce((acc, index) => acc + parseInt(ownedNFTs[index].mass.toString()), 0)
    setTotalSM(totalSelectedSM)
    const type = findUpgradeType(totalSelectedSM)
    setUpgradeType(type)
    const nextUpgrade = findNextUpgrade(totalSelectedSM)
    setNextUpgradeDetails(nextUpgrade)
  }, [ownedNFTs, baseUpgradeMass])

  useEffect(() => {
    if (mergeSignResult) {
      addRecentTransaction({
        hash: mergeSignResult.hash,
        description: `Merge ${selectedTokenIndexes.length} Black Holes`,
      })
    }
  }, [mergeSignResult])

  useEffect(() => {
    if (mergeTx?.confirmations === 1 && finalPage) {
      setSelectedTokenIndexes([])
      setMergeSuccess(true)
      mergeSound()
    }
  }, [mergeTx])

  return (
    <>
      <div className="flex justify-center w-screen  p-5 pb-0">
        <div className="w-96">
          <div className="bg-black border-2 border-gray-800 w-full p-5 mt-6">
            <p className="text-white text-2xl">Merge</p>
            <p className="text-gray-600 text-base pt-3">
              The merging process allows you to upgrade the mass of one of your Black Holes by burning others. The
              remaining token’s metadata is UPDATED. REMEMBER TO DELIST the remaining Black Hole from secondary markets
              before upgrading.
            </p>
          </div>
        </div>
      </div>
      {!isMergingEnabled && (
        <div className="mb-10">
          <p className="text-white text-center w-full text-xl mt-12">Merging not enabled yet.</p>
          {mergeStartTimestamp && <Countdown endTime={new Date(mergeStartTimestamp.toNumber() * 1000).getTime()} />}
        </div>
      )}
      {
        // TODO: General loading state (for all the other contract variables)

        !address ? (
          <p className="text-white text-center w-full text-xl mt-12">Wallet not connected.</p>
        ) : loadingTokens ? (
          <div className="flex justify-center w-screen  p-5 items-center mt-7">
            <div>
              <div className="flex w-full justify-center">
                <img className="h-[20px] " src={blockSpinner}></img>
              </div>
              <p className="text-white text-center w-full text-xl pt-2">Fetching tokens</p>
            </div>
          </div>
        ) : (
          <>
            {ownedNFTs.length == 0 ? (
              <p className="text-white text-center w-full text-xl mt-12">This wallet does not own any Black Holes.</p>
            ) : (
              <>
                {mergeSuccess ? (
                  <div className="w-full">
                    <div className="flex justify-center">
                      <button
                        className="text-gray-500 hover:text-white transition-colors text-base w-96 text-left mt-3"
                        onClick={() => {
                          setFinalPage(false)
                          setMergeSuccess(false)
                        }}
                      >
                        {"<-Back"}
                      </button>
                    </div>
                    <p className="w-full text-center text-xl text-white mt-12">
                      Merge successful,{" "}
                      <a
                        className="transition-colors hover:text-white text-gray-500 hover:underline cursor-pointer"
                        target="_blank"
                        href={getOpenSeaLink(deployments.chainId, mergeTokenIds[0].toNumber())}
                      >
                        view token
                      </a>
                    </p>
                  </div>
                ) : (
                  // Add link

                  <>
                    {!finalPage ? (
                      <>
                        <div className="flex justify-center w-screen z-1">
                          <div className="w-96">
                            {isMergingEnabled && (
                              <div className="flex justify-end w-full mt-6">
                                {totalSM > 0 ? (
                                  <>
                                    <button
                                      className="text-base hover:text-white text-gray-500 transition-all pr-2"
                                      onClick={() => {
                                        handleResetAll()
                                        generalClickSound()
                                      }}
                                    >
                                      RESET |
                                    </button>
                                    <button
                                      className="text-base hover:text-white text-gray-500 transition-all "
                                      onClick={() => {
                                        handleSelectAll()
                                        generalClickSound()
                                      }}
                                    >
                                      SELECT ALL
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    className="text-base hover:text-white text-gray-500 transition-color "
                                    onClick={() => {
                                      handleSelectAll()
                                      generalClickSound()
                                    }}
                                  >
                                    SELECT ALL
                                  </button>
                                )}
                              </div>
                            )}
                            <div className="h-[380px] overflow-auto mt-1">
                              <div className="grid grid-cols-4 gap-2 mt-2 max-h-[380px] overflow-auto pb-[72px]">
                                {ownedNFTs.map((nft, index) => {
                                  const img = nftTypeToImg[nft.name.toUpperCase()]?.trim() ?? ""
                                  const selectedStyle = nft.selected
                                    ? "border-white  text-white"
                                    : "border-gray-800 hover:border-gray-600 text-gray-700 "
                                  return (
                                    <button
                                      key={index}
                                      className={selectedStyle + " border-2 transition-colors"}
                                      onClick={() => (isMergingEnabled ? handleSelect(index) : () => {})}
                                    >
                                      <img src={img}></img>
                                      <div className="border-t-2 border-gray-800 p-1 text-sm">
                                        <p className="w-full text-left">{nft.name.toUpperCase()}</p>
                                        <div className="flex justify-between w-full">
                                          <p>#{nft.tokenId.toString()}</p>
                                          <p>{nft.mass.toString()} SM</p>
                                        </div>
                                      </div>
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                        {isMergingEnabled && (
                          <div className="flex justify-center w-screen p-5 -mt-[70px] z-2 relative">
                            <div className="flex justify-between items-center w-full max-w-[380px] border-2 border-white bg-gray-900 text-lg text-white pl-5 pr-1 py-1">
                              <div className="w-full">
                                <div className="flex w-full">
                                  {totalSM === 0 ? (
                                    <p>SELECT BLACK HOLES TO MERGE ABOVE</p>
                                  ) : (
                                    <>
                                      {selectedTokenIndexes.length < 2 ? (
                                        <p>SELECT AT LEAST 2 BLACK HOLES TO MERGE</p>
                                      ) : (
                                        <>
                                          <p>MERGE TOTAL: ‎</p>
                                          <p>
                                            {totalSM} SM → {upgradeType}
                                          </p>
                                        </>
                                      )}
                                    </>
                                  )}
                                </div>
                                {nextUpgradeDetails &&
                                  nextUpgradeDetails[0] > 0 &&
                                  totalSM !== 0 &&
                                  selectedTokenIndexes.length > 1 && (
                                    <div className="w-full pr-4">
                                      <div className="h-[2px] w-full bg-gray-500 my-1"></div>
                                      <button
                                        className="text-lg hover:text-white transition-colors text-gray-500 "
                                        onClick={() => upgradeToNextLevel(totalSM + nextUpgradeDetails[0])}
                                      >
                                        +{nextUpgradeDetails[0]} SM FOR {nextUpgradeDetails[1]}
                                      </button>
                                    </div>
                                  )}
                              </div>
                              <button
                                className="secondaryBtn text-lg py-1 h-full"
                                disabled={totalSM === 0 || selectedTokenIndexes.length < 2}
                                onClick={() => {
                                  setFinalPage(true)
                                  generalClickSound()
                                }}
                              >
                                NEXT
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="flex justify-center">
                          <button
                            className="text-gray-500 hover:text-white transition-colors text-base w-96 text-left mt-3"
                            onClick={() => setFinalPage(false)}
                          >
                            {"<-Back"}
                          </button>
                        </div>
                        <div className="flex justify-center w-screen  p-5 pb-0 ">
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
                                        value={targetTokenIndexInOwnedArray ?? ""}
                                        onChange={(e) => {
                                          // Index of target token in owned array
                                          const indexInOwnedArray = Number(e.target.value)
                                          setTargetTokenIndexInOwnedArray(indexInOwnedArray)
                                          updateMergeTokenIds(indexInOwnedArray)
                                        }}
                                        className="text-white block appearance-none bg-black border border-gray-500 hover:border-white px-3 py-1 leading-tight focus:outline-none transition-colors w-[116px]"
                                      >
                                        <option key={null} value="" disabled>
                                          Select token
                                        </option>
                                        {selectedTokenIndexes
                                          .sort((a, b) => {
                                            return compareBlackHoles(ownedNFTs[a], ownedNFTs[b])
                                          })
                                          .map((indexInOwnedArray, indexInSelectedArray) => {
                                            const nft = ownedNFTs[indexInOwnedArray]
                                            return (
                                              <option
                                                key={indexInSelectedArray}
                                                value={selectedTokenIndexes[indexInSelectedArray]}
                                              >
                                                {"#" + nft.tokenId + " (" + nft.mass + " SM)"}
                                              </option>
                                            )
                                          })}
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
                            <div className="min-w-[240px] mt-10 flex justify-center">
                              <ActionButton
                                onClick={() => merge?.()}
                                disabled={targetTokenIndexInOwnedArray == null || isMergeSignLoading}
                                text={
                                  isMergeSignLoading
                                    ? "WAITING FOR WALLET"
                                    : targetTokenIndexInOwnedArray == undefined
                                    ? "SELECT TOKEN ID ABOVE"
                                    : `MERGE INTO TOKEN #${ownedNFTs[targetTokenIndexInOwnedArray].tokenId.toString()}`
                                }
                                loading={isMergeTxLoading}
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </>
        )
      }
    </>
  )
}
