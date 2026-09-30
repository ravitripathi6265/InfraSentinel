import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  const [presentationMode, setPresentationMode] = useState(false);

  return (
    <div className={`flex h-screen bg-slate-50 text-slate-900 ${presentationMode ? 'text-lg' : ''}`}>
      <Sidebar presentationMode={presentationMode} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          presentationMode={presentationMode} 
          togglePresentation={() => setPresentationMode(!presentationMode)} 
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6">
          <Outlet context={{ presentationMode }} />
        </main>
      </div>
    </div>
  );
};

export default Layout;
