import { useState } from "react"
import { ethers } from "ethers"
import micro from "../../img/blackHoles/microAnimated.svg"
import blockSpinner from "../../img/blockSpinner.svg"
import { Countdown } from "../../components/Countdown/Countdown"

//Pull prices

type IMint = {
  preOpenMintPrice: ethers.BigNumber
  openMintPrice: ethers.BigNumber
  mintEnded: boolean
  openMintStarted: boolean
  openMintDate: Date
  amountMinted: number
}

export const Mint = ({
  preOpenMintPrice,
  openMintPrice,
  mintEnded,
  openMintStarted,
  openMintDate,
  amountMinted,
}: IMint) => {
  const startingPrice = openMintStarted ? openMintPrice : preOpenMintPrice
  const [mintAmount, setMintAmount] = useState(1)
  const [totalPrice, setTotalPrice] = useState(startingPrice.mul(mintAmount))
  const [mintBtnDisabled, setMintBtnDisabled] = useState(true)
  const [mintBtnLoading, setMintBtnLoading] = useState(false)

  const handleMintAmountChange = (amount: number) => {
    setMintAmount(amount)
    setTotalPrice(startingPrice.mul(amount))
  }

  return (
    <>
      {mintEnded ? (
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
              <p className="text-white text-2xl w-full text-center">STELLAR BLACK HOLE</p>
              <div className="flex justify-center w-full mt-7">
                <img src={micro} className="border-2 border-white"></img>
              </div>
            </div>
          </div>
          <div className="flex justify-center w-screen p-5 pt-3">
            <div className=" w-full sm:w-80">
              {openMintStarted ? (
                <>
                  <p className="text-base text-white w-full text-center">OPEN EDITION</p>
                  <Countdown endTime={openMintDate.getTime()} />
                  <p className="text-base text-white w-full text-center pt-5">{amountMinted} minted</p>
                </>
              ) : (
                <p className="text-base text-white w-full text-center">
                  {amountMinted}/1000 until 24 hour open edition at 0.003 ETH
                </p>
              )}
              <div className="flex justify-center mt-6">
                <button
                  className="text-gray-500 text-5xl hover:text-white"
                  onClick={() => handleMintAmountChange(Math.max(1, mintAmount - 1))}
                  disabled={mintBtnDisabled}
                >
                  -
                </button>
                <button className="primaryBtn mx-2 min-w-[222px]" disabled={mintBtnDisabled}>
                  {mintBtnLoading ? (
                    <>
                      "MINT" {mintAmount} FOR {ethers.utils.formatEther(totalPrice)} ETH
                    </>
                  ) : (
                    <div className="w-full flex justify-center h-full">
                      <img className="h-full p-[12px]" src={blockSpinner}></img>
                    </div>
                  )}
                  {/* TODO: rounding  */}
                </button>
                <button
                  disabled={mintBtnDisabled}
                  className="text-gray-500 text-5xl hover:text-white"
                  onClick={() => handleMintAmountChange(mintAmount + 1)}
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
