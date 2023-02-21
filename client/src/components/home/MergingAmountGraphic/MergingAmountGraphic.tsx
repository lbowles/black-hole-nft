type IMergingAmountGraphic = {
  levels: { startName: string; endName: string; startImg: string; endImg: string; amount?: number | undefined }[]
}

export const MergingAmountGraphic = ({ levels }: IMergingAmountGraphic) => {
  return (
    <>
      {levels.map((level, index) => {
        return (
          <div key={index} className="w-full justify-between items-center flex pb-2">
            {level.amount ? (
              <p className="text-white text-5xl -mt-4">{level.amount}</p>
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
