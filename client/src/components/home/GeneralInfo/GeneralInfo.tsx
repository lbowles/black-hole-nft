import { Divider } from "../../Divider/Divider"
import micro from "../../../img/blackHoles/micro.svg"
import stellar from "../../../img/blackHoles/stellar.svg"
import intermediate from "../../../img/blackHoles/intermediate.svg"
import supperMassive from "../../../img/blackHoles/supermassive.svg"
import primordial from "../../../img/blackHoles/primordial.svg"
import { MergingAmountGraphic } from "../MergingAmountGraphic/MergingAmountGraphic"
import { useState } from "react"

const startingLevels = [
  { startName: "MICRO", endName: "STELLAR", startImg: micro, endImg: stellar, amount: undefined },
  { startName: "STELLAR", endName: "INTERMEDIATE", startImg: stellar, endImg: intermediate, amount: undefined },
  {
    startName: "INTERMEDIATE",
    endName: "SUPERMASSIVE",
    startImg: intermediate,
    endImg: supperMassive,
    amount: undefined,
  },
  { startName: "SUPERMASSIVE", endName: "PRIMORDIAL", startImg: supperMassive, endImg: primordial, amount: undefined },
]

type Ilevels = { startImg: string; endImg: string; startName: string; endName: string; amount?: number | undefined }[]

export const GeneralInfo = () => {
  const [levels, setLevels] = useState<Ilevels>(startingLevels)

  return (
    <div className="flex justify-center w-screen mt-20 p-5">
      <div className="w-full sm:w-96 ">
        {/* FAQ */}
        <p className="text-white text-3xl">FAQ</p>
        <div className="bg-black border-2 border-gray-800 w-full p-5 mt-6">
          <p className="text-white text-2xl">What is the Black Holes Project?</p>
          <p className="text-gray-600 text-base pt-3">
            Black Holes is a fully on-chain NFT collection which features procedurally generated pixel art black holes.
            Each Black Hole has an associated mass which changes its appearance. A Black Hole’s mass is increased by
            burning other Black Holes in the merging process.
          </p>
          <Divider />
          <p className="text-white text-2xl">Features</p>
          <p className="text-gray-600 text-base pt-3 pb-2">Black Holes are:</p>
          <ol className="list-disc text-gray-600 text-base ml-5">
            <li>
              <a className=" cursor-pointer text-white">Fully on-chain.</a>‎ All the code to generate all the Black Hole
              tokens and their attributes is stored permanently on the Ethereum blockchain.
            </li>
            <li className="pt-1">
              <a className=" cursor-pointer text-white">Procedurally generated.</a>‎ Each pixel of a Black Hole is
              rendered individually based on its mass. The background contains uniquely placed stars, some of which are
              animated to be sucked up by the Black Hole.
            </li>
            <li className="pt-1">
              <a className=" cursor-pointer text-white">Deflationary.</a>‎ A Black Hole’s mass can be increased by
              burning other Black Holes, decreasing the supply.
            </li>
            <li className="pt-1">
              <a className=" text-white ">Rare.</a>‎ Only 42 of the highest level Black Hole can ever exist.
            </li>
          </ol>
          <Divider />
          <p className="text-white text-2xl">Minting</p>
          <p className="text-gray-600 text-base pt-3 pb-2">The project has three phases:</p>
          <ol className="list-disc text-gray-600 text-base ml-5">
            <li>
              <a className=" text-white">Threshold mint.</a>‎ The first 1,000 tokens are sold at a discounted price of
              0.0003 ETH.
            </li>
            <li className="pt-1">
              <a className=" cursor-pointer text-white">Timed sale.</a>‎ Once 1,000 tokens are minted, a timed sale is
              triggered. The timed sale will be open for 24 hours where Black Holes can be minted for 0.004 ETH.
            </li>
            <li className="pt-1">
              <a className=" cursor-pointer text-white">Merging</a>‎ 5 days after the end of the timed sale, merging
              will open.
            </li>
          </ol>
        </div>
        {/* MERGE */}
        <p className="text-white text-3xl pt-9">MERGE</p>
        <div className="bg-black border-2 border-gray-800 w-full p-5 mt-6">
          <p className="text-white text-2xl">Merging Black Holes </p>
          <p className="text-gray-600 text-base pt-3">
            When black holes approach each other, they will join orbits, emitting gravitational waves in the process. As
            they continue to orbit, they lose energy through the emission of these waves, causing them to spiral inward
            towards each other.
          </p>
          <p className="text-gray-600 text-base pt-3">
            Eventually, the black holes will merge, burning all but one - which will be leveled up. The remaining black
            hole will have a mass equal to the sum of the masses of the original black holes.
          </p>
          <p className="text-gray-600 text-base pt-3">
            There exists five types of Black Holes, each more massive and rare than the last. The exact number of Black
            Holes needed to merge together to level up depends on the total supply. For reasons not yet discovered, the
            universe only allows for the existence of 42 of the largest type, the Primordial black hole.
          </p>
          <Divider />
          <MergingAmountGraphic levels={levels} />
          <Divider />
          <div className="w-full flex justify-center">
            <img src={primordial} className="w-[80px]"></img>
          </div>
          <p className="text-gray-500 text-2xl text-center pt-3">Only 42 can exist...</p>
        </div>
      </div>
    </div>
  )
}
