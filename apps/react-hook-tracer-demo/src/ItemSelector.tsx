import { ChangeEventHandler } from 'react'

interface ItemSelectorProps {
  labeledItems: { label: string }[]
  selectedIndex: number
  onSelect: (index: number) => void
}

export const ItemSelector = ({ labeledItems, selectedIndex, onSelect }: ItemSelectorProps) => {
  const onChange: ChangeEventHandler<HTMLSelectElement> = (event) =>
    onSelect(event.currentTarget.selectedIndex)

  return (
    <select value={selectedIndex} onChange={onChange}>
      {labeledItems.map(({ label }, index) => (
        <option value={index} key={index}>
          {label}
        </option>
      ))}
    </select>
  )
}
