import React from 'react'

const AdminFooter = () => {
  return (
    <footer className="bg-green-600 text-white text-center py-4 mt-10">
      <p className="text-sm">&copy; {new Date().getFullYear()} EcoTrack. All rights reserved.</p>
    </footer>
  );
}

export default AdminFooter;