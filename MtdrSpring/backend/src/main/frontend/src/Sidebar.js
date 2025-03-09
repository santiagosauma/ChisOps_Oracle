import React, { useState } from 'react'
import './styles/Sidebar.css'
import logo from './resources/logo.png'
import homeBlue from './resources/home_blue.png'
import homeWhite from './resources/home_white.png'
import folderBlue from './resources/folder_blue.png'
import folderWhite from './resources/folder_white.png'
import logoutIcon from './resources/logout.png'

function Sidebar() {
  const [expand, setExpand] = useState(false)
  const [activeItem, setActiveItem] = useState('Home')
  const items = [
    { name: 'Home', iconExpanded: homeBlue, iconCollapsed: homeWhite },
    { name: 'Projects', iconExpanded: folderBlue, iconCollapsed: folderWhite }
  ]
  return (
    <div
      className={expand ? 'sidebar expanded' : 'sidebar collapsed'}
      onMouseEnter={() => setExpand(true)}
      onMouseLeave={() => setExpand(false)}
    >
      <div className="sidebar-logo">
        <img src={logo} alt="Logo" className="logo" />
      </div>
      <div className="sidebar-content">
        {items.map(item => {
          const isActive = item.name === activeItem
          return (
            <div
              key={item.name}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveItem(item.name)}
            >
              <div className="icon-container">
                <img
                  src={expand ? item.iconExpanded : item.iconCollapsed}
                  alt={item.name}
                  className="item-icon"
                />
              </div>
              {expand && <span className="item-text">{item.name}</span>}
            </div>
          )
        })}
      </div>
      <div className="sidebar-logout">
        <div className="icon-container">
          <img src={logoutIcon} alt="Logout" className="item-icon" />
        </div>
        {expand && <span className="item-text">Logout</span>}
      </div>
    </div>
  )
}

export default Sidebar