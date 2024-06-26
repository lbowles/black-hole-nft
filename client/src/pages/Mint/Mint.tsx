import { useEffect, useState } from "react"
import { BigNumber, ethers } from "ethers"
import micro from "../../img/blackHoles/microAnimated.svg"
import { Countdown } from "../../components/Countdown/Countdown"
import {
  useBlackHolesGetMintState,
  useBlackHolesGetPrice,
  useBlackHolesMint,
  useBlackHolesTimedSaleDuration,
  useBlackHolesTimedSaleEndTimestamp,
  useBlackHolesTimedSalePrice,
  useBlackHolesTimedSaleThreshold,
  useBlackHolesTotalMinted,
  usePrepareBlackHolesMint,
} from "../../generated"
import { MintState } from "../../interfaces/IMintState"
import { useWaitForTransaction } from "wagmi"
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit"
import { useAccount } from "wagmi"
import { BlackHoles__factory } from "../../../../backend/types"
import deployments from "../../deployments.json"
import { ActionButton } from "../../components/ActionButton/ActionButton"
import useSound from "use-sound"
import mintEffect from "../../sounds/mint.mp3"
import submitEffect from "../../sounds/submit.mp3"
import smallClickEffect from "../../sounds/smallClick.mp3"
import generalClickEffect from "../../sounds/generalClick.mp3"
import { getOpenSeaLink } from "../../utils/getOpenSeaLink"
import { getEtherscanBaseURL } from "../../utils/getEtherscanBaseURL"

const etherscanBaseURL = getEtherscanBaseURL(deployments.chainId)

