import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import AdminOverview from './AdminOverview';
import ShelterManager from './ShelterManager';
import ContentModerator from './ContentModerator';
import ReportManager from './ReportManager';
import CategoryEditor from './CategoryEditor';
import { 
  LayoutDashboard, 
  Home, 
  FileText, 
  AlertTriangle, 
  Layers,
  Menu
} from 'lucide-react';

const SuperAdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebarItems = [
    { label: 'Tổng Quan', path: '/admin', icon: <LayoutDashboard size={20} />, exact: true },
    { label: 'Quản Lý Trạm', path: '/admin/shelters', icon: <Home size={20} /> },
    { label: 'Kiểm Duyệt Nội Dung', path: '/admin/content', icon: <FileText size={20} /> },
    { label: 'Báo Cáo Vi Phạm', path: '/admin/reports', icon: <AlertTriangle size={20} /> },
    { label: 'Danh Mục', path: '/admin/categories', icon: <Layers size={20} /> },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--light)', position: 'relative' }}>
      {/* Mobile Header */}
      <div className="md:hidden p-4 bg-white flex items-center justify-between shadow-sm fixed top-0 left-0 right-0 z-20">
         <div className="flex items-center gap-2">
            <button onClick={() => setSidebarOpen(true)}>
               <Menu size={24} />
            </button>
            <h1 className="font-bold text-lg">Quản Trị Viên</h1>
         </div>
      </div>

      <Sidebar 
        title="Quản Trị Viên" 
        items={sidebarItems} 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      <main className="md:ml-[var(--sidebar-width)] pt-16 md:pt-0">
        <Routes>
            <Route path="/" element={<AdminOverview />} />
            <Route path="/shelters" element={<ShelterManager />} />
            <Route path="/content" element={<ContentModerator />} />
            <Route path="/reports" element={<ReportManager />} />
            <Route path="/categories" element={<CategoryEditor />} />
        </Routes>
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
