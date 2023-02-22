import landingBackHole from "../../img/blackHoles/microAnimated.svg"
import { LinksTab } from "../LinksTab/LinksTab"
import { ActionButton } from "../ActionButton/ActionButton"

interface IEnterScreen {
  onEnter: () => void
}

export const EnterScreen = ({ onEnter }: IEnterScreen) => {
  return (
    <div className="h-[80vh] flex items-center">
      <div>
        <p className="sm:text-5xl text-xl text-white w-full text-center pt-[70px]">BLACK HOLES</p>
        <div className="flex justify-center w-screen  relative">
          <img className="w-[280px]" src={landingBackHole}></img>

          <LinksTab />
        </div>
        <div className="text-center w-screen">
          <ActionButton
            text="DIVE IN"
            onClick={() => {
              onEnter()
            }}
          ></ActionButton>
        </div>
      </div>
    </div>
  )
}
