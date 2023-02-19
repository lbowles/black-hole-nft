import { useEffect, useState } from "react"
import { BigNumber, ethers } from "ethers"
import micro from "../../img/blackHoles/microAnimated.svg"
import blockSpinner from "../../img/blockSpinner.svg"
import { Countdown } from "../../components/Countdown/Countdown"
import {
  useBlackHolesGetMintState,
  useBlackHolesGetPrice,
  useBlackHolesMint,
  useBlackHolesTimedSaleEndTimestamp,
  useBlackHolesTotalMinted,
  usePrepareBlackHolesMint,
} from "../../generated"
import { MintState } from "../../interfaces/IMintState"
import { useWaitForTransaction } from "wagmi"
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit"

export const Mint = () => {
  const { data: mintPrice, isLoading: priceLoading } = useBlackHolesGetPrice({ watch: true })
  const { data: mintState, isLoading: mintStateLoading } = useBlackHolesGetMintState({ watch: true })
  const { data: timedSaleEndTimestamp, isLoading: timedSaleEndTimestampLoading } = useBlackHolesTimedSaleEndTimestamp({
    watch: true,
  })
  const { data: amountMinted, isLoading: amountMintedLoading } = useBlackHolesTotalMinted({ watch: true })

  const addRecentTransaction = useAddRecentTransaction()

  // const price = openMintStarted ? openMintPrice : preOpenMintPrice
  const [mintCount, setMintAmount] = useState(1)
  const [totalPrice, setTotalPrice] = useState<BigNumber>()
  const [mintBtnDisabled, setMintBtnDisabled] = useState(true)
  const [mintBtnLoading, setMintBtnLoading] = useState(false)

  const { config: mintConfig, error: mintError } = usePrepareBlackHolesMint({
    args: [BigNumber.from(`${mintCount}`)],
    overrides: {
      value: mintPrice?.mul(mintCount!),
    },
    enabled: mintState !== MintState.Closed,
  })
  const {
    write: mint,
    data: mintSignResult,
    isLoading: isMintSignLoading,
    isSuccess: isMintSignSuccess,
  } = useBlackHolesMint(mintConfig)

  const { data: mintTx, isLoading: isMintTxLoading } = useWaitForTransaction({
    hash: mintSignResult?.hash,
    confirmations: 1,
  })

  const handleMintAmountChange = (amount: number) => {
    setMintAmount(amount)
    setTotalPrice(mintPrice?.mul(amount))
  }

  useEffect(() => {
    setTotalPrice(mintPrice?.mul(mintCount))
  }, [mintPrice])

  useEffect(() => {
    const loading = priceLoading || mintStateLoading || timedSaleEndTimestampLoading || amountMintedLoading
    setMintBtnLoading(loading)
    setMintBtnDisabled(loading || mintState === MintState.Closed)
  }, [priceLoading, mintStateLoading, timedSaleEndTimestampLoading, amountMintedLoading, mintState])

  useEffect(() => {
    if (mintSignResult) {
      addRecentTransaction({
        hash: mintSignResult.hash,
        description: "Mint Black Hole",
      })
    }
  }, [mintSignResult])

  return (
    <>
      {mintState === MintState.Closed ? (
        <div className="w-screen h-[70vh] flex justify-center items-center">
          <p className="text-white text-2xl">
            Mint ended, view on{" "}
            <a target="_blank" href="https://opensea.com" className="text-gray-500 hover:text-white text-2xl underline">
              OpenSea
            </a>
          </p>
        </div>
      ) : (
        <>
          <div className="flex justify-center w-screen mt-[60px] p-5">
            <div className=" w-full sm:w-60">
              <p className="text-white text-2xl w-full text-center">MICRO BLACK HOLE</p>
              <div className="flex justify-center w-full mt-7">
                <img src={micro} className="border-2 border-white"></img>
              </div>
            </div>
          </div>
          <div className="flex justify-center w-screen p-5 pt-3">
            <div className=" w-full sm:w-80">
              {mintState === MintState.TimedSale ? (
                <>
                  <p className="text-base text-white w-full text-center">OPEN EDITION</p>
                  {timedSaleEndTimestamp !== undefined && (
                    <Countdown endTime={new Date(timedSaleEndTimestamp.toNumber() * 1000).getTime()} />
                  )}
                  <p className="text-base text-white w-full text-center pt-5">{amountMinted?.toString()} minted</p>
                </>
              ) : (
                <p className="text-base text-white w-full text-center">
                  {amountMinted?.toString()}/1000 until 24 hour open edition at 0.003 ETH
                </p>
              )}
              <div className="flex justify-center mt-6">
                <button
                  className="text-gray-500 text-5xl hover:text-white"
                  onClick={() => handleMintAmountChange(Math.max(1, mintCount - 1))}
                  disabled={mintBtnDisabled}
                >
                  -
                </button>
                <button onClick={mint} className="primaryBtn mx-2 min-w-[222px]" disabled={mintBtnDisabled}>
                  {mintBtnLoading ? (
                    <div className="w-full flex justify-center h-full">
                      <img className="h-full p-[12px]" src={blockSpinner}></img>
                    </div>
                  ) : (
                    totalPrice !== undefined && (
                      <>
                        MINT {mintCount} FOR {ethers.utils.formatEther(totalPrice)} ETH
                      </>
                    )
                  )}
                </button>
                <button
                  disabled={mintBtnDisabled}
                  className="text-gray-500 text-5xl hover:text-white"
                  onClick={() => handleMintAmountChange(mintCount + 1)}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
