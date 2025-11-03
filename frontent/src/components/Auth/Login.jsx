import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "../context/AuthContext";
import { toast } from 'sonner';

const Login = () => {
  const navigate = useNavigate();
  const { login, signupWithGoogle, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState({ type: null, message: "" });
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

    const { success, error, message } = await login(identifier, password);
    if (success) {
      setAlert({ type: 'success', message: message || 'Login successful!' });
      navigate("/dashboard");
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f0f1a] text-white px-4">
      <div className="text-center mb-10 sm:mt-10 mt-20">
        <h2 className="text-3xl md:text-4xl font-bold text-white uppercase">Welcome to</h2>
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600 mt-2">
          Clurst AI Review
        </h1>
      </div>

      <div className="w-full max-w-md bg-[#181818] rounded-xl shadow-2xl p-8 space-y-6">
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
              className="w-full px-4 py-3 rounded-lg bg-[#222] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              className="w-full px-4 py-3 rounded-lg bg-[#222] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
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
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white text-gray-800 rounded-lg font-medium hover:bg-gray-100 transition-colors"
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