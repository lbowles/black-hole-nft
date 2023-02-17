import landingBackHole from "../../img/landingBlackHole.svg"

export const Home = () => {
  return (
    <>
      <div className="flex justify-center w-screen p-20">
        <img className="w-[440px]" src={landingBackHole}></img>
      </div>
      <div className="text-center w-screen">
        <p className="sm:text-5xl text-3xl text-white ">Lost in the Depths of the Void</p>
        <p className="sm:text-4xl text-2xl text-gray-500">Beyond the Event Horizon</p>
      </div>
      <div className="flex justify-center w-screen p-20">
        <button className="primaryBtn">MINT NOW</button>
      </div>
    </>
  )
}
