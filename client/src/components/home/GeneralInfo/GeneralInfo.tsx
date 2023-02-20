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
            Solar Systems is a fully on-chain NFT collection which features procedurally generated planets orbiting
            around a star. Each Solar System is{" "}
          </p>
          <Divider />
          <p className="text-white text-2xl">Features</p>
          <p className="text-gray-600 text-base pt-3 pb-2">Each Kaleidescope is</p>
          <ol className="list-disc text-gray-600 text-base ml-5">
            <li>Now this is a story all about how, my life got flipped-turned upside down</li>
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
