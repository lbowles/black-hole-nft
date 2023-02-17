import logo from "./logo.svg"
import "./App.css"
import { Navbar } from "./components/Navbar/Navbar"
import { useState } from "react"

type pagesType = { name: string; link: string; active: boolean }[]
const defaultPages = [
  { name: "HOME", link: "/", active: true },
  { name: "MINT", link: "/mint", active: false },
  { name: "BURN", link: "/burn", active: false },
]

function App() {
  const [pages, setPages] = useState<pagesType>(defaultPages)

  return (
    <div className="flex justify-center w-screen">
      <Navbar pages={pages} />
    </div>
  )
}
export default App
