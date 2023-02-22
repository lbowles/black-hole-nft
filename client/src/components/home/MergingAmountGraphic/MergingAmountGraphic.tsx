import {
  useBlackHolesGetBaseUpgradeMass,
  useBlackHolesGetMintState,
  useBlackHolesTotalMinted,
  useBlackHolesUpgradeIntervals,
} from "../../../generated"
import { MintState } from "../../../interfaces/IMintState"

type IMergingAmountGraphic = {
  levels: { startName: string; endName: string; startImg: string; endImg: string; amount?: number | undefined }[]
}

export const MergingAmountGraphic = ({ levels }: IMergingAmountGraphic) => {
  const { data: totalMinted } = useBlackHolesTotalMinted()
  const { data: baseUpgradeMass } = useBlackHolesGetBaseUpgradeMass()
  const { data: mintState } = useBlackHolesGetMintState()
  return (
    <>
      {mintState === MintState.Closed && <p className="text-white">Total Minted: {totalMinted?.toString()}</p>}
      {levels.map((level, index) => {
        return (
          <div key={index} className="w-full justify-between items-center flex pb-2">
            {mintState === MintState.Closed && baseUpgradeMass ? (
              <p className="text-white text-5xl -mt-4">{index == 0 ? baseUpgradeMass.toString() : 2}</p>
            ) : (
              <p className="text-white text-5xl -mt-4">?</p>
            )}
            <p className="text-white text-5xl -mt-4">x</p>
            <div className="max-w-[80px]">
              <img src={level.startImg}></img>
              <p className="text-gray-600 text-base text-center">{level.startName}</p>
            </div>
            <p className="text-white text-5xl -mt-4">=</p>
            <div className="max-w-[80px]">
              <img src={level.endImg}></img>
              <p className="text-gray-600 text-base text-center">{level.endName}</p>
            </div>
          </div>
        )
      })}
    </>
  )
}
