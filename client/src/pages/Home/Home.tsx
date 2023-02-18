import { BlackHoleIntro } from "../../components/home/BlackHoleIntro/BlackHoleIntro"
import { GeneralInfo } from "../../components/home/GeneralInfo/GeneralInfo"
import landingBackHole from "../../img/landingBlackHoleAnimation.svg"
import opensea from "../../img/icons/opensea.svg"
import twitter from "../../img/icons/twitter.svg"
import gihub from "../../img/icons/github.svg"

export const Home = () => {
  return (
    <>
      <div className="flex justify-center w-screen p-[70px] relative">
        <img className="w-[400px]" src={landingBackHole}></img>
        <div className="bg-black border-y-2 border-r-2 border-gray-800 p-[15px] w-14 grid grid-flow-row absolute top-1/2 left-0 transform -translate-y-1/2 gap-3">
          <a target="_blank" href="https://www.twitter.com">
            <img src={opensea}></img>
          </a>
          <a target="_blank" href="https://www.github.com">
            <img src={twitter}></img>
          </a>
          <a target="_blank" href="https://www.opensea.com">
            <img src={gihub}></img>
          </a>
        </div>
      </div>
      <div className="text-center w-screen">
        <p className="sm:text-5xl text-2xl text-white ">Lost in the Depths of the Void</p>
        <p className="sm:text-4xl text-xl text-gray-500 pt-1">Beyond the Event Horizon</p>
      </div>
      <div className="flex justify-center w-screen p-20">
        <button className="primaryBtn">MINT NOW</button>
      </div>
      <BlackHoleIntro />
      <GeneralInfo />
    </>
  )
}
