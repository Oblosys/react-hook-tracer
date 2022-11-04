/* eslint-disable @typescript-eslint/no-use-before-define */
import { ChangeEvent } from 'react'
import { useReducer, useTracer } from 'react-hook-tracer'

import './Reducer.css'

export const Demo = () => <Form />

// useReducer sample from https://beta.reactjs.org/apis/react/useReducer

interface State {
  name: string
  age: number
}

const initialState: State = { name: 'Taylor', age: 42 }

const showState = ({ name, age }: State) => `'${name}(${age})'`

type Action =
  | { type: 'incremented_age' }
  | {
      type: 'changed_name'
      nextName: string
    }

const showAction = (action: Action) =>
  action.type === 'incremented_age' ? 'age++' : `name:='${action.nextName}'`

function reducer(state: State, action: Action) {
  const actionType = action.type
  switch (actionType) {
    case 'incremented_age': {
      return {
        name: state.name,
        age: state.age + 1,
      }
    }
    case 'changed_name': {
      return {
        name: action.nextName,
        age: state.age,
      }
    }
  }
  throw Error('Unknown action: ' + actionType)
}

function Form() {
  const { TracePanel } = useTracer()
  const [state, dispatch] = useReducer(reducer, initialState, undefined, { showState, showAction })

  function handleButtonClick() {
    dispatch({ type: 'incremented_age' })
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    dispatch({
      type: 'changed_name',
      nextName: e.target.value,
    })
  }

  return (
    <div className="reducer-form">
      <span>
        Name: <input value={state.name} onChange={handleInputChange} />
        <button onClick={handleButtonClick}>Increment age</button>
      </span>{' '}
      <p>
        Hello, {state.name}. You are {state.age}.
      </p>
      <TracePanel />
    </div>
  )
}
