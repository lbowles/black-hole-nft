import useSound from "use-sound"
import linkClickEffect from "../../sounds/linkClick.mp3"
import { useState } from "react"

export const Footer = () => {
  const [linkClickSound] = useSound(linkClickEffect)

  return (
    <div className="w-screen flex justify-center text-gray-700 text-base pt-20 pb-10 ">
      Made by ‎
      <a
        className="hover:text-gray-500 underline"
        href="https://twitter.com/npm_luko"
        target="_blank"
        onClick={() => linkClickSound()}
      >
        @npm_luko
      </a>
      ‎ and ‎
      <a
        className="hover:text-gray-500 underline"
        href="https://twitter.com/stephancill"
        target="_blank"
        onClick={() => linkClickSound()}
      >
        @stephancill
      </a>
    </div>
  )
}
