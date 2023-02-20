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

// TODO: custom input

function getOpenSeaLink(chainId: string, tokenId: string | number) {
  return `https://${chainId !== "1" ? "testnets." : ""}opensea.io/assets/${chainId !== "1" ? "goerli/" : ""}${
    deployments.contracts.BlackHoles.address
  }/${tokenId}`
}

function getEtherscanBaseURL(chainId: string) {
  return `https://${chainId !== "1" ? "goerli." : ""}etherscan.io`
}

const etherscanBaseURL = getEtherscanBaseURL(deployments.chainId)

export const Mint = () => {
  const { data: mintPrice, isLoading: priceLoading } = useBlackHolesGetPrice({ watch: true })
  const { data: timedMintPrice, isLoading: timedMintPriceLoading } = useBlackHolesTimedSalePrice()
  const { data: timedMintThreshold, isLoading: timedMintThresholdLoading } = useBlackHolesTimedSaleThreshold()
  const { data: mintState, isLoading: mintStateLoading } = useBlackHolesGetMintState({ watch: true })
  const { data: timedSaleEndTimestamp, isLoading: timedSaleEndTimestampLoading } = useBlackHolesTimedSaleEndTimestamp({
    watch: true,
  })
  const { data: amountMinted, isLoading: amountMintedLoading } = useBlackHolesTotalMinted({ watch: true })

  const addRecentTransaction = useAddRecentTransaction()

  // const price = openMintStarted ? openMintPrice : preOpenMintPrice
  const account = useAccount()

  const [mintCount, setMintAmount] = useState<number>(1)
  const [totalPrice, setTotalPrice] = useState<BigNumber>()
  const [mintBtnDisabled, setMintBtnDisabled] = useState<boolean>(true)
  const [mintBtnLoading, setMintBtnLoading] = useState<boolean>(false)
  const [mintedTokens, setMintedTokens] = useState<number[]>([])
  const [customShowen, setCustomShowen] = useState<boolean>(false)

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

  const displayMintedTokens = (tokens: number[]) => {
    return (
      <>
        <span key={tokens[0]}>
          <a
            href={getOpenSeaLink(deployments.chainId, tokens[0])}
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
    if (customShowen) {
      setCustomShowen(false)
    } else {
      setCustomShowen(true)
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
      isMintTxLoading ||
      isMintSignLoading
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
    isMintSignLoading,
  ])

  useEffect(() => {
    if (mintSignResult) {
      addRecentTransaction({
        hash: mintSignResult.hash,
        description: "Mint Black Hole",
      })
    }
  }, [mintSignResult])

  useEffect(() => {
    if (mintTx) {
      const tokenIds = mintTx.logs.map((log) => {
        const events = BlackHoles__factory.createInterface().decodeEventLog("Transfer", log.data, log.topics)
        return events.tokenId.toString()
      })
      setMintedTokens(tokenIds)
    }
  }, [mintTx])

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
                  {amountMinted?.toString()}/{timedMintThreshold?.toString()} until 24 hour open edition at{" "}
                  {timedMintPrice && ethers.utils.formatEther(timedMintPrice)} ETH
                </p>
              )}
              <div className="w-full justify-center flex mt-6 transition-all">
                <div className="w-[230px] flex justify-end">
                  <button
                    className=" text-base text-gray-500 hover:text-white transition-all text-right"
                    onClick={() => toggelCustomAmount()}
                  >
                    {customShowen ? <>HIDE</> : <>CUSTOM AMOUNT</>}
                  </button>
                </div>
              </div>
              <div className="w-full justify-center flex mt-1 transition-all">
                <div className="w-[230px] flex justify-end">
                  <input
                    className={`text-white block appearance-none bg-black border border-gray-500 hover:border-white px-3 py-1 leading-tight focus:outline-none w-[60px] mb-1 transition-all ${
                      customShowen ? "visible" : "hidden"
                    }`}
                    placeholder={mintCount.toString()}
                    onChange={(e) => {
                      if (e.target.value === "") {
                        handleMintAmountChange(1)
                      } else {
                        handleMintAmountChange(parseInt(e.target.value))
                      }
                    }}
                  ></input>
                </div>
              </div>
              <div className="flex justify-center mt-1">
                <button
                  className="text-gray-500 text-5xl hover:text-white"
                  onClick={() => {
                    handleMintAmountChange(Math.max(1, mintCount - 1))
                    setCustomShowen(false)
                  }}
                  disabled={mintBtnDisabled || account.isConnected === false}
                >
                  -
                </button>
                <button
                  onClick={() => {
                    mint?.()
                    setCustomShowen(false)
                  }}
                  className="primaryBtn mx-2 min-w-[230px]"
                  disabled={mintBtnDisabled || account.isConnected === false}
                >
                  {isMintSignLoading ? (
                    <>WAITING FOR WALLET</>
                  ) : (
                    <>
                      {account.isConnected ? (
                        <>
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
                        </>
                      ) : (
                        <>CONNECT WALLET</>
                      )}
                    </>
                  )}
                </button>
                <button
                  disabled={mintBtnDisabled || account.isConnected === false}
                  className="text-gray-500 text-5xl hover:text-white"
                  onClick={() => {
                    handleMintAmountChange(mintCount + 1)
                    setCustomShowen(false)
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
