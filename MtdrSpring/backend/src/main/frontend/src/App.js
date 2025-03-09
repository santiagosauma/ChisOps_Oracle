import React, { useState } from 'react'
import './styles/index.css'
import Sidebar from './Sidebar'
import Home from './Home'
import DefaultContent from './DefaultContent'

function App() {
  const [page, setPage] = useState('Home')

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar currentPage={page} onNav={setPage} />
      <div style={{ marginLeft: '60px', flex: 1, padding: '0px' }}>
        {page === 'Home' ? <Home /> : <DefaultContent />}
      </div>
    </div>
  )
}

export default App