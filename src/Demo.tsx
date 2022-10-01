import { Counter } from './Counter'
import { useEffect, useState, useTracer } from './react-hook-tracer/hookTracer'

export const Demo = (): JSX.Element => {
  useTracer()
  const [name, setName] = useState<'Inky' | 'Clyde'>('Inky')
  const [isVisible, setIsVisible] = useState(true)

  const toggleName = () => setName(name === 'Inky' ? 'Clyde' : 'Inky')
  const toggleVisible = () => setIsVisible((b) => !b)

  useEffect(() => {
    console.log('running effect')
    return () => {
      console.log('cleaning up')
    }
  }, [])

  return (
    <div>
      <p>State: {name}</p>
      <input type="button" value="Toggle name" onClick={toggleName} />
      <input type="button" value="Show/hide counter" onClick={toggleVisible} />
      {isVisible && <Counter p={name} />}
      <Counter p={'second counter'} />
    </div>
  )
}
