import { useEffect, useState } from "react"
import allowlistHelpBtn from "../../img/allowlistHelpBtn.svg"
import countdownLine from "../../img/countdownLine.svg"
import { useCountdown } from "../../hooks/countdown"

type ICoundown = {
  allowlistTimeEstimate: number
  publicTimeEstimate: number
  hasAllowlistStarted: boolean
  hasPublicStarted: boolean
  playGeneralClick: () => void
}

function formatTimeString(days: number, hours: number, minutes: number, seconds: number) {
  days = Math.max(0, days)
  hours = Math.max(0, hours)
  minutes = Math.max(0, minutes)
  seconds = Math.max(0, seconds)

  const textDays = `${days.toString().padStart(2, "0")} day${days != 1 ? "s" : ""},`
  const textHours = ` ${hours.toString().padStart(2, "0")} hour${hours != 1 ? "s" : ""},`
  const textMinutes = ` ${minutes.toString().padStart(2, "0")} minute${minutes != 1 ? "s" : ""},`
  const textSeconds = ` ${seconds.toString().padStart(2, "0")} second${seconds != 1 ? "s" : ""}`
  let value = ""
  if (days > 0) {
    value = textDays
  }
  if (hours > 0) {
    value = value + textHours
  }
  if (minutes > 0) {
    value = value + textMinutes
  }
  return value + textSeconds
}

export const Countdown = ({
  allowlistTimeEstimate,
  publicTimeEstimate,
  hasAllowlistStarted,
  hasPublicStarted,
  playGeneralClick,
}: ICoundown) => {
  const [targetTime, setTargetTime] = useState(new Date().getTime())

  const [days, hours, minutes, seconds] = useCountdown(targetTime)

  const [percentBar, setPercentBar] = useState(0)
  const [currentTime, setCurrentTime] = useState(new Date().getTime())

  useEffect(() => {
    let current = new Date().getTime()
    setCurrentTime(current)

    let betweenAllowPublic = Math.abs(publicTimeEstimate - allowlistTimeEstimate)
    let betweenAllowCurrent = Math.abs(current - allowlistTimeEstimate)

    let percentBar = (betweenAllowCurrent / betweenAllowPublic) * 100
    if (percentBar >= 100) {
      percentBar = 100
    }
    setPercentBar(Math.round(percentBar))
  }, [seconds])

  useEffect(() => {
    if (hasAllowlistStarted) {
      setTargetTime(publicTimeEstimate)
    } else {
      setTargetTime(allowlistTimeEstimate)
    }
  }, [publicTimeEstimate, allowlistTimeEstimate, hasAllowlistStarted, hasPublicStarted])

  return (
    <div className="flex justify-center text-center mt-[90px]  z-1 pl-10 pr-10 z-10  ">
      <div className="w-[500px]">
        {hasAllowlistStarted ? (
          <>
            <p className="text-gray-100 text-center text-sm">{`${formatTimeString(
              days,
              hours,
              minutes,
              seconds,
            )} left`}</p>
            <div className="flex justify-center">
              <div className="w-[290px]">
                <div className="flex">
                  <img src={countdownLine} alt="countdownLine" className="py-2"></img>
                </div>
                <div className="flex ml-[43px] absolute top-[819px]">
                  <div className="w-[204px]">
                    <div className="bg-white h-[2px]" style={{ width: percentBar + "%" }}></div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="w-[226px] bg-none mr-[33px] -mt-[18px] pr-[10px]">
                    <div
                      className={`bg-white h-[10px] w-[10px] rounded-lg`}
                      style={{ marginLeft: percentBar + "%" }}
                    ></div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="w-[226px] bg-none mr-[33px] -mt-[18px] pr-[10px]">
                    <div className={`bg-white h-[10px] w-[10px] rounded-lg ml-[0]`}></div>
                  </div>
                </div>
                <div className="text-gray-100  text-sm flex justify-between">
                  <span>Allowlist mint </span>{" "}
                  <a
                    className="pt-1 -ml-[100px]"
                    onClick={() => {
                      playGeneralClick()
                    }}
                    href="#allowlist-anchor"
                  >
                    <img src={allowlistHelpBtn} className="w-[13px]"></img>
                  </a>
                  <span>Public mint</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          !hasPublicStarted && (
            <>
              <p className="text-gray-100 text-center text-sm">
                {`Starts in ${formatTimeString(days, hours, minutes, seconds)}`}
              </p>
              <div className="flex justify-center">
                <div className="w-[290px]">
                  <div className="flex">
                    <img src={countdownLine} alt="countdownLine" className="py-2"></img>
                  </div>
                  <div className="text-gray-100  text-sm flex justify-between">
                    <span>Allowlist mint </span>{" "}
                    <a
                      className="pt-1 -ml-[100px]"
                      onClick={() => {
                        playGeneralClick()
                      }}
                      href="#allowlist-anchor"
                    >
                      <img src={allowlistHelpBtn} className="w-[13px]"></img>
                    </a>
                    <span>Public mint</span>
                  </div>
                </div>
              </div>
            </>
          )
        )}
      </div>
    </div>
  )
}
