import { Routes, Route } from "react-router-dom";
import UserLayout from "../../components/UserLayout/Layout/UserLayout";   
import Dashboard from "../../pages/User/Dashboard/Dashboard";
import CollectWaste from "../../pages/User/CollectWaste/CollectWaste";
import ReportWaste from "../../pages/User/ReportWaste/ReportWaste";
import WasteTimeline from "../../pages/User/WasteTimeline/WasteTimeline";

const UserRoutes = () => {
  return (
    <Routes>
      {/* Parent layout route – provides header & footer */}
      <Route element={<UserLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/collect-waste" element={<CollectWaste />} />
        <Route path="/report-waste" element={<ReportWaste />} />
        <Route path="/waste-timeline" element={<WasteTimeline />} />
      </Route>
    </Routes>
  );
};

export default UserRoutes;