import React from 'react';
import { Mail, Phone, MessagesSquare } from 'lucide-react';

function UserInformation({ userData, projectRole }) {
  if (!userData) {
    return <div className="flex items-center justify-center h-full text-gray-500 italic">Loading user information...</div>;
  }

  const getStatusBadgeClass = (status) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === 'active') {
      return 'bg-green-100 text-green-800 border-green-200';
    } else if (statusLower === 'inactive') {
      return 'bg-gray-100 text-gray-800 border-gray-200';
    } else {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getInitials = () => {
    const firstInitial = userData.firstName ? userData.firstName.charAt(0) : '';
    const lastInitial = userData.lastName ? userData.lastName.charAt(0) : '';
    return (firstInitial + lastInitial).toUpperCase();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow space-y-4">
        <div className="flex items-center mb-2">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-xl border-2 border-red-200 mr-3 flex-shrink-0">
            {getInitials()}
          </div>
          <div>
            <h3 className="text-base md:text-lg font-medium text-gray-800">{userData.firstName} {userData.lastName}</h3>
            <p className="text-xs md:text-sm text-gray-500 mt-0.5">
              {projectRole || userData.rol || 'Team Member'}
            </p>
            <div className="flex items-center mt-1">
              <div className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full ${userData.status?.toLowerCase() === 'active' ? 'bg-green-500' : 'bg-gray-500'} mr-1.5`}></div>
              <span className="text-xs text-gray-600">{userData.status || 'Unknown status'}</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className="text-xs uppercase tracking-wider text-gray-500 font-semibold border-b border-gray-100 pb-1">Contact Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
            <div className="flex items-start space-x-2">
              <Mail size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">Email</span>
                <a href={`mailto:${userData.email}`} className="text-xs md:text-sm text-blue-600 hover:underline break-all">
                  {userData.email || 'Not provided'}
                </a>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <Phone size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">Phone</span>
                <span className="text-xs md:text-sm text-gray-800">
                  {userData.phone || 'Not provided'}
                </span>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <MessagesSquare size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">Telegram Username</span>
                <span className="text-xs md:text-sm text-gray-800">
                  {userData.telegramUsername || 'Not provided'}
                </span>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <div className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">Role Level</span>
                <span className="text-xs md:text-sm font-medium text-gray-800">
                  {userData.rol === 'Admin' ? 'Administrator' : userData.rol === 'Manager' ? 'Project Manager' : 'Team Member'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-grow"></div>
      </div>
    </div>
  );
}

export default UserInformation;