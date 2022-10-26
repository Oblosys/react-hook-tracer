/* eslint-disable @typescript-eslint/no-use-before-define */
import { useRef } from 'react'
import { useCallback, useEffect, useState, useTracer } from 'react-hook-tracer'

import { SimpleButton } from '../SimpleButton'

import './Demo.css'

export const Demo = () => (
  <div className="demo">
    <UserList />
  </div>
)

const demoUsers: string[] = ['Ren', 'Stimpy']

const UserList = () => {
  const { trace, TracePanel } = useTracer()
  const [users, setUsers] = useState<string[]>([], { label: 'users' }) // Pass trace options for custom label.
  const [isFetching, setIsFetching] = useState(false, { label: 'isFetching' })

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
    setUsers((users) => [...users, 'New-' + newUserIdRef.current])
    newUserIdRef.current += 1
  }

  const deleteUsers = () => setUsers([])

  const deleteUser = useCallback(
    (name: string) => {
      setUsers((users) => users.filter((user) => user !== name))
    },
    [],
    { label: 'deleteUser' },
  )

  return (
    <div className="user-list">
      <TracePanel />
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
          users.map((name) => <User key={name} name={name} deleteUser={deleteUser} />)
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
  const { TracePanel } = useTracer()
  const [clickCount, setClickCount] = useState(0)
  return (
    <div className="user">
      <TracePanel />
      <div className="user-details">
        {name} (clicks: {clickCount}) <div className="spacer"></div>
        <SimpleButton onClick={() => setClickCount((n) => n + 1)} value="click" />
        <SimpleButton onClick={() => deleteUser(name)} value="delete" />
      </div>
    </div>
  )
}
