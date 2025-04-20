import React, { useState, useEffect } from 'react'
import './styles/Sidebar.css'
import logo from './resources/logo.png'
import homeBlue from './resources/home_blue.png'
import homeWhite from './resources/home_white.png'
import folderBlue from './resources/folder_blue.png'
import folderWhite from './resources/folder_white.png'
import logoutIcon from './resources/logout.png'
import menuIcon from './resources/menu_responsive.png'
import menuOpenIcon from './resources/menu_90_responsive.png'

function Sidebar({ currentPage, onNav, userRole, onLogout }) {
  const [expand, setExpand] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      
      if (!mobile && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    console.log('🚪 Iniciando proceso de logout desde Sidebar');
    
    try {
      const response = await fetch('/usuarios/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.warn('Server logout failed, proceeding with client-side logout');
      }
    } catch (err) {
      console.error('Error during logout:', err);
    } finally {
      localStorage.removeItem('user');
      
      onLogout();
    }
  };

  const items = [
    { name: 'Home', iconExpanded: homeBlue, iconCollapsed: homeWhite },
    { name: 'Projects', iconExpanded: folderBlue, iconCollapsed: folderWhite },
    { name: 'ProjectsTrue', iconExpanded: folderBlue, iconCollapsed: folderWhite }
  ];

  const mobileMenuToggle = (
    <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
      <img src={mobileMenuOpen ? menuOpenIcon : menuIcon} alt="Menu" />
    </div>
  );

  if (isMobile && !mobileMenuOpen) {
    return mobileMenuToggle;
  }

  return (
    <>
      {isMobile && mobileMenuToggle}
      <div
        className={`sidebar ${expand ? 'expanded' : 'collapsed'} ${isMobile ? 'mobile' : ''} ${mobileMenuOpen ? 'mobile-open' : ''}`}
        onMouseEnter={() => !isMobile && setExpand(true)}
        onMouseLeave={() => !isMobile && setExpand(false)}
      >
        <div className="sidebar-logo">
          <img src={logo} alt="Logo" className="logo" />
        </div>
        <div className="sidebar-content">
          {items.map(item => {
            const isActive = item.name === currentPage
            return (
              <div
                key={item.name}
                className={`sidebar-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  onNav(item.name);
                  if (isMobile) setMobileMenuOpen(false);
                }}
              >
                <div className="icon-container">
                  <img
                    src={expand || isMobile ? item.iconExpanded : item.iconCollapsed}
                    alt={item.name}
                    className="item-icon"
                  />
                </div>
                {(expand || isMobile) && <span className="item-text">{item.name}</span>}
              </div>
            )
          })}
        </div>
        <div 
          className="sidebar-logout" 
          onClick={handleLogout}
          style={{ cursor: 'pointer' }}
        >
          <div className="icon-container">
            <img src={logoutIcon} alt="Logout" className="item-icon" />
          </div>
          {(expand || isMobile) && <span className="item-text">Logout</span>}
        </div>
      </div>
      {isMobile && mobileMenuOpen && <div className="sidebar-overlay" onClick={() => setMobileMenuOpen(false)}></div>}
    </>
  );
}

export default Sidebar