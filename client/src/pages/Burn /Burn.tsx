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
  useBlackHolesV2GetUpgradeIntervals,
  useBlackHolesV2IsApprovedForAll,
  useBlackHolesV2Merge,
  useBlackHolesV2SetApprovalForAll,
  usePrepareBlackHolesMerge,
  usePrepareBlackHolesSetApprovalForAll,
  usePrepareBlackHolesV2Merge,
  usePrepareBlackHolesV2SetApprovalForAll,
  usePrepareVoidableBlackHolesMerge,
  usePrepareVoidableBlackHolesMint,
  usePrepareVoidableBlackHolesSetApprovalForAll,
  useVoidableBlackHolesGetUpgradeIntervals,
  useVoidableBlackHolesIsApprovedForAll,
  useVoidableBlackHolesIsMergingEnabled,
  useVoidableBlackHolesMerge,
  useVoidableBlackHolesMergeOpenTimestamp,
  useVoidableBlackHolesMint,
  useVoidableBlackHolesSetApprovalForAll,
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
import { BlackHoleMetadata, getTokensByOwner } from "../../utils/getTokensByOwner"
import { triggerMetadataUpdate } from "../../utils/triggerMetadataUpdate"
import { PagesType, SmallNavbar } from "../../components/SmallNavbar/SmallNavbar"

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

const defaultPageOptions: PagesType = [
  {
    name: "V1",
    visible: false,
    active: false,
  },
  { name: "Voidable", visible: false, active: false },
  { name: "V2", visible: false, active: false },
]

