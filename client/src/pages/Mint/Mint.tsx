import { useState } from "react"
import { ethers } from "ethers"
import micro from "../../img/blackHoles/micro.svg"

//Pull prices
const preOpenMintPrice = ethers.utils.parseEther("0.003")
const openMintPrice = ethers.utils.parseEther("0.005")
const mintEnded = false
const openMintStarted = false
const startingPrice = openMintStarted ? openMintPrice : preOpenMintPrice

export const Mint = () => {
  const [mintAmount, setMintAmount] = useState(1)
  const [totalPrice, setTotalPrice] = useState(startingPrice.mul(mintAmount))
  const [mintEnabled, setMintEnabled] = useState(true)

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
                <p className="text-base text-white w-full text-center">
                  123/1000 until 24 hour open edition at 0.005 ETH
                </p>
              ) : (
                <>
                  <p className="text-base text-white w-full text-center">OPEN EDITION</p>
                  <p className="text-base text-white w-full text-center">
                    123/1000 until 24 hour open edition at 0.005 ETH
                  </p>
                </>
              )}
              <div className="flex justify-center mt-6">
                <button
                  className="text-gray-500 text-5xl hover:text-white"
                  onClick={() => handleMintAmountChange(Math.max(1, mintAmount - 1))}
                >
                  -
                </button>
                <button className="primaryBtn mx-2">
                  {/* TODO: rounding  */}
                  MINT {mintAmount} FOR {ethers.utils.formatEther(totalPrice)} ETH
                </button>
                <button
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
