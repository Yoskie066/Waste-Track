import HomepageRoutes from "./routes/HomepageRoutes/HomepageRoutes";
import AuthRoutes from "./routes/AuthRoutes/AuthRoutes";
import UserRoutes from "./routes/UserRoutes/UserRoutes";
import AdminRoutes from "./routes/AdminRoutes/AdminRoutes";

function App() {
  

  return (
    <>
      <HomepageRoutes />
      <AuthRoutes />
      <UserRoutes />
      <AdminRoutes />
    </>
  )
}

export default App;
