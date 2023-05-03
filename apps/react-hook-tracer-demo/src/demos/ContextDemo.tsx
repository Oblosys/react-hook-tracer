/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { ChangeEventHandler } from 'react'
import { useContext, useTracer } from 'react-hook-tracer'

import './ContextDemo.css'

const themes = ['dark', 'light'] as const

type Theme = (typeof themes)[number]

const themeNames: Record<Theme, string> = { dark: 'Dark', light: 'Light' }

const ThemeContext = React.createContext<Theme>('dark')

const CounterContext = React.createContext(0)

export const Demo = () => {
  const [theme, setTheme] = React.useState<Theme>('dark')
  const [counter, setCounter] = React.useState(0)

  return (
    <div className="context-demo">
      <div className="context-selection">
        <ThemeSelector theme={theme} setTheme={setTheme} />
        <div className="context-counter">
          <input type="button" value="Increase" onClick={() => setCounter((prev) => prev + 1)} />
          Counter context: {counter}
        </div>
      </div>

      <ThemeContext.Provider value={theme}>
        <CounterContext.Provider value={counter}>
          <ThemedWrapper />
        </CounterContext.Provider>
      </ThemeContext.Provider>
    </div>
  )
}

const ThemedWrapper = () => {
  const { TracePanel } = useTracer()
  const theme = useContext(ThemeContext, {
    label: 'theme',
    show: (thm) => `"${thm === 'light' ? '☀️' : '🌙'}"`,
  })
  return (
    <div className="themed-wrapper" data-theme={theme}>
      <TracePanel />
      <InnerComponent />
    </div>
  )
}

export const InnerComponent = () => {
  const { TracePanel } = useTracer()

  const counter = useContext(CounterContext, { label: 'counter' })

  return (
    <div className="inner-component">
      <b>Counter value from context: {counter}</b>
      <TracePanel />
    </div>
  )
}

interface ThemeSelectorProps {
  theme: Theme
  setTheme: (theme: Theme) => void
}
const ThemeSelector = ({ theme: selectedTheme, setTheme }: ThemeSelectorProps) => {
  const onChangeTheme: (theme: Theme) => ChangeEventHandler<HTMLInputElement> =
    (theme: Theme) => () =>
      setTheme(theme)

  return (
    <div className="theme-selector">
      Theme:
      {themes.map((thm, index) => (
        <label key={index}>
          <input
            type="radio"
            value={thm}
            name={thm}
            checked={selectedTheme === thm}
            onChange={onChangeTheme(thm)}
          />
          {themeNames[thm]}
        </label>
      ))}
    </div>
  )
}
