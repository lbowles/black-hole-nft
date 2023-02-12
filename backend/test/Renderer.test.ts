import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { deployments, ethers } from "hardhat"
import { Renderer, Renderer__factory } from "../types"

function wrapInSVG(svg: string) {
  return `
  <svg width="500" height="500" xmlns="http://www.w3.org/2000/svg">  
  ${svg}
  </svg>
  `
}

describe("Renderer", function () {
  let signers: SignerWithAddress[]
  let renderer: Renderer
  let tokenId: number
  let blackHole: Renderer.KaleidoscopeStructOutput
  let colorPalette: Renderer.ColorPaletteStructOutput

  beforeEach(async function () {
    await ethers.provider.send("evm_setAutomine", [true])
    await deployments.fixture(["Renderer"])
    signers = await ethers.getSigners()
    const Renderer = await deployments.get("Renderer")
    renderer = Renderer__factory.connect(Renderer.address, signers[0])
    tokenId = Math.floor(1234)
    blackHole = await renderer.kaleidoscopeForTokenId(tokenId)
    colorPalette = await renderer.colorPaletteForKaleidescope(blackHole)
  })

  // it("Should render circles properly", async () => {
  //   console.log(blackHole)
  //   const circle = await renderer.circleAtIndexForKaleidescope(blackHole, colorPalette, 1)
  //   console.log(circle)
  //   const circleSVG = await renderer.getCircleSVG(circle)
  //   // Convert SVG to base64 data uri
  //   const svgDataUri = "data:image/svg+xml;base64," + Buffer.from(wrapInSVG(circleSVG)).toString("base64")
  //   console.log(svgDataUri)
  // })
})
