import opensea from "../../img/icons/opensea.svg"
import twitter from "../../img/icons/twitter.svg"
import gihub from "../../img/icons/github.svg"

export const LinksTab = () => {
  return (
    <div className="bg-black border-y-2 border-r-2 border-gray-800 p-[15px] w-14 grid grid-flow-row absolute top-1/2 left-0 transform -translate-y-1/2 gap-3">
      <a target="_blank" href="https://www.twitter.com">
        <img src={opensea}></img>
      </a>
      <a target="_blank" href="https://www.github.com">
        <img src={twitter}></img>
      </a>
      <a target="_blank" href="https://www.opensea.com">
        <img src={gihub}></img>
      </a>
    </div>
  )
}