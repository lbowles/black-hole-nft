import { LinksTab } from "../../components/LinksTab/LinksTab"
import { BlackHoleIntro } from "../../components/home/BlackHoleIntro/BlackHoleIntro"
import { GeneralInfo } from "../../components/home/GeneralInfo/GeneralInfo"
import landingBackHole from "../../img/landingBlackHoleAnimation.svg"

export const Home = () => {
  return (
    <>
      <div className="flex justify-center w-screen p-[70px] relative">
        {/* GET CENTERED BLACK HOLE */}
        <img className="w-[400px]" src={landingBackHole}></img>
        <LinksTab />
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
