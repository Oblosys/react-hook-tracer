import { useRef } from 'react'

import {
  ShowProps,
  useCallback,
  useEffect,
  useState,
  useTracer,
} from '../packages/react-hook-tracer/src'
import { SimpleButton } from './SimpleButton'

import './Demo.css'

export const Demo = () => (
  <div className="demo">
    <UserList />
  </div>
)

interface User {
  name: string
}

const showUsers = (users: User[]) => `Users [${users.map(({ name }) => name).join(', ')}]`

const demoUsers = [{ name: 'Ren' }, { name: 'Stimpy' }]

const UserList = () => {
  const { trace, HookPanel } = useTracer()
  const [users, setUsers] = useState<User[]>([], showUsers) // custom showState
  const [isFetching, setIsFetching] = useState(false)

  useEffect(() => {
    trace('Simulated fetch')
    setIsFetching(true)
    setTimeout(() => {
      setIsFetching(false)
      setUsers(demoUsers)
    }, 2000)
  }, [trace])

  const newUserIdRef = useRef(1)

  const addUser = () => {
    setUsers((users) => [...users, { name: 'New-' + newUserIdRef.current }])
    newUserIdRef.current += 1
  }

  const deleteUsers = () => setUsers([])

  const deleteUser = useCallback((name: string) => {
    setUsers((users) => users.filter((user) => user.name !== name))
  }, [])

  return (
    <div className="user-list">
      <HookPanel />
      <div className="user-list-details">
        <b>User list (#users: {users.length}):</b>
        <div className="spacer"></div>
        <SimpleButton onClick={() => addUser()} isDisabled={isFetching} value="add user" />
        <SimpleButton
          onClick={() => deleteUsers()}
          isDisabled={users.length === 0}
          value="delete users"
        />
      </div>
      <div className="users">
        {isFetching && users.length === 0 ? (
          <div className="placeholder">Fetching users..</div>
        ) : (
          users.map(({ name }) => <User key={name} name={name} deleteUser={deleteUser} />)
        )}
      </div>
    </div>
  )
}

interface UserProps {
  name: string
  deleteUser: (name: string) => void
}
const User = ({ name, deleteUser }: UserProps) => {
  const { HookPanel } = useTracer({ showProps }) // use showProps for another prop?
  const [clickCount, setClickCount] = useState(0)
  return (
    <div className="user">
      <HookPanel />
      <div className="user-details">
        {name} (clicks: {clickCount}) <div className="spacer"></div>
        <SimpleButton onClick={() => setClickCount((n) => n + 1)} value="click" />
        <SimpleButton onClick={() => deleteUser(name)} value="delete" />
      </div>
    </div>
  )
}

const showProps: ShowProps<UserProps> = {
  // user: (user) => JSON.stringify(user),
}
