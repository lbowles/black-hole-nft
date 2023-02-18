import { Divider } from "../../Divider/Divider"

export const GeneralInfo = () => {
  return (
    <div className="flex justify-center w-screen mt-20 p-5">
      <div className="w-full sm:w-80 ">
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
      </div>
    </div>
  )
}
