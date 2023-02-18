type IDivider = {
  color?: string
}
export const Divider = ({ color }: IDivider) => {
  return (
    <>
      {!color ? (
        <div className="w-full h-[2px] bg-gray-800 my-6"></div>
      ) : (
        <div className={"w-full h-1 bg-" + color}></div>
      )}
    </>
  )
}
