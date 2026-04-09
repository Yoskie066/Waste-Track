import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const OAuthRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("OAuthRedirect mounted");
    console.log("Full URL:", window.location.href);

    const queryParams = new URLSearchParams(location.search);
    const accessToken = queryParams.get('accessToken');
    const refreshToken = queryParams.get('refreshToken');
    const role = queryParams.get('role');
    const error = queryParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      navigate(role === 'admin' ? '/admin-login?error=google_auth_failed' : '/login?error=google_auth_failed');
      return;
    }

    if (accessToken && refreshToken) {
      console.log("Saving tokens for role:", role);
      if (role === 'user') {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        navigate('/dashboard');
      } else if (role === 'admin') {
        localStorage.setItem('adminAccessToken', accessToken);
        localStorage.setItem('adminRefreshToken', refreshToken);
        navigate('/analytics');
      } else {
        navigate('/');
      }
    } else {
      console.error('Missing tokens. Search:', location.search);
      navigate(role === 'admin' ? '/admin-login?error=missing_tokens' : '/login?error=missing_tokens');
    }
  }, [navigate, location]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Authenticating, please wait...</p>
      </div>
    </div>
  );
};

export default OAuthRedirect;