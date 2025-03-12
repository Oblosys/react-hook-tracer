import { useCallback, useEffect, useRef, useState, useTracer } from 'react-hook-tracer'

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
  const [users, setUsers] = useState<string[]>([], { label: 'users' }) // Pass custom label.
  const [isFetching, setIsFetching] = useState(false, { label: 'isFetching' })

  useEffect(() => {
    trace('Initiating simulated fetch..')
    setIsFetching(true)
    const fetchTimeout = setTimeout(() => {
      setIsFetching(false)
      setUsers(demoUsers)
    }, 2000)
    return () => {
      clearTimeout(fetchTimeout)
    }
  }, [trace])

  const newUserIdRef = useRef(1, { label: 'newUserId' })

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
    <div className="user-list-wrapper">
      <div className="wrapping-row">
        <div className="user-list">
          <div className="details-header">User list</div>
          User count: {users.length}
          <div className="button-row">
            <SimpleButton
              onClick={() => {
                newUserIdRef.current += 1
              }}
              value="inc newUserId ref"
            />
          </div>
          <div className="button-row">
            <SimpleButton onClick={addUser} isDisabled={isFetching} value="add user" />
            <SimpleButton
              onClick={deleteUsers}
              isDisabled={users.length === 0}
              value="delete users"
            />
          </div>
        </div>
        <TracePanel />
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
    <div className="user-wrapper">
      <div className="user">
        <div className="details-header">User</div>
        <div>Name:'{name}'</div>
        <div>Clicks: {clickCount}</div>
        <div className="button-row">
          <SimpleButton onClick={() => setClickCount((n) => n + 1)} value="click" />
          <SimpleButton onClick={() => deleteUser(name)} value="delete" />
        </div>
      </div>
      <TracePanel />
    </div>
  )
}
