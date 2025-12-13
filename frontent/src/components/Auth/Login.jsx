import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "../context/AuthContext";
import { toast } from 'sonner';
import { useTheme } from "../../context/ThemeContext";

const Login = () => {
  const navigate = useNavigate();
  const { login, signupWithGoogle, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState({ type: null, message: "" });
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    identifier: "", // email or phone
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { identifier, password } = formData;
    
    if (!identifier || !password) {
      setAlert({ type: 'error', message: 'Please fill in all fields' });
      return;
    }

    const { success, error, message, user } = await login(identifier, password);
    if (success) {
      setAlert({ type: 'success', message: message || 'Login successful!' });
      if(user.role === 'admin'){
        navigate("/ad-dashboard");
      }else{
        navigate("/dashboard");
      }
    } else if (error) {
      setAlert({ type: 'error', message: error });
    }
  };

  const handleGoogleSignIn = async () => {
    setAlert({ type: null, message: "" });

    const { success, error, message } = await signupWithGoogle();
    
    if (success) {
      toast.success(message || 'Welcome back!');
      setAlert({ type: 'success', message: message || 'Login successful!' });
      setTimeout(() => navigate('/dashboard'), 1000);
    } else if (error) {
      // Handle specific Firebase error codes
      if (error.includes('popup-closed-by-user')) {
        setAlert({ type: 'error', message: 'Sign-in cancelled by user' });
      } else if (error.includes('popup-blocked')) {
        setAlert({ type: 'error', message: 'Popup blocked. Please allow popups and try again.' });
      } else {
        setAlert({ type: 'error', message: error });
      }
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center px-4 ${
      theme === 'dark' 
        ? 'bg-gray-900 text-white' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      <div className="text-center mb-10 sm:mt-10 mt-20">
        <h2 className={`text-3xl md:text-4xl font-bold ${
          theme === 'dark' ? 'text-white' : 'text-gray-800'
        } uppercase`}>
          Welcome to
        </h2>
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600 mt-2">
          Clurst AI Review
        </h1>
      </div>

      <div className={`w-full max-w-md rounded-xl p-8 space-y-6 transition-all duration-300 backdrop-blur-xl ${
        theme === 'dark' 
          ? 'bg-gray-900/40 shadow-[0_8px_32px_0px_rgba(76,29,149,0.3)] border border-gray-600/30' 
          : 'bg-white/50 shadow-[0_8px_32px_0px_rgba(147,51,234,0.1)] border border-white/30'
      }`}>
        {alert.type && (
          <div className={`w-full px-4 py-3 rounded-lg text-sm ${alert.type === 'success' ? 'bg-green-500/15 text-green-300 border border-green-600/40' : 'bg-red-500/15 text-red-300 border border-red-600/40'}`}>
            {alert.message}
          </div>
        )}
        <h2 className="text-2xl font-semibold text-center">Login</h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              placeholder="Email or Phone"
              className={`w-full px-4 py-3 rounded-lg ${
                theme === 'dark' 
                  ? 'bg-gray-700 text-white placeholder-gray-400' 
                  : 'bg-gray-100 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-purple-500`}
              required
            />
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className={`w-full px-4 py-3 rounded-lg ${
                theme === 'dark' 
                  ? 'bg-gray-700 text-white placeholder-gray-400' 
                  : 'bg-gray-100 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-purple-500 pr-12`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute right-3 top-3.5 ${
                theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:opacity-90 transition-opacity ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-gray-700 w-full"></div>
            <span className="px-3 bg-[#181818] text-gray-400 text-sm">OR</span>
            <div className="border-t border-gray-700 w-full"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
              theme === 'dark' 
                ? 'bg-gray-700 text-white hover:bg-gray-600' 
                : 'bg-white text-gray-800 hover:bg-gray-100'
            }`}
          >
            <FcGoogle className="text-xl" />
            Continue with Google
          </button>

          <p className="text-center text-gray-400 text-sm">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-purple-400 hover:text-purple-300 font-medium"
            >
              Sign up
            </Link>
          </p>

          <p className="text-center text-gray-400 text-sm">
            <Link
              to="/forgot-password"
              className="text-purple-400 hover:text-purple-300"
            >
              Forgot password?
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;