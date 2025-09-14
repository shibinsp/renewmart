import React from 'react';
import RoleBasedSidebar from './RoleBasedSidebar';

const Sidebar = ({ isCollapsed = false, onToggleCollapse }) => {
  return (
    <RoleBasedSidebar
      collapsed={isCollapsed}
      onToggle={onToggleCollapse}
    />
  );
};

export default Sidebar;