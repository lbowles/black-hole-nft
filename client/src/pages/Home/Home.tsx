import { LinksTab } from "../../components/LinksTab/LinksTab"
import { BlackHoleIntro } from "../../components/home/BlackHoleIntro/BlackHoleIntro"
import { GeneralInfo } from "../../components/home/GeneralInfo/GeneralInfo"
import landingBackHole from "../../img/blackHoles/primordialAnimated.svg"
import { useNavigate } from "react-router-dom"
import { useBlackHolesGetMintState } from "../../generated"
import { useEffect } from "react"
import { MintState } from "../../interfaces/IMintState"

export const Home = () => {
  const navigate = useNavigate()

  const { data: mintState } = useBlackHolesGetMintState()

  useEffect(() => {
    console.log(mintState)
  }, [mintState])

  return (
    <>
      <div className="flex justify-center w-screen p-[70px] relative">
        {/* TODO: GET CENTERED BLACK HOLE */}
        <img className="w-[400px]" src={landingBackHole}></img>
        <LinksTab />
      </div>
      <div className="text-center w-screen">
        <p className="sm:text-5xl text-2xl text-white ">Lost in the Depths of the Void</p>
        <p className="sm:text-4xl text-xl text-gray-500 pt-1">Beyond the Event Horizon</p>
      </div>
      <div className="flex justify-center w-screen p-20">
        {/* TODO: Test this */}
        {mintState !== MintState.Closed ? (
          <button onClick={() => navigate("/mint")} className="primaryBtn">
            MINT NOW
          </button>
        ) : (
          // TODO: Link to secondary market or merge
          <button onClick={() => navigate("/mint")} className="primaryBtn" disabled={true}>
            MINT CLOSED
          </button>
        )}
        {/* TODO: Show minted IDs after mint, loading indicators, etc */}
      </div>
      <BlackHoleIntro />
      <GeneralInfo />
    </>
  )
}
