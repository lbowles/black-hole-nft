import { BigNumber } from "ethers"
import { useEffect, useState } from "react"
import { BlackHoleStruct } from "../../../../backend/types/Renderer"
import {
  useBlackHolesGetAdjustmentForMass,
  useBlackHolesLevelForMass,
  useBlackHolesNameForBlackHoleLevel,
  useRendererGetBlackHoleSvg,
  useRendererPixelsPerSide,
} from "../../generated"
import { BlackHoleMetadata } from "../../utils/getTokensByOwner"

interface ISimulateMergeProps {
  mass: BigNumber
}

export function SimulateMerge({ mass }: ISimulateMergeProps) {
  // renderer.PIXELS_PER_SIDE() / 2 - (10 - level)
  // tokenId: BigNumberish;
  // level: BigNumberish;
  // size: BigNumberish;
  // mass: BigNumberish;
  // adjustment: BigNumberish;
  // name: string;
  const { data: adjustment } = useBlackHolesGetAdjustmentForMass({ args: [mass] })
  const { data: pixelsPerSide } = useRendererPixelsPerSide()
  const { data: level } = useBlackHolesLevelForMass({ args: [mass], enabled: !!mass })
  const { data: name } = useBlackHolesNameForBlackHoleLevel({ args: [level!], enabled: !!level })

  const [simulatedNewToken, setSimulatedNewToken] = useState<{
    tokenId: BigNumber
    level: BigNumber
    size: BigNumber
    mass: BigNumber
    adjustment: BigNumber
    name: string
  }>()

  const { data: svg } = useRendererGetBlackHoleSvg({ args: [simulatedNewToken!], enabled: !!simulatedNewToken })

  useEffect(() => {
    if (mass && adjustment && level && pixelsPerSide && name) {
      console.log(adjustment.toString())
      setSimulatedNewToken({
        tokenId: BigNumber.from(0),
        level: level,
        size: pixelsPerSide.div(2).sub(10).add(level),
        mass: mass,
        adjustment: adjustment,
        name: name,
      })
    }
  }, [mass, adjustment, level, pixelsPerSide, name])

  return svg ? <img src={`data:image/svg+xml;base64,${btoa(svg)}`} className="p-1"></img> : <p>Loading</p>
}
