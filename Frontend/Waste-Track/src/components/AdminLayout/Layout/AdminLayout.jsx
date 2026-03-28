import { Outlet } from "react-router-dom";
import AdminFooter from "../Footer/AdminFooter";
import AdminHeader from "../Header/AdminHeader";

export default function AdminLayout() {
  return (
    <>
      <AdminHeader />
      <main className="min-h-screen">
        <Outlet />
      </main>
      <AdminFooter/>
    </>
  );
}