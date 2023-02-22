import useSound from "use-sound"
import linkClickEffect from "../../sounds/linkClick.mp3"
import { useState } from "react"

export const Footer = () => {
  const [linkClickSound] = useSound(linkClickEffect)

  return (
    <div className="w-full">
      <div>
        <div className="w-screen flex justify-center text-gray-700 text-base pt-20 pb-2">
          Made by&nbsp;
          <a
            className="hover:text-gray-500 underline"
            href="https://twitter.com/npm_luko"
            target="_blank"
            onClick={() => linkClickSound()}
          >
            @npm_luko
          </a>
          &nbsp;and&nbsp;
          <a
            className="hover:text-gray-500 underline"
            href="https://twitter.com/stephancill"
            target="_blank"
            onClick={() => linkClickSound()}
          >
            @stephancill
          </a>
        </div>
      </div>
      <p className="text-gray-800 px-5 w-full text-center pb-6 ">Music: Space Exploration by WinnieTheMoog</p>
    </div>
  )
}
