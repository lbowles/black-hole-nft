import { useState } from "react"
import micro from "../../img/blackHoles/micro.svg"

//Pull prices
const mintPrice = 0.003
const mintEnded = false
const openMintStarted = false

export const Mint = () => {
  const [mintAmount, setMintAmount] = useState(1)
  const [mintEnabled, setMintEnabled] = useState(true)

  const updateMintAmount = (amount: number) => {
    if (mintAmount + amount >= 1) {
      setMintAmount(mintAmount + amount)
    }
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
                <button className="text-gray-500 text-5xl hover:text-white" onClick={() => updateMintAmount(-1)}>
                  -
                </button>
                <button className="primaryBtn mx-2">
                  {/* TODO: rounding  */}
                  MINT {mintAmount} FOR {(mintAmount * mintPrice).toFixed(3)} ETH
                </button>
                <button className="text-gray-500 text-5xl hover:text-white" onClick={() => updateMintAmount(1)}>
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
