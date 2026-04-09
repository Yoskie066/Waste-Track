import { Routes, Route } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout/Layout/AdminLayout";  
import Analytics from "../../pages/Admin/Analytics/Analytics";
import UserManagement from "../../pages/Admin/UserManagement/UserManagement";
import AdminCollectWaste from "../../pages/Admin/AdminCollectWaste/AdminCollectWaste";
import AdminReportWaste from "../../pages/Admin/AdminReportWaste/AdminReportWaste";


const AdminRoutes = () => {
  return (
    <> 
        <Routes>
          <Route element={<AdminLayout />}>
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/user-management" element={<UserManagement />} />
            <Route path="/collected-waste" element={<AdminCollectWaste />} />
            <Route path="/reported-waste" element={<AdminReportWaste />} />
          </Route>
        </Routes>
    </>
  )
}

export default AdminRoutes;