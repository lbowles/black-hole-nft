import { useAddRecentTransaction } from "@rainbow-me/rainbowkit"
import { BigNumber } from "ethers"
import { useEffect, useState } from "react"
import useSound from "use-sound"
import { useWaitForTransaction } from "wagmi"
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
import dropdown from "../../img/dropdown.svg"
import generalClickEffect from "../../sounds/generalClick.mp3"
import linkClickEffect from "../../sounds/linkClick.mp3"
import mergeEffect from "../../sounds/merge.mp3"
import { compareBlackHoles } from "../../utils/compareBlackHoles"
import { BlackHoleMetadata } from "../../utils/getTokensByOwner"
import { triggerMetadataUpdate } from "../../utils/triggerMetadataUpdate"
import { ActionButton } from "../ActionButton/ActionButton"
import { SimulateMerge } from "../SimulateMerge/SimulateMerge"

import deployments from "../../deployments.json"
import { Migrate } from "../Migrate/Migrate"
import { IMigrateProps } from "../../interfaces/IMigrateProps"
import { useBlackHolesV2Migrate, usePrepareBlackHolesV2Migrate } from "../../generated"

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

interface IMergeProps {
  tokens: (BlackHoleMetadata & { selected: boolean })[]
  tokenAddress: string
  enabled: boolean
  upgradeIntervals: readonly number[]
  findUpgradeType: (totalSM: number) => string
  findNextUpgrade: (totalSM: number) => [number, string] | null
  mergeComplete: () => void
  usePrepare: (config: any) => any
  useWrite: (config: any) => any
}

