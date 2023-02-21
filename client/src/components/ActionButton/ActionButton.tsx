import blockSpinner from "../../img/blockSpinner.svg"

interface IActionButtonProps {
  onClick: () => void
  disabled: boolean
  loading: boolean
  text: string
}

export const ActionButton = ({ text, loading, disabled, onClick }: IActionButtonProps) => {
  return (
    <button onClick={onClick} className="primaryBtn mx-2 min-w-[230px]" disabled={disabled || loading}>
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
