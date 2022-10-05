interface LabeledCheckboxProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export const LabeledCheckbox = ({ label, checked, onChange }: LabeledCheckboxProps) => (
  <label className="labeled-checkbox">
    <input
      type="checkbox"
      checked={checked}
      onChange={(event) => onChange(event.currentTarget.checked)}
    />
    <div>{label}</div>
  </label>
)