export const Mint = () => {
  const { data: mintPrice, isLoading: priceLoading } = useBlackHolesGetPrice({ watch: true })
  const { data: timedMintPrice, isLoading: timedMintPriceLoading } = useBlackHolesTimedSalePrice()
  const { data: timedMintThreshold, isLoading: timedMintThresholdLoading } = useBlackHolesTimedSaleThreshold()
  const { data: mintState, isLoading: mintStateLoading } = useBlackHolesGetMintState({ watch: true })
  const { data: timedSaleEndTimestamp, isLoading: timedSaleEndTimestampLoading } = useBlackHolesTimedSaleEndTimestamp({
    watch: true,
  })
  const { data: timedSaleDuration } = useBlackHolesTimedSaleDuration()
  const { data: amountMinted, isLoading: amountMintedLoading } = useBlackHolesTotalMinted({ watch: true })

  const addRecentTransaction = useAddRecentTransaction()

  // const price = openMintStarted ? openMintPrice : preOpenMintPrice
  const account = useAccount()

  const [mintCount, setMintAmount] = useState<number>(1)
  const [totalPrice, setTotalPrice] = useState<BigNumber>()
  const [mintBtnDisabled, setMintBtnDisabled] = useState<boolean>(true)
  const [mintBtnLoading, setMintBtnLoading] = useState<boolean>(false)
  const [mintedTokens, setMintedTokens] = useState<number[]>([])
  const [isCustomVisible, setIsCustomVisible] = useState<boolean>(false)
  const [mintSound] = useSound(mintEffect)
  const [submitSound] = useSound(submitEffect)
  const [generalClickSound] = useSound(generalClickEffect)
  const [playbackRate, setPlaybackRate] = useState(0.75)
  const [smallClickSound] = useSound(smallClickEffect, { playbackRate: playbackRate })

  const handleAmountClick = (value: number) => {
    let tempPlaybackRate = playbackRate

    if (value > mintCount) {
      for (let i = mintCount; i < value; i++) {
        if (tempPlaybackRate < 10) {
          tempPlaybackRate = tempPlaybackRate + 0.4
        }
      }
      setPlaybackRate(tempPlaybackRate)
      smallClickSound()
    }
    let tempMintCount = value
    if (value < mintCount) {
      for (let i = value; i < mintCount; i++) {
        tempMintCount = tempMintCount - 1
        if (tempMintCount < 24) {
          if (tempPlaybackRate - 0.4 > 0.5) {
            tempPlaybackRate = tempPlaybackRate - 0.4
          }
        }
      }
      setPlaybackRate(tempPlaybackRate)
      smallClickSound()
    }
  }

  const { config: mintConfig, error: mintError } = usePrepareBlackHolesMint({
    args: [BigNumber.from(`${mintCount}`)],
    overrides: {
      value: mintPrice?.mul(mintCount!),
    },
    enabled: mintState !== undefined && mintState !== MintState.Closed,
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

  const displayMintedTokens = (tokens: number[]) => {
    return (
      <>
        <span key={tokens[0]}>
          <a
            href={getOpenSeaLink(deployments.contracts.BlackHoles.address, tokens[0])}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white hover:underline no-underline transition-colors"
          >
            {tokens[0]}
          </a>
          &nbsp;
        </span>
        {tokens.length > 1 && (
          <>
            {" "}
            ... &nbsp;
            <span key={tokens[tokens.length - 1]}>
              <a
                href={getOpenSeaLink(deployments.chainId, tokens[tokens.length - 1])}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white hover:underline no-underline transition-colors"
              >
                {tokens[tokens.length - 1]}
              </a>
              &nbsp;
            </span>
          </>
        )}
      </>
    )
  }

  const toggelCustomAmount = () => {
    if (isCustomVisible) {
      setIsCustomVisible(false)
    } else {
      setIsCustomVisible(true)
    }
  }

  useEffect(() => {
    setTotalPrice(mintPrice?.mul(mintCount))
  }, [mintPrice])

  useEffect(() => {
    const loading =
      priceLoading ||
      timedMintPriceLoading ||
      timedMintThresholdLoading ||
      mintStateLoading ||
      timedSaleEndTimestampLoading ||
      amountMintedLoading ||
      isMintTxLoading
    setMintBtnLoading(loading)
    setMintBtnDisabled(loading || mintState === MintState.Closed)
  }, [
    priceLoading,
    timedMintPriceLoading,
    timedMintThresholdLoading,
    mintStateLoading,
    timedSaleEndTimestampLoading,
    amountMintedLoading,
    mintState,
    isMintTxLoading,
  ])

  useEffect(() => {
    if (mintSignResult) {
      addRecentTransaction({
        hash: mintSignResult.hash,
        description: `Mint ${mintCount} Black Hole${mintCount === 1 ? "" : "s"}`,
      })
      submitSound()
    }
  }, [mintSignResult])

  // useEffect(() => {
  //   if (mintTx?.status === 1) {
  //     mintSound()
  //     const tokenIds = mintTx.logs
  //       .map((log) => {
  //         try {
  //           const events = BlackHoles__factory.createInterface().decodeEventLog("Transfer", log.data, log.topics)
  //           return events.tokenId.toString()
  //         } catch (e) {
  //           return null
  //         }
  //       })
  //       .filter((id) => id !== null)
  //     setMintedTokens(tokenIds)
  //   }
  // }, [mintTx])

  return (
    <>
      {mintState === MintState.Closed ? (
        <div className="w-screen h-[70vh] flex justify-center items-center">
          <p className="text-white text-2xl">
            Mint ended, view on{" "}
            <a
              target="_blank"
              href="https://opensea.io/collection/onchain-blackholes"
              className="text-gray-500 hover:text-white text-2xl underline"
            >
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
                  <p className="text-base text-white w-full text-center">TIMED SALE</p>
                  {timedSaleEndTimestamp !== undefined && (
                    <Countdown endTime={new Date(timedSaleEndTimestamp.toNumber() * 1000).getTime()} />
                  )}
                  <p className="text-base text-white w-full text-center pt-5">{amountMinted?.toString()} minted</p>
                </>
              ) : (
                <p className="text-base text-white w-full text-center mb-6">
                  {amountMinted?.toString()}/{timedMintThreshold?.toString()} until{" "}
                  {Math.floor((timedSaleDuration?.toNumber() || 0) / 60 / 60)} hour timed sale at{" "}
                  {timedMintPrice && ethers.utils.formatEther(timedMintPrice)} ETH
                </p>
              )}
              {account.isConnected && (
                <>
                  <div className="w-full justify-center flex mt-6 transition-all">
                    <div className="w-[230px] flex justify-end">
                      <button
                        disabled={isMintSignLoading || isMintTxLoading}
                        className=" text-base text-gray-500 hover:text-white transition-all text-right"
                        onClick={() => {
                          toggelCustomAmount()
                          generalClickSound()
                        }}
                      >
                        {isCustomVisible ? <>HIDE</> : <>CUSTOM AMOUNT</>}
                      </button>
                    </div>
                  </div>
                  <div className="w-full justify-center flex mt-1 transition-all">
                    <div className="w-[230px] flex justify-end">
                      <input
                        className={`text-white block appearance-none bg-black border border-gray-500 hover:border-white px-3 py-1 leading-tight focus:outline-none w-[90px] mb-1 transition-all ${
                          isCustomVisible && !isMintSignLoading && !isMintTxLoading ? "visible" : "hidden"
                        }`}
                        type="number"
                        placeholder={mintCount.toString()}
                        onChange={(e) => {
                          let value = parseInt(e.target.value)
                          if (e.target.value === "" || value === 0) {
                            handleMintAmountChange(1)
                          } else {
                            handleMintAmountChange(value)
                            handleAmountClick(value)
                          }
                        }}
                      ></input>
                    </div>
                  </div>
                </>
              )}
              <div className="flex justify-center mt-1">
                <button
                  className="text-gray-500 text-5xl hover:text-white"
                  onClick={() => {
                    handleMintAmountChange(Math.max(1, mintCount - 1))
                    setIsCustomVisible(false)
                    handleAmountClick(mintCount - 1)
                  }}
                  disabled={mintBtnDisabled || !account.isConnected || isMintSignLoading}
                >
                  -
                </button>

                <ActionButton
                  text={
                    isMintSignLoading
                      ? "WAITING FOR WALLET"
                      : !account.isConnected
                      ? "CONNECT WALLET"
                      : totalPrice !== undefined
                      ? `MINT ${mintCount} FOR ${ethers.utils.formatEther(totalPrice)} ETH`
                      : "PRICE UNAVAILABLE"
                  }
                  disabled={mintBtnDisabled || !account.isConnected || isMintSignLoading}
                  loading={mintBtnLoading}
                  onClick={() => {
                    mint?.()
                    setIsCustomVisible(false)
                    generalClickSound()
                  }}
                />
                <button
                  disabled={mintBtnDisabled || !account.isConnected || isMintSignLoading}
                  className="text-gray-500 text-5xl hover:text-white"
                  onClick={() => {
                    handleMintAmountChange(mintCount + 1)
                    setIsCustomVisible(false)
                    // handleAmountClickUp()
                    handleAmountClick(mintCount + 1)
                  }}
                >
                  +
                </button>
              </div>

              {mintTx && mintTx.status && (
                <div>
                  <div className="w-full flex justify-center">
                    <a
                      href={`${etherscanBaseURL}/tx/${mintTx.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base text-gray-500 hover:text-white hover:underline no-underline transition-colors pt-5"
                    >
                      View transaction
                    </a>
                  </div>
                  <p className="text-base text-gray-500 transition-colors w-full text-center pt-1">
                    Minted tokens: [ {displayMintedTokens(mintedTokens)}]
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}