export const Burn = () => {
  const [blackHolesV2Tokens, setBlackHolesV2Tokens] = useState<(BlackHoleMetadata & { selected: boolean })[]>([])
  const [blackHolesV1Tokens, setBlackHolesV1Tokens] = useState<(BlackHoleMetadata & { selected: boolean })[]>([])
  const [voidableBlackHolesTokens, setVoidableBlackHolesTokens] = useState<
    (BlackHoleMetadata & { selected: boolean })[]
  >([])
  const [forceRefresh, setForceRefresh] = useState(0)
  const [mergeStartTimestamp, setMergeStartTimestamp] = useState<BigNumber>()
  const [shouldShowWarning, setShouldShowWarning] = useState(false)
  const [mergeVersion, setMergeVersion] = useState<PagesType>(defaultPageOptions)

  // const [generalClickSound] = useSound(generalClickEffect)
  // const [linkClickSound] = useSound(linkClickEffect)
  // const [mergeSound] = useSound(mergeEffect)

  const [loadingTokens, setLoadingTokens] = useState<boolean>(true)

  const { address } = useAccount()
  const provider = useProvider()

  const { data: upgradeIntervals } = useBlackHolesV2GetUpgradeIntervals()
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
    if (mergeVersion) {
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
    if (!address || !provider) return
    const getOwnedNFTs = async () => {
      setLoadingTokens(true)
      const _blackHolesV1Tokens = await getTokensByOwner({
        address: address,
        provider,
        tokenAddress: deployments.contracts.BlackHoles.address,
      })
      const _blackHolesV2Tokens = await getTokensByOwner({
        address: address,
        provider,
        tokenAddress: deployments.contracts.BlackHolesV2.address,
      })
      const _voidableBlackHolesTokens = await getTokensByOwner({
        address: address,
        provider,
        tokenAddress: deployments.contracts.VoidableBlackHoles.address,
      })
      setBlackHolesV1Tokens(_blackHolesV1Tokens.map((token) => ({ ...token, selected: true })).sort(compareBlackHoles))
      setBlackHolesV2Tokens(_blackHolesV2Tokens.map((token) => ({ ...token, selected: false })).sort(compareBlackHoles))
      setVoidableBlackHolesTokens(
        _voidableBlackHolesTokens.map((token) => ({ ...token, selected: false })).sort(compareBlackHoles),
      )

      console.log("blackHolesV1Tokens", _blackHolesV1Tokens)
      console.log("blackHolesV2Tokens", _blackHolesV2Tokens)
      console.log("voidableBlackHolesTokens", _voidableBlackHolesTokens)

      setLoadingTokens(false)
    }
    getOwnedNFTs()
  }, [address, provider, forceRefresh]) //isMigrateTxSuccess

  const handleMergeComplete = () => {
    setForceRefresh(forceRefresh + 1)
  }

  useEffect(() => {
    console.log("merging enabled", isMergingEnabled)
  }, [isMergingEnabled])

  useEffect(() => {
    const options: PagesType = [
      {
        name: "V1",
        visible: blackHolesV1Tokens.length > 0,
        active: false,
      },
      { name: "Voidable", visible: voidableBlackHolesTokens.length > 0, active: false },
      { name: "V2", visible: blackHolesV2Tokens.length > 0, active: false },
    ].map((page, i) => ({ ...page }))

    console.log(options)

    // Set the page index to the index of the first visible page
    for (let i = 0; i < options.length; i++) {
      if (options[i].visible) {
        options[i].active = true
        break
      }
    }

    setMergeVersion(options)
  }, [blackHolesV1Tokens, blackHolesV2Tokens, voidableBlackHolesTokens])

  return (
    <>
      {shouldShowWarning && (
        <div className="bg-black border-2 border-amber-800 w-full p-5 mt-5 text-center">
          <p className="text-amber-600 text-base">
            Tokens may be out of sync, please allow up to 5 minutes for the list to update.
          </p>
        </div>
      )}

      {!isMergingEnabled ? (
        <div className="mb-10">
          <p className="text-white text-center w-full text-xl mt-12">Merging not enabled yet.</p>
          {mergeStartTimestamp && <Countdown endTime={new Date(mergeStartTimestamp.toNumber() * 1000).getTime()} />}
        </div>
      ) : (
        <div className="flex justify-center w-screen  p-5 pb-0">
          <div className="w-96">
            <div className="bg-black border-2 border-gray-800 w-full p-5 ">
              <p className="text-white text-2xl">Merge</p>
              <p className="text-gray-600 text-base pt-3">
                The merging process allows you to upgrade the mass of one of your Black Holes by burning others. The
                remaining token's metadata is updated.{" "}
                <a
                  href="https://opensea.io/collection/onchain-blackholes-v1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white underline transition-colors"
                >
                  V1 Black Holes
                </a>{" "}
                can be purchased, merged, and migrated to V2. <br></br>{" "}
                <p className="text-white" style={{ display: "inline" }}>
                  Remeber to delist
                </p>{" "}
                the remaining Black Hole from secondary markets before upgrading.
              </p>
              <div className="w-full mt-4">
                <SmallNavbar navItems={mergeVersion} setActiveNavBar={setActiveNavBar} />
              </div>
              <p className="text-gray-600 text-base pt-3">
                {/* V1 */}
                {mergeVersion[0].active && (
                  <>
                    Black Holes V1 is the original deployment of Black Holes. These Black Holes can be migrated to Black
                    Holes V2, which has improvements such as lower upgrade masses for Stellar and Supermassive Black
                    Holes.
                  </>
                )}
                {/* Voidable */}
                {mergeVersion[1].active && (
                  <>
                    Voidable Black Holes are Black Holes which needed to be migrated in order to be merged. These Black
                    Holes should be migrated to V2 and if you are the owner of such Black Holes, your migration gas
                    costs have been refunded.
                  </>
                )}
                {/* V2 */}
                {mergeVersion[2].active && <>Black Holes V2 is the latest deployment of Black Holes. </>}
              </p>
            </div>
          </div>
        </div>
      )}

      {blackHolesV2Tokens.length === 0 &&
      blackHolesV1Tokens.length === 0 &&
      voidableBlackHolesTokens.length === 0 &&
      !loadingTokens ? (
        <p className="text-white text-center w-full text-xl mt-12">This wallet does not own Black Holes.</p>
      ) : (
        <>
          {!address ? (
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
              {isMergingEnabled && upgradeIntervals && blackHolesV2Tokens.length > 0 && mergeVersion[2].active && (
                <Merge
                  title="Black Holes V2"
                  enabled={isMergingEnabled}
                  tokenAddress={deployments.contracts.BlackHolesV2.address}
                  findNextUpgrade={findNextUpgrade}
                  findUpgradeType={findUpgradeType}
                  mergeComplete={() => {
                    handleMergeComplete()
                  }}
                  upgradeIntervals={upgradeIntervals.map((interval) => interval.toNumber())}
                  tokens={blackHolesV2Tokens}
                  usePrepare={usePrepareBlackHolesV2Merge}
                  useWrite={useBlackHolesV2Merge}
                  migrateProps={{
                    useApprove: useBlackHolesV2SetApprovalForAll,
                    usePrepareApprove: usePrepareBlackHolesV2SetApprovalForAll,
                    useIsApprovedForAll: useBlackHolesV2IsApprovedForAll,
                  }}
                />
              )}

              {isMergingEnabled && upgradeIntervals && blackHolesV1Tokens.length > 0 && mergeVersion[0].active && (
                <Merge
                  title="Black Holes V1"
                  enabled={isMergingEnabled}
                  tokenAddress={deployments.contracts.BlackHoles.address}
                  findNextUpgrade={findNextUpgrade}
                  findUpgradeType={findUpgradeType}
                  mergeComplete={() => {
                    handleMergeComplete()
                  }}
                  upgradeIntervals={upgradeIntervals.map((interval) => interval.toNumber())}
                  tokens={blackHolesV1Tokens}
                  usePrepare={usePrepareBlackHolesMerge}
                  useWrite={useBlackHolesMerge}
                  migrateProps={{
                    useApprove: useBlackHolesSetApprovalForAll,
                    usePrepareApprove: usePrepareBlackHolesSetApprovalForAll,
                    useIsApprovedForAll: useBlackHolesIsApprovedForAll,
                  }}
                />
              )}

              {isMergingEnabled &&
                upgradeIntervals &&
                voidableBlackHolesTokens.length > 0 &&
                mergeVersion[1].active && (
                  <Merge
                    title="Voidable Black Holes"
                    enabled={isMergingEnabled}
                    tokenAddress={deployments.contracts.VoidableBlackHoles.address}
                    findNextUpgrade={findNextUpgrade}
                    findUpgradeType={findUpgradeType}
                    mergeComplete={() => {
                      handleMergeComplete()
                    }}
                    upgradeIntervals={upgradeIntervals.map((interval) => interval.toNumber())}
                    tokens={voidableBlackHolesTokens}
                    usePrepare={usePrepareVoidableBlackHolesMerge}
                    useWrite={useVoidableBlackHolesMerge}
                    migrateProps={{
                      useApprove: useVoidableBlackHolesSetApprovalForAll,
                      usePrepareApprove: usePrepareVoidableBlackHolesSetApprovalForAll,
                      useIsApprovedForAll: useVoidableBlackHolesIsApprovedForAll,
                    }}
                  />
                )}
            </>
          )}
        </>
      )}
    </>
  )
}
