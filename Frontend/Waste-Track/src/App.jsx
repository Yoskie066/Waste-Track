import HomepageRoutes from "./routes/HomepageRoutes/HomepageRoutes";
import AuthRoutes from "./routes/AuthRoutes/AuthRoutes";
import UserRoutes from "./routes/UserRoutes/UserRoutes";
import AdminRoutes from "./routes/AdminRoutes/AdminRoutes";
import InstallButton from "./components/InstallButton";

function App() {
  

  return (
    <>
      <InstallButton />
      <HomepageRoutes />
      <AuthRoutes />
      <UserRoutes />
      <AdminRoutes />
    </>
  )
}

export default App;
