type IBlackHoleName = {
  name: string
  mass?: number
  marginTop: number
  last?: boolean
}

export const BlackHoleName = ({ name, mass, marginTop, last }: IBlackHoleName) => {
  return (
    <div style={{ marginTop: marginTop + "px" }}>
      <div className="flex">
        {last ? (
          <div className=" w-3 bg-black ml-[-8px] mr-5 ">
            <div className="w-3 h-3 bg-white"></div>
          </div>
        ) : (
          <div className="h-3 w-3 bg-white ml-[-8px] mr-5 "></div>
        )}
        <div className="mt-[-5px]">
          <p className="text-white ms:text-2xl leading-6  text-xl">{name}</p>
          {mass ? (
            <p className="text-gray-500 sm:text-lg text-base">
              {mass} solar {mass > 1 ? "masses" : "mass"}
            </p>
          ) : (
            <div className="h-[24px]"></div>
          )}
        </div>
      </div>
    </div>
  )
}