export function Merge({
  tokens,
  tokenAddress,
  enabled,
  upgradeIntervals,
  findUpgradeType,
  findNextUpgrade,
  mergeComplete,
  usePrepare,
  useWrite,
  migrateProps,
}: IMergeProps & { migrateProps: Pick<IMigrateProps, "usePrepareApprove" | "useApprove"> }) {
  const [totalSM, setTotalSM] = useState(0)
  const [ownedNFTs, setOwnedNFTs] = useState<(BlackHoleMetadata & { selected: boolean })[]>([])
  const [targetTokenIndexInOwnedArray, setTargetTokenIndexInOwnedArray] = useState<number>()
  const [nextUpgradeDetails, setNextUpgradeDetails] = useState<[number, string] | null>()
  const [upgradeType, setUpgradeType] = useState("")
  const [mergeTokenIds, setMergeTokenIds] = useState<BigNumber[]>([])
  const [finalPage, setFinalPage] = useState(false)
  const [migrationPage, setMigrationPage] = useState(false)

  const [selectedTokenIndexes, setSelectedTokenIndexes] = useState<number[]>([])

  const [generalClickSound] = useSound(generalClickEffect)
  const [linkClickSound] = useSound(linkClickEffect)
  const [mergeSound] = useSound(mergeEffect)

  const addRecentTransaction = useAddRecentTransaction()

  const { config: mergeConfig } = usePrepare({
    args: [mergeTokenIds],
    enabled: mergeTokenIds.length >= 2,
  })
  const { write: merge, data: signResult, isLoading: isSignLoading, isSuccess: isSignSuccess } = useWrite(mergeConfig)

  const {
    data: mergeTx,
    isLoading: isTxLoading,
    isSuccess: isMergeTxSuccess,
  } = useWaitForTransaction({
    hash: signResult?.hash,
    confirmations: 1,
  })

  // const { config: migrateConfig } = usePrepareBlackHolesV2Migrate({
  //   args: [tokenAddress as `0x${string}`, mergeTokenIds ? [mergeTokenIds[0]] : []],
  //   enabled: isMergeTxSuccess
  // })
  // const { write: migrate, data: migrateSignResult, isLoading: isMigrateSignLoading, isSuccess: isMigrateSignSuccess } = useBlackHolesV2Migrate(migrateConfig)

  const handleSelectAll = () => {
    const updatedNFTs = ownedNFTs.map((nft) => ({ ...nft, selected: true }))
    setOwnedNFTs(updatedNFTs)
  }

  const handleResetAll = () => {
    const updatedNFTs = ownedNFTs.map((nft) => ({ ...nft, selected: false }))
    setOwnedNFTs(updatedNFTs)
  }

  const handleSelect = (index: number) => {
    linkClickSound()
    const updatedNFTs = [...ownedNFTs]
    updatedNFTs[index].selected = !updatedNFTs[index].selected
    setOwnedNFTs(updatedNFTs)
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
    setOwnedNFTs(tokens)
  }, tokens)

  useEffect(() => {
    if (signResult) {
      addRecentTransaction({
        hash: signResult?.hash,
        description: `Merge ${selectedTokenIndexes.length} Black Holes`,
      })
    }
  }, [signResult])

  useEffect(() => {
    if (!upgradeIntervals || ownedNFTs.length == 0) return
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
  }, [ownedNFTs, upgradeIntervals])

  useEffect(() => {
    if (mergeTx?.status == 1) {
      setMigrationPage(true)
      triggerMetadataUpdate({
        tokenAddress: tokenAddress,
        tokenId: mergeTokenIds[0].toNumber(),
      })
      setSelectedTokenIndexes([])
      mergeSound()
    }
  }, [mergeTx])

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

  return (
    <div>
      {!finalPage ? (
        <>
          <div className="flex justify-center w-screen z-1">
            <div className="w-96">
              {enabled && (
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
                    const img = nft.image ?? nftTypeToImg[nft.name.toUpperCase()]?.trim() ?? ""
                    const selectedStyle = nft.selected
                      ? "border-white  text-white"
                      : "border-gray-800 hover:border-gray-600 text-gray-700 "
                    return (
                      <button
                        key={index}
                        className={selectedStyle + " border-2 transition-colors"}
                        onClick={() => (enabled ? handleSelect(index) : () => {})}
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
          {enabled && (
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
                            <p>MERGE TOTAL:&nbsp;</p>
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
                    setTargetTokenIndexInOwnedArray(undefined)
                    generalClickSound()
                  }}
                >
                  NEXT
                </button>
              </div>
            </div>
          )}
        </>
      ) : !migrationPage ? (
        <>
          <div className="flex justify-center">
            <button
              className="text-gray-500 hover:text-white transition-colors text-base w-96 text-left mt-3"
              onClick={() => {
                setFinalPage(false)
              }}
            >
              {"<-Back"}
            </button>
          </div>
          <div className="flex justify-center w-screen  p-5 pb-0 ">
            <div className="w-60">
              <p className="w-full text-center text-2xl text-white">You will receive</p>
              <p className="text-gray-600 text-base  w-full text-center">Select token ID to upgrade</p>
              <div className="border-2 border-white  mt-5">
                {totalSM !== undefined && (
                  <SimulateMerge
                    tokenIds={selectedTokenIndexes.map((index) => BigNumber.from(ownedNFTs[index].tokenId))}
                  />
                )}
                {/* <img src={nftTypeToAnimatedImg[upgradeType]?.trim() ?? ""} className="p-1"></img> */}
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
                                <option key={indexInSelectedArray} value={selectedTokenIndexes[indexInSelectedArray]}>
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
                  onClick={() => merge?.({ recklesslySetUnpreparedArgs: [mergeTokenIds] })}
                  disabled={targetTokenIndexInOwnedArray == null || isSignLoading}
                  text={
                    isSignLoading
                      ? "WAITING FOR WALLET"
                      : targetTokenIndexInOwnedArray == undefined
                      ? "SELECT TOKEN ID ABOVE"
                      : `MERGE INTO TOKEN #${ownedNFTs[targetTokenIndexInOwnedArray].tokenId.toString()}`
                  }
                  loading={isTxLoading}
                />
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <Migrate
            {...migrateProps}
            tokenAddress={tokenAddress}
            migrateComplete={() => console.log("Migration complete")}
            tokens={ownedNFTs.filter((nft) => mergeTokenIds[0].eq(nft.tokenId))}
          />
        </>
      )}
    </div>
  )
}
