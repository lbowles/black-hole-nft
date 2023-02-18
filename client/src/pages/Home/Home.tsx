import landingBackHole from "../../img/landingBlackHole.svg"
import micro from "../../img/blackHoles/micro.svg"
import stellar from "../../img/blackHoles/stellar.svg"
import intermediate from "../../img/blackHoles/intermediate.svg"
import supermassive from "../../img/blackHoles/supermassive.svg"
import primordial from "../../img/blackHoles/primordial.svg"
import { BlackHoleName } from "../../components/home/BlackHoleName/BlackHoleName"

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
      <div className="flex justify-center w-screen mt-20">
        <div className="grid grid-cols-2 sm:grid-cols-3 px-5">
          <div className="hidden sm:block"></div>
          <div className="max-x-[240px] ">
            <div className="h-[240px] flex justify-center">
              <img src={micro}></img>
            </div>
            <div className="h-[240px] flex justify-center">
              <img src={stellar}></img>
            </div>
            <div className="h-[240px] flex justify-center mt-8">
              <img src={intermediate}></img>
            </div>
            <div className="h-[240px] flex justify-center mt-12">
              <img src={supermassive}></img>
            </div>
            <div className="h-[240px] flex justify-center mt-[60px]">
              <img src={primordial}></img>
            </div>
          </div>
          <div className="display flex mt-[115px] mb-[120px] justify-end">
            <div className=" w-1 bg-white "></div>
            <div className="h-full ">
              <BlackHoleName name="MICRO" marginTop={0} />
              <BlackHoleName name="STELLAR" marginTop={198} />
              <BlackHoleName name="INTERMEDIATE" marginTop={231} />
              <BlackHoleName name="SUPERMASSIVE" marginTop={245} />
              <BlackHoleName name="PRIMORDIAL" marginTop={263} last />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
