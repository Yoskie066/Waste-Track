import { Outlet } from "react-router-dom";
import UserFooter from "../Footer/UserFooter";
import UserHeader from "../Header/UserHeader";

export default function UserLayout() {
  return (
    <>
      <UserHeader />
      <main className="min-h-screen">
        <Outlet />
      </main>
      <UserFooter/>
    </>
  );
}
