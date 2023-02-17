type INavbar = {
  pages: { name: string; link: string; active: boolean }[]
}
export const Navbar = ({ pages }: INavbar) => {
  return (
    <div className="flex justify-between w-full p-5">
      <div>
        <p className="text-white text-2xl">BLACK HOLES</p>
      </div>
      <div className="grid grid-cols-3 bg-black h-10 w-80">
        {pages.map((page, i) => {
          let style = ""
          if (page.active) {
            style = "bg-gray-900 text-white hover:bg-gray-800 "
          } else {
            style = "bg-black text-gray-600 hover:text-white"
          }
          return (
            <button
              className={
                "text-xl w-full h-full flex justify-center items-center transition duration-100 ease-in-out " + style
              }
            >
              HOME
            </button>
          )
        })}
      </div>
    </div>
  )
}
