import React from 'react';

const AdminFooter = () => {
  return (
    <footer className="bg-white/80 backdrop-blur-md text-gray-700 text-center py-6 mt-10 shadow-inner">
      <p className="text-sm">&copy; {new Date().getFullYear()} EcoTrack. All rights reserved.</p>
    </footer>
  );
};

export default AdminFooter;