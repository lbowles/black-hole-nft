import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { ConnectButton } from "@rainbow-me/rainbowkit"

type pagesType = { name: string; link: string; active: boolean }[]

const defaultPages = [
  { name: "HOME", link: "/", active: true },
  { name: "MINT", link: "/mint", active: false },
  { name: "BURN", link: "/burn", active: false },
]

export const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [pages, setPages] = useState<pagesType>(defaultPages)

  const setActive = (i: number) => {
    const updatedPages = pages.map((p, index) => {
      if (index === i) {
        return { ...p, active: true }
      } else {
        return { ...p, active: false }
      }
    })
    setPages(updatedPages)
  }

  useEffect(() => {
    // Set the active page based on the current URL path
    const path = location.pathname
    const updatedPages = pages.map((p) => ({
      ...p,
      active: p.link === path,
    }))
    if (!updatedPages.some((p) => p.active)) {
      // Set HOME page as active if no other page is active
      updatedPages[0].active = true
    }
    setPages(updatedPages)
  }, [location.pathname, pages])

  let nav = (
    <div className="grid grid-cols-3 bg-black h-10 w-full ">
      {pages.map((page, i) => {
        let style = ""
        if (page.active) {
          style = "bg-gray-900 text-white hover:bg-gray-800 "
        } else {
          style = "bg-black text-gray-600 hover:text-white"
        }
        return (
          <button
            onClick={() => {
              navigate(page.link)
              setActive(i)
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

  return (
    <div>
      <div className="flex justify-between w-screen p-5 ">
        <div>
          <p className="text-white text-2xl min-w-[117px]">BLACK HOLES</p>
        </div>
        <div className="sm:block hidden w-80">{nav}</div>
        <div>
          <ConnectButton />
        </div>
      </div>
      <div className="sm:hidden block px-5">{nav}</div>
    </div>
  )
}
