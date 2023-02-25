import { useBlackHolesTotalMinted, useVoidableBlackHolesGetUpgradeIntervals } from "../../../generated"

type IMergingAmountGraphic = {
  levels: { startName: string; endName: string; startImg: string; endImg: string; amount?: number | undefined }[]
}

export const MergingAmountGraphic = ({ levels }: IMergingAmountGraphic) => {
  const { data: totalMinted } = useBlackHolesTotalMinted()
  const { data: upgradeIntervals } = useVoidableBlackHolesGetUpgradeIntervals()
  return (
    <>
      <p className="text-white text-2xl">AS IT STANDS: {totalMinted?.toNumber().toLocaleString()} MINTED</p>
      <p className="text-gray-600 text-xl">{new Date().toLocaleString()}</p>
      {/* {<p className="text-white text-xl mt-4">{totalMinted?.toNumber().toLocaleString()} MINTED</p>} */}
      {levels.map((level, levelNumber) => {
        console.log(level)

        let microsForLevel = ""
        let prevForLevel = ""
        if (upgradeIntervals) {
          if (levelNumber === 0) {
            microsForLevel = upgradeIntervals[levelNumber].toString()
            prevForLevel = microsForLevel
          } else {
            microsForLevel = (upgradeIntervals[levelNumber].toNumber() / upgradeIntervals[0].toNumber()).toFixed(0)
            prevForLevel = (
              upgradeIntervals[levelNumber].toNumber() / upgradeIntervals[levelNumber - 1].toNumber()
            ).toFixed(0)
          }
        }
        return (
          <div key={levelNumber} className="w-full justify-between items-center flex pb-2">
            {upgradeIntervals ? (
              <p className="text-white text-5xl -mt-4 text-right w-1/4">{prevForLevel}</p>
            ) : (
              <p className="text-white text-5xl -mt-4 text-right w-1/4">?</p>
            )}
            <p className="text-white text-5xl -mt-4 text-right w-1/4">x</p>
            <div className="max-w-[80px]">
              <img src={level.startImg}></img>
              <p className="text-gray-600 text-base text-center">
                {level.startName}
                {level.endName !== "STELLAR" && (
                  <>
                    <br></br>‎
                  </>
                )}
              </p>
            </div>
            <div className="flex items-center justify-center w-1/4">
              <p className="text-white text-5xl -mt-4">=</p>
            </div>
            <div className="max-w-[80px]">
              <img src={level.endImg}></img>
              <p className="text-gray-600 text-base text-center">
                {level.endName}{" "}
                {level.endName !== "STELLAR" && (
                  <>
                    <br></br>
                    <div className="text-[#6A6969]">{microsForLevel} MICROs</div>
                  </>
                )}
              </p>
            </div>
          </div>
        )
      })}
    </>
  )
}
