import { BigNumber } from "ethers"
import { useVoidableBlackHolesSimulateMerge } from "../../generated"

interface ISimulateMergeProps {
  tokenIds: BigNumber[]
}

export function SimulateMerge({ tokenIds }: ISimulateMergeProps) {
  // renderer.PIXELS_PER_SIDE() / 2 - (10 - level)
  // tokenId: BigNumberish;
  // level: BigNumberish;
  // size: BigNumberish;
  // mass: BigNumberish;
  // adjustment: BigNumberish;
  // name: string;
  const { data: simulationData } = useVoidableBlackHolesSimulateMerge({
    args: [tokenIds],
    enabled: tokenIds.length > 1,
  })
  // const [simulatedNewToken, setSimulatedNewToken] = useState<{
  //   tokenId: BigNumber
  //   level: BigNumber
  //   size: BigNumber
  //   mass: BigNumber
  //   adjustment: BigNumber
  //   name: string
  // }>()

  // const { data: svg } = useRendererGetBlackHoleSvg({ args: [simulatedNewToken!], enabled: !!simulatedNewToken })

  // useEffect(() => {
  //   if (mass && adjustment && level && pixelsPerSide && name) {
  //     console.log(adjustment.toString())
  //     setSimulatedNewToken({
  //       tokenId: BigNumber.from(0),
  //       level: level,
  //       size: pixelsPerSide.div(2).sub(10).add(level),
  //       mass: mass,
  //       adjustment: adjustment,
  //       name: name,
  //     })
  //   }
  // }, [mass, adjustment, level, pixelsPerSide, name])

  return simulationData ? (
    <img src={`data:image/svg+xml;base64,${btoa(simulationData[1])}`} className="p-1"></img>
  ) : (
    <p className="text-white">Loading</p>
  )
}
