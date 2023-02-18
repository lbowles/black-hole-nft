import { BlackHoleName } from "../BlackHoleName/BlackHoleName"
import micro from "../../../img/blackHoles/micro.svg"
import stellar from "../../../img/blackHoles/stellar.svg"
import intermediate from "../../../img/blackHoles/intermediate.svg"
import supermassive from "../../../img/blackHoles/supermassive.svg"
import primordial from "../../../img/blackHoles/primordial.svg"

export const BlackHoleIntro = () => {
  return (
    <div className="flex justify-center w-screen mt-20">
      <div className="grid grid-cols-2 sm:grid-cols-3 px-5">
        <div className="hidden sm:block"></div>
        <div className="max-x-[240px] ">
          <div className="sm:h-[240px] h-[180px] flex justify-center">
            <img src={micro}></img>
          </div>
          <div className="sm:h-[240px] h-[180px] flex justify-center">
            <img src={stellar}></img>
          </div>
          <div className="sm:h-[240px] h-[180px] flex justify-center mt-8">
            <img src={intermediate}></img>
          </div>
          <div className="sm:h-[240px] h-[180px] flex justify-center mt-12">
            <img src={supermassive}></img>
          </div>
          <div className="sm:h-[240px] h-[180px] flex justify-center mt-[60px]">
            <img src={primordial}></img>
          </div>
        </div>
        <div className="display flex sm:mt-[115px] mt-[90px] sm:mb-[120px] mb-[90px] justify-end">
          <div className=" w-1 bg-white "></div>
          <div className="h-full sm:block hidden">
            <BlackHoleName name="MICRO" marginTop={0} />
            <BlackHoleName name="STELLAR" marginTop={198} />
            <BlackHoleName name="INTERMEDIATE" marginTop={231} />
            <BlackHoleName name="SUPERMASSIVE" marginTop={245} />
            <BlackHoleName name="PRIMORDIAL" marginTop={263} last />
          </div>
          <div className="h-full sm:hidden block">
            <BlackHoleName name="MICRO" marginTop={0} />
            <BlackHoleName name="STELLAR" marginTop={134} />
            <BlackHoleName name="INTERMEDIATE" marginTop={168} />
            <BlackHoleName name="SUPERMASSIVE" marginTop={185} />
            <BlackHoleName name="PRIMORDIAL" marginTop={198} last />
          </div>
        </div>
      </div>
    </div>
  )
}
