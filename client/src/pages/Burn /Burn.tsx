import { useAddRecentTransaction } from "@rainbow-me/rainbowkit"
import { BigNumber } from "ethers"
import { useEffect, useState } from "react"
import useSound from "use-sound"
import { useAccount, useProvider, useWaitForTransaction } from "wagmi"
import { ActionButton } from "../../components/ActionButton/ActionButton"
import { Countdown } from "../../components/Countdown/Countdown"
import { Divider } from "../../components/Divider/Divider"
import { Merge } from "../../components/Merge/Merge"
import { Migrate } from "../../components/Migrate/Migrate"
import { SimulateMerge } from "../../components/SimulateMerge/SimulateMerge"
import deployments from "../../deployments.json"
import {
  useBlackHolesAllBlackHoleLevelNames,
  useBlackHolesGetBaseUpgradeMass,
  useBlackHolesIsApprovedForAll,
  useBlackHolesIsMergingEnabled,
  useBlackHolesMerge,
  useBlackHolesSetApprovalForAll,
  useBlackHolesUpgradeIntervals,
  usePrepareBlackHolesMerge,
  usePrepareBlackHolesSetApprovalForAll,
  usePrepareVoidableBlackHolesMerge,
  usePrepareVoidableBlackHolesMint,
  useVoidableBlackHolesGetUpgradeIntervals,
  useVoidableBlackHolesIsMergingEnabled,
  useVoidableBlackHolesMerge,
  useVoidableBlackHolesMergeOpenTimestamp,
  useVoidableBlackHolesMint,
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
import { compareBlackHoles } from "../../utils/compareBlackHoles"
import { getOpenSeaLink } from "../../utils/getOpenSeaLink"
import { BlackHoleMetadata, getTokensByOwner } from "../../utils/getTokensByOwner"
import { triggerMetadataUpdate } from "../../utils/triggerMetadataUpdate"
import { SmallNavbar } from "../../components/SmallNavbar/SmallNavbar"

const nftTypeToImg: Record<string, string> = {
  MICRO: micro,
  STELLAR: stellar,
  INTERMEDIATE: intermediate,
  SUPERMASSIVE: supermassive,
  PRIMORDIAL: primordial,
}
// const nftTypeToAnimatedImg: Record<string, string> = {
//   MICRO: microAnimated,
//   STELLAR: stellarAnimated,
//   INTERMEDIATE: intermediateAnimated,
//   SUPERMASSIVE: supermassiveAnimated,
//   PRIMORDIAL: primordialAnimated,
// }

const defaultPages = [
  { name: "V1", active: true },
  { name: "V2", active: false },
  { name: "V3", active: false },
]

type PagesType = { name: string; active: boolean }[]

export const Burn = () => {
  const [ownedNFTs, setOwnedNFTs] = useState<(BlackHoleMetadata & { selected: boolean })[]>([])
  const [unmigratedOwnedNFTs, setUnmigratedOwnedNFTs] = useState<(BlackHoleMetadata & { selected: boolean })[]>([])
  const [finalPage, setFinalPage] = useState(false)
  const [totalSM, setTotalSM] = useState(0)
  const [upgradeType, setUpgradeType] = useState("")
  const [nextUpgradeDetails, setNextUpgradeDetails] = useState<[number, string] | null>()
  const [targetTokenIndexInOwnedArray, setTargetTokenIndexInOwnedArray] = useState<number>()
  const [selectedTokenIndexes, setSelectedTokenIndexes] = useState<number[]>([])
  const [mergeSuccess, setMergeSuccess] = useState(false)
  const [mergeStartTimestamp, setMergeStartTimestamp] = useState<BigNumber>()
  const [shouldShowWarning, setShouldShowWarning] = useState(false)
  const [mergeVersion, setMergeVersion] = useState<PagesType>(defaultPages)

  const [generalClickSound] = useSound(generalClickEffect)
  const [linkClickSound] = useSound(linkClickEffect)
  const [mergeSound] = useSound(mergeEffect)

  const [mergeTokenIds, setMergeTokenIds] = useState<BigNumber[]>([])
  const [loadingTokens, setLoadingTokens] = useState<boolean>(true)
  const [migrateTokenIds, setMigrateTokenIds] = useState<BigNumber[]>([])

  const { address } = useAccount()
  const provider = useProvider()
  const addRecentTransaction = useAddRecentTransaction()

  const { data: upgradeIntervals } = useVoidableBlackHolesGetUpgradeIntervals()
  const { data: levelNames } = useBlackHolesAllBlackHoleLevelNames()
  const { data: isMergingEnabled } = useVoidableBlackHolesIsMergingEnabled()
  const { data: mergeOpenTimestamp } = useVoidableBlackHolesMergeOpenTimestamp()

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
    if (!upgradeIntervals || !levelNames) return [0, "UNKNOWN"]

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

  const setActiveNavBar = (index: number) => {
    let tempMergeVersion = [...mergeVersion]
    tempMergeVersion.map((page, i) => {
      if (i === index) {
        page.active = true
      } else {
        page.active = false
      }
    })
    setMergeVersion(tempMergeVersion)
  }

  useEffect(() => {
    if (!mergeOpenTimestamp) return

    if (mergeOpenTimestamp.toNumber() === 0) {
      setMergeStartTimestamp(undefined)
      return
    }

    setMergeStartTimestamp(mergeOpenTimestamp)
  }, [mergeOpenTimestamp])

  // Get owned NFTs
  useEffect(() => {
    if (!address || !provider || finalPage) return
    const getOwnedNFTs = async () => {
      setLoadingTokens(true)
      const ownedNFTs = await getTokensByOwner({
        address: address,
        provider,
        tokenAddress: deployments.contracts.VoidableBlackHoles.address,
      })
      const unmigratedNFTs = await getTokensByOwner({
        address: address,
        provider,
        tokenAddress: deployments.contracts.BlackHoles.address,
      })
      setUnmigratedOwnedNFTs(unmigratedNFTs.map((token) => ({ ...token, selected: true })).sort(compareBlackHoles))
      setMigrateTokenIds(unmigratedNFTs.map((nft) => BigNumber.from(nft.tokenId)))
      setOwnedNFTs(ownedNFTs.map((token) => ({ ...token, selected: false })).sort(compareBlackHoles))
      setLoadingTokens(false)
    }
    getOwnedNFTs()
  }, [address, provider, finalPage]) //isMigrateTxSuccess

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

  // useEffect(() => {
  //   if (isMergeTxSuccess || isMigrateTxSuccess) {
  //     setShouldShowWarning(true)
  //   }
  // }, [isMergeTxSuccess, isMigrateTxSuccess])

  // useEffect(() => {
  //   setMigrateTokenIds(unmigratedOwnedNFTs.map((nft) => BigNumber.from(nft.tokenId)))
  // }, [unmigratedOwnedNFTs])

  useEffect(() => {
    console.log("merging enabled", isMergingEnabled)
  }, [isMergingEnabled])

  return (
    <>
      {shouldShowWarning && (
        <div className="bg-black border-2 border-amber-800 w-full p-5 mt-5 text-center">
          <p className="text-amber-600 text-base">
            Tokens may be out of sync, please allow up to 5 minutes for the list to update.
          </p>
        </div>
      )}

      {!isMergingEnabled && (
        <div className="mb-10">
          <p className="text-white text-center w-full text-xl mt-12">Merging not enabled yet.</p>
          {mergeStartTimestamp && <Countdown endTime={new Date(mergeStartTimestamp.toNumber() * 1000).getTime()} />}
        </div>
      )}

      {ownedNFTs.length === 0 && unmigratedOwnedNFTs.length === 0 && !loadingTokens ? (
        <p className="text-white text-center w-full text-xl mt-12">This wallet does not own Black Holes.</p>
      ) : (
        <>
          {ownedNFTs.length && (
            <div className="flex justify-center w-screen  p-5 pb-0">
              <div className="w-96">
                <div className="bg-black border-2 border-gray-800 w-full p-5 ">
                  <p className="text-white text-2xl">Merge</p>
                  <p className="text-gray-600 text-base pt-3">
                    The merging process allows you to upgrade the mass of one of your Black Holes by burning others. The
                    remaining token’s metadata is UPDATED. REMEMBER TO DELIST the remaining Black Hole from secondary
                    markets before upgrading.
                  </p>
                  <div className="w-full mt-4">
                    <SmallNavbar navItems={defaultPages} setActiveNavBar={setActiveNavBar} />
                  </div>
                </div>
              </div>
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
                {isMergingEnabled && upgradeIntervals && (
                  <Merge
                    enabled={isMergingEnabled}
                    tokenAddress={deployments.contracts.BlackHoles.address}
                    findNextUpgrade={findNextUpgrade}
                    findUpgradeType={findUpgradeType}
                    mergeComplete={() => {}}
                    upgradeIntervals={upgradeIntervals.map((interval) => interval.toNumber())}
                    tokens={unmigratedOwnedNFTs}
                    usePrepare={usePrepareBlackHolesMerge}
                    useWrite={useBlackHolesMerge}
                    migrateProps={{
                      useApprove: useBlackHolesSetApprovalForAll,
                      usePrepareApprove: usePrepareBlackHolesSetApprovalForAll,
                      useIsApprovedForAll: useBlackHolesIsApprovedForAll,
                    }}
                  />
                )}
              </>
            )
          }
        </>
      )}
    </>
  )
}
