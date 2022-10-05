interface SimpleButtonProps {
  value: string
  onClick: () => void
}

export const SimpleButton = ({ value, onClick }: SimpleButtonProps) => (
  <span className="simple-button" onClick={onClick}>
    {value}
  </span>
)
