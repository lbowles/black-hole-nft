import blockSpinner from "../../img/blockSpinner.svg"
import useSound from "use-sound"
import generalClickEffect from "../../sounds/generalClick.mp3"

interface IActionButtonProps {
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  text: string
}

export const ActionButton = ({ text, loading, disabled, onClick }: IActionButtonProps) => {
  const [generalClickSound] = useSound(generalClickEffect)

  return (
    <button
      onClick={() => {
        onClick?.()
        generalClickSound()
      }}
      className="primaryBtn mx-2 min-w-[230px]"
      disabled={disabled || loading}
    >
      {loading ? (
        <div className="w-full flex justify-center h-full">
          <img className="h-full p-[12px]" src={blockSpinner}></img>
        </div>
      ) : (
        text
      )}
    </button>
  )
}
