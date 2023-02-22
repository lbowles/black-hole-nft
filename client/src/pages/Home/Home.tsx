import { LinksTab } from "../../components/LinksTab/LinksTab"
import { BlackHoleIntro } from "../../components/home/BlackHoleIntro/BlackHoleIntro"
import { GeneralInfo } from "../../components/home/GeneralInfo/GeneralInfo"
import landingBackHole from "../../img/blackHoles/primordialAnimated.svg"
import { useNavigate } from "react-router-dom"
import { useBlackHolesGetMintState } from "../../generated"
import { useEffect } from "react"
import { MintState } from "../../interfaces/IMintState"
import useSound from "use-sound"
import generalClickEffect from "../../sounds/generalClick.mp3"

export const Home = () => {
  const navigate = useNavigate()
  const [generalClickSound] = useSound(generalClickEffect)

  const { data: mintState } = useBlackHolesGetMintState()

  return (
    <>
      <div className="flex justify-center w-screen p-[70px] relative">
        <img className="w-[400px]" src={landingBackHole}></img>
        <LinksTab />
      </div>
      <div className="text-center w-screen">
        <p className="sm:text-5xl text-2xl text-white ">BLACK HOLES</p>
        <p className="sm:text-4xl text-xl text-gray-500 pt-1">Dive into the depths of the void</p>
      </div>
      <div className="flex justify-center w-screen p-20">
        {/* TODO: Test this */}
        {mintState !== MintState.Closed ? (
          <button
            onClick={() => {
              navigate("/mint")
              generalClickSound()
            }}
            className="primaryBtn"
          >
            MINT NOW
          </button>
        ) : (
          // TODO: Link to secondary market or merge
          <button
            onClick={() => {
              generalClickSound()
            }}
            className="primaryBtn"
            disabled={true}
          >
            MINT CLOSED
          </button>
        )}
      </div>
      <BlackHoleIntro />
      <GeneralInfo />
    </>
  )
}
