import { useAddRecentTransaction } from "@rainbow-me/rainbowkit"
import { useEffect, useState } from "react"
import { BlackHoleMetadata } from "../../utils/getTokensByOwner"
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
import { BigNumber, BigNumberish } from "ethers"
import { ActionButton } from "../ActionButton/ActionButton"
import { useBlackHolesV2IsApprovedForAll, useBlackHolesV2Migrate, usePrepareBlackHolesV2Migrate } from "../../generated"
import deployments from "../../deployments.json"
import { useWaitForTransaction } from "wagmi"
import { IMigrateProps } from "../../interfaces/IMigrateProps"

const nftTypeToImg: Record<string, string> = {
  MICRO: micro,
  STELLAR: stellar,
  INTERMEDIATE: intermediate,
  SUPERMASSIVE: supermassive,
  PRIMORDIAL: primordial,
}

export function Migrate({ tokens, tokenAddress, usePrepareApprove, useApprove }: IMigrateProps) {
  const [unmigratedOwnedNFTs, setUnmigratedOwnedNFTs] = useState<(BlackHoleMetadata & { selected: boolean })[]>([])
  const [migrateTokenIds, setMigrateTokenIds] = useState<BigNumber[]>([])

  const addRecentTransaction = useAddRecentTransaction()

  const { data: isApprovedForAll } = useBlackHolesV2IsApprovedForAll({
    args: [tokenAddress as `0x${string}`, deployments.contracts.BlackHolesV2.address],
    watch: true,
  })

  const { config: approvalConfig } = usePrepareApprove({
    args: [deployments.contracts.VoidableBlackHoles.address, true],
    enabled: unmigratedOwnedNFTs.length > 0,
  })
  const {
    write: approveMigrate,
    data: migrateApproveSignResult,
    isLoading: isApproveMigrationSignLoading,
    isSuccess: isMigrateApproveSignSuccess,
  } = useApprove(approvalConfig)

  const { config: migrateConfig } = usePrepareBlackHolesV2Migrate({
    args: [tokenAddress as `0x${string}`, migrateTokenIds ? [migrateTokenIds[0]] : []],
    enabled: migrateTokenIds.length > 0 && isApprovedForAll,
  })
  const {
    write: migrate,
    data: migrateSignResult,
    isLoading: isMigrateSignLoading,
    isSuccess: isMigrateSignSuccess,
  } = useBlackHolesV2Migrate(migrateConfig)

  const { data: approveTx, isLoading: isApproveTxLoading } = useWaitForTransaction({
    hash: migrateApproveSignResult?.hash,
    confirmations: 1,
  })

  const {
    data: migrateTx,
    isLoading: isMigrateTxLoading,
    isSuccess: isMigrateTxSuccess,
  } = useWaitForTransaction({
    hash: migrateSignResult?.hash,
    confirmations: 1,
  })

  const deselectMigrateItem = (index: number) => {
    const updatedNFTs = [...unmigratedOwnedNFTs]
    updatedNFTs[index].selected = false

    // Remive item from migrateTokenIds
    let migrateTokenIdsCopy = [...migrateTokenIds]
    const migrateTokenIndex = migrateTokenIdsCopy.indexOf(BigNumber.from(unmigratedOwnedNFTs[index].tokenId))
    migrateTokenIdsCopy.splice(migrateTokenIndex, 1)
    setMigrateTokenIds(migrateTokenIdsCopy)

    setUnmigratedOwnedNFTs(updatedNFTs)
  }

  useEffect(() => {
    setUnmigratedOwnedNFTs(tokens)
    setMigrateTokenIds(tokens.map((nft) => BigNumber.from(nft.tokenId.toString())))
  }, tokens)

  useEffect(() => {
    if (migrateApproveSignResult) {
      addRecentTransaction({
        hash: migrateApproveSignResult.hash,
        description: `Approve Voided Black Holes to Migrate Black Holes`,
      })
    }
  }, [migrateApproveSignResult])

  useEffect(() => {
    if (migrateSignResult) {
      addRecentTransaction({
        hash: migrateSignResult.hash,
        description: `Migrate ${migrateTokenIds.length} Black Holes`,
      })
    }
  }, [migrateSignResult])

  return (
    <>
      {unmigratedOwnedNFTs.length > 0 && (
        <>
          <div className="flex justify-center w-screen  p-5 pb-0">
            <div className="w-96">
              <div className="bg-black border-2 border-gray-800 w-full p-5 mt-6">
                <p className="text-white text-2xl">Complete Merge</p>
                <p className="text-gray-600 text-base pt-3">
                  Complete the merge by migrating your Black Holes to the V2 contract to reflect the correct level.
                </p>
              </div>
            </div>
          </div>
          <>
            <div className="flex justify-center w-screen z-1 mt-5">
              <div className="w-96">
                <div className="max-h-[280px] overflow-auto mt-1">
                  <div className="grid grid-cols-4 gap-2 mt-2 max-h-[280px] overflow-auto pb-[30px]">
                    {unmigratedOwnedNFTs.map((nft, index) => {
                      const img = nft.image ?? nftTypeToImg[nft.name.toUpperCase()]?.trim() ?? ""
                      const selectedStyle = nft.selected
                        ? "border-white  text-white"
                        : "border-gray-800 hover:border-gray-600 text-gray-700 "
                      return (
                        <button
                          key={index}
                          className={`${selectedStyle} border-2`}
                          onClick={() => {
                            if (!nft.selected) {
                            } else {
                              deselectMigrateItem(index)
                            }
                          }}
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
          </>
          <div className="flex justify-center w-screen  p-5 pb-0">
            <div className="w-96 pt-4">
              <div className="w-full flex justify-center mb-16">
                {migrateTokenIds.length > 0 ? (
                  !isApprovedForAll ? (
                    <ActionButton
                      onClick={() => {
                        if (isApprovedForAll) {
                        } else {
                          approveMigrate?.()
                        }
                      }}
                      disabled={isApproveMigrationSignLoading}
                      text={isApproveMigrationSignLoading ? "WAITING FOR WALLET" : `APPROVE MIGRATION (1/2)`}
                      loading={isApproveTxLoading}
                    />
                  ) : (
                    <ActionButton
                      onClick={() => {
                        migrate?.()
                      }}
                      disabled={isMigrateSignLoading}
                      text={
                        isMigrateSignLoading
                          ? "WAITING FOR WALLET"
                          : `MIGRATE ALL ${migrateTokenIds.length} TOKENS (2/2)`
                      }
                      loading={isMigrateTxLoading}
                    />
                  )
                ) : (
                  <></>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
