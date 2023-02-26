import { useState } from "react"
import useSound from "use-sound"
import generalClickEffect from "../../sounds/generalClick.mp3"

type PagesType = { name: string; active: boolean }[]
type ISmallNav = {
  navItems: PagesType
  setActiveNavBar(i: number): void
}

export const SmallNavbar = ({ navItems, setActiveNavBar }: ISmallNav) => {
  const [generalClickSound] = useSound(generalClickEffect)
  const [pages, setPages] = useState<PagesType>(navItems)

  const setActive = (i: number) => {
    setActiveNavBar(i)
  }

  return (
    <div className="grid grid-flow-col w-ful h-8">
      {pages.map((page, i) => {
        let style = ""
        if (page.active) {
          style = "bg-gray-900 text-white hover:bg-gray-800 "
        } else {
          style = "bg-black text-gray-600 hover:text-white"
        }
        return (
          <button
            key={i}
            onClick={() => {
              setActive(i)
              generalClickSound()
            }}
            className={
              "text-lg w-full h-full flex justify-center items-center transition duration-100 ease-in-out " + style
            }
          >
            {page.name}
          </button>
        )
      })}
    </div>
  )
}
