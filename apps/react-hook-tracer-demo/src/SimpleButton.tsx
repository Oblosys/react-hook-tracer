import './SimpleButton.css'

interface SimpleButtonProps {
  value: string
  onClick: () => void
  isDisabled?: boolean
}

export const SimpleButton = ({ value, onClick, isDisabled }: SimpleButtonProps) => (
  <span
    className="simple-button"
    data-is-disabled={isDisabled ?? false}
    onClick={isDisabled ? undefined : onClick}
  >
    {value}
  </span>
)
