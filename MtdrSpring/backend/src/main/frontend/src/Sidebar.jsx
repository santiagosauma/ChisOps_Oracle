import React, { useState } from 'react'
import logo from './resources/logo.png'
import { Home, Folder, LogOut } from 'lucide-react';

function Sidebar({ currentPage, onNav, userRole, onLogout }) {
  const [expand, setExpand] = useState(false);

  const handleLogout = async (e) => {
    e.preventDefault();
    
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

  let items = [];
  
  if (userRole === 'user') {
    items = [
      { name: 'Home', icon: Home, navigateTo: 'UserHome' }
    ];
  } else {
    items = [
      { name: 'Home', icon: Home },
      { name: 'Projects', icon: Folder, navigateTo: 'ProjectsTrue' }
    ];
  }

  return (
    <div
      className={`fixed top-0 left-0 h-screen bg-[#312D2A] flex flex-col overflow-x-hidden overflow-y-auto z-10 transition-all duration-300 ease-in-out ${
        expand ? 'w-[220px]' : 'w-[60px]'
      } shadow-lg shadow-black/20`}
      onMouseEnter={() => setExpand(true)}
      onMouseLeave={() => setExpand(false)}
    >
      <div className="flex justify-center items-center px-2.5 py-4 min-h-[70px] border-b border-gray-700/50">
        <img 
          src={logo} 
          alt="Logo" 
          className={`w-10 h-10 transition-transform duration-500 ${expand ? 'rotate-[360deg]' : ''}`} 
        />
      </div>
      
      <div className="flex-1 flex flex-col mt-5 space-y-1">
        {items.map(item => {
          const isActive = item.name === currentPage || 
                          (item.navigateTo && currentPage && 
                           item.navigateTo.toLowerCase() === currentPage.toLowerCase());
          
          const Icon = item.icon;
          
          return (
            <div
              key={item.name}
              className={`
                flex items-center mx-2.5 mb-2.5 cursor-pointer rounded-lg p-2
                transition-all duration-200 hover:bg-white/10
                ${isActive && !expand ? 'bg-[#0C7FDA] text-white' : ''}
                ${isActive && expand ? 'bg-white text-[#0C7FDA]' : 'text-white'}
                hover:shadow-md hover:shadow-black/5
              `}
              onClick={() => {
                onNav(item.navigateTo || item.name);
              }}
            >
              <div className="w-7 h-7 flex justify-center items-center">
                <Icon 
                  size={22} 
                  className={`${isActive && expand ? 'text-[#0C7FDA]' : 'text-white'}`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              {expand && (
                <span className="ml-2.5 font-medium whitespace-nowrap">
                  {item.name}
                </span>
              )}
            </div>
          );
        })}
      </div>
      
      <div
        className="flex items-center mx-2.5 my-2.5 p-2 text-white cursor-pointer rounded-lg transition-all duration-200 hover:bg-white/10 group"
        onClick={handleLogout}
      >
        <div className="w-7 h-7 flex justify-center items-center">
          <LogOut 
            size={22} 
            className="text-white group-hover:scale-110 transition-transform" 
          />
        </div>
        {expand && (
          <span className="ml-2.5 font-medium whitespace-nowrap">
            Logout
          </span>
        )}
      </div>
    </div>
  );
}

export default Sidebar