import { useState } from "react"
import useSound from "use-sound"
import generalClickEffect from "../../sounds/generalClick.mp3"

export type PagesType = { name: string; visible: boolean; active: boolean }[]
type ISmallNav = {
  navItems: PagesType | undefined
  setActiveNavBar(i: number): void
}

export const SmallNavbar = ({ navItems, setActiveNavBar }: ISmallNav) => {
  const [generalClickSound] = useSound(generalClickEffect)

  const setActive = (i: number) => {
    setActiveNavBar(i)
  }

  return (
    <>
      {navItems !== undefined && (
        <div className="grid grid-flow-col w-ful h-8">
          {navItems.map((page, i) => {
            let style = ""
            if (page.active) {
              style = "bg-gray-900 text-white hover:bg-gray-800 "
            } else {
              style = "bg-black text-gray-600 hover:text-white"
            }
            if (page.visible) {
              return (
                <button
                  key={i}
                  onClick={() => {
                    setActive(i)
                    generalClickSound()
                  }}
                  className={
                    "text-lg w-full h-full flex justify-center items-center transition duration-100 ease-in-out " +
                    style
                  }
                >
                  {page.name}
                </button>
              )
            }
          })}
        </div>
      )}
    </>
  )
}
