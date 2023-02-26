import { BigNumber } from "ethers"
import { useBlackHolesV2BlackHoleForMass, useVoidableBlackHolesSimulateMerge } from "../../generated"
import blockSpinner from "../../img/blockSpinner.svg"

interface ISimulateMergeProps {
  totalMass: BigNumber
}

export function SimulateMerge({ totalMass }: ISimulateMergeProps) {
  const { data: simulationData } = useBlackHolesV2BlackHoleForMass({
    args: [BigNumber.from(1), totalMass],
    enabled: totalMass.gt(1),
  })

  return simulationData ? (
    <img src={`data:image/svg+xml;base64,${btoa(simulationData[1])}`} className="p-1"></img>
  ) : (
    <div className="h-full w-full flex justify-center items-center min-h-[236px]">
      <div>
        <div className="flex w-full justify-center">
          <img className="h-[20px] " src={blockSpinner}></img>
        </div>
        <p className="text-white text-center w-full text-xl pt-2">Loading</p>
      </div>
    </div>
  )
}
