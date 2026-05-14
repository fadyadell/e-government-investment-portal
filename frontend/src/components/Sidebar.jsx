import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, PlusCircle } from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div style={{ width: '32px', height: '32px', background: 'var(--primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
          E
        </div>
        Gov Invest
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => \`nav-link \${isActive ? 'active' : ''}\`}>
          <LayoutDashboard size={20} />
          Status Dashboard
        </NavLink>
        <NavLink to="/approvals" className={({ isActive }) => \`nav-link \${isActive ? 'active' : ''}\`}>
          <CheckSquare size={20} />
          Approvals (Official)
        </NavLink>
        <NavLink to="/submit" className={({ isActive }) => \`nav-link \${isActive ? 'active' : ''}\`}>
          <PlusCircle size={20} />
          New Request
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
