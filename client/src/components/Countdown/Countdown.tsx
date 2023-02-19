import { useEffect, useState } from "react"
import { useCountdown } from "../../hooks/countdown"
import countdownLine from "../../img/countdown/countdownLine.svg"

type ICoundown = {
  endTime: number
  // playGeneralClick: () => void
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

export const Countdown = ({ endTime }: ICoundown) => {
  const [targetTime, setTargetTime] = useState(endTime)
  const [days, hours, minutes, seconds] = useCountdown(targetTime)

  useEffect(() => {
    setTargetTime(endTime)
  }, [endTime])

  return (
    <>
      {targetTime && (
        <p className="text-white text-base text-center">{`${formatTimeString(days, hours, minutes, seconds)} left`}</p>
      )}
    </>
  )
}
