import React from 'react'
import ReactDOM from 'react-dom/client'
import './app.css'
import './mask.css'
import { TaskList } from './pages/TaskList'
import { TaskEdit } from './pages/TaskEdit'
import { Settings } from './pages/Settings'
import { Mask } from './pages/Mask'

function Root(): React.JSX.Element {
  const [hash, setHash] = React.useState(window.location.hash)
  React.useEffect(() => {
    const fn = (): void => setHash(window.location.hash)
    window.addEventListener('hashchange', fn)
    return () => window.removeEventListener('hashchange', fn)
  }, [])

  if (hash.startsWith('#mask')) {
    document.body.classList.add('mask-body')
    return <Mask />
  }
  document.body.classList.remove('mask-body')
  if (hash.startsWith('#edit')) {
    const id = new URLSearchParams(hash.split('?')[1] ?? '').get('id')
    return <TaskEdit id={id} />
  }
  if (hash.startsWith('#settings')) return <Settings />
  return <TaskList />
}

ReactDOM.createRoot(document.getElementById('root')!).render(<Root />)
