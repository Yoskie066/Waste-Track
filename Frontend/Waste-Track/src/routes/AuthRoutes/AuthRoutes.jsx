import { Routes, Route } from "react-router-dom";
import UserLogin from "../../pages/Auth/UserAuth/UserLogin/UserLogin";
import AdminLogin from "../../pages/Auth/AdminAuth/AdminLogin/AdminLogin";
import UserRegister from "../../pages/Auth/UserAuth/UserRegister/UserRegister";
import AdminRegister from "../../pages/Auth/AdminAuth/AdminRegister/AdminRegister";
import UserForgotPassword from "../../pages/Auth/UserAuth/UserForgotPassword/UserForgotPassword";
import AdminForgotPassword from "../../pages/Auth/AdminAuth/AdminForgotPassword/AdminForgotPassword";

const AuthRoutes = () => {
  return (
    <> 
        <Routes>
           <Route path="/login" element={<UserLogin />} />
           <Route path="/admin-login" element={<AdminLogin />} />
           <Route path="/register" element={<UserRegister />} />
           <Route path="/admin-register" element={<AdminRegister />} />
           <Route path="/forgot-password" element={<UserForgotPassword />} />
           <Route path="/admin-forgot-password" element={<AdminForgotPassword />} />
        </Routes>
    </>
  )
}

export default AuthRoutes;
