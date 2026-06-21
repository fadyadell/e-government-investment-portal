import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShieldCheck, PlusCircle } from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">E</div>
        <div className="sidebar-brand">
          <span className="sidebar-brand-name">Gov Invest</span>
          <span className="sidebar-brand-sub">Investment Portal</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
          <LayoutDashboard size={20} className="nav-icon" />
          Status Dashboard
        </NavLink>
        <NavLink to="/approvals" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <ShieldCheck size={20} className="nav-icon" />
          Approvals (Official)
        </NavLink>
        <NavLink to="/submit" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <PlusCircle size={20} className="nav-icon" />
          New Request
        </NavLink>
      </nav>
      <div className="sidebar-footer">
        <p className="sidebar-footer-text">
          E-Government Investment Portal<br />
          © 2026 All Rights Reserved
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
