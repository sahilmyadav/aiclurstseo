import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "../context/AuthContext";
import { toast } from 'sonner';
import { useTheme } from "../../context/ThemeContext";

const fontSizeMap = {
  sm: 'text-sm', base: 'text-base', lg: 'text-lg', xl: 'text-xl',
  '2xl': 'text-2xl', '3xl': 'text-3xl', '4xl': 'text-4xl', '5xl': 'text-5xl'
};
const fontWeightMap = {
  normal: 'font-normal', medium: 'font-medium', semibold: 'font-semibold',
  bold: 'font-bold', extrabold: 'font-extrabold'
};

const FONT_FAMILIES = {
  default: 'inherit', poppins: "'Poppins', sans-serif", inter: "'Inter', sans-serif",
  roboto: "'Roboto', sans-serif", playfair: "'Playfair Display', serif",
  montserrat: "'Montserrat', sans-serif", raleway: "'Raleway', sans-serif",
  oswald: "'Oswald', sans-serif", lato: "'Lato', sans-serif",
  nunito: "'Nunito', sans-serif", dancing: "'Dancing Script', cursive",
  pacifico: "'Pacifico', cursive",
};

const GOOGLE_FONTS_URL = "https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=Inter:wght@400;600;700&family=Roboto:wght@400;700&family=Playfair+Display:wght@400;700&family=Montserrat:wght@400;700&family=Raleway:wght@400;700&family=Oswald:wght@400;700&family=Lato:wght@400;700&family=Nunito:wght@400;700&family=Dancing+Script:wght@400;700&family=Pacifico&display=swap";

const ANIMATION_STYLES = `
  @keyframes lp-fadeIn { from { opacity:0 } to { opacity:1 } }
  @keyframes lp-slideLeft { from { opacity:0; transform:translateX(-30px) } to { opacity:1; transform:translateX(0) } }
  @keyframes lp-slideUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
  @keyframes lp-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes lp-pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
  .lp-anim-fadeIn   { animation: lp-fadeIn 1s ease forwards; }
  .lp-anim-slideLeft{ animation: lp-slideLeft 0.8s ease forwards; }
  .lp-anim-slideUp  { animation: lp-slideUp 0.8s ease forwards; }
  .lp-anim-bounce   { animation: lp-bounce 1.5s ease infinite; }
  .lp-anim-pulse    { animation: lp-pulse 2s ease infinite; }
`;

const Login = () => {
  const navigate = useNavigate();
  const { login, signupWithGoogle, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState({ type: null, message: "" });
  const { theme } = useTheme();
  const [pageContent, setPageContent] = useState(null);
  const [formData, setFormData] = useState({ identifier: "", password: "" });

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE}/api/login-page`)
      .then(r => r.json())
      .then(d => { if (d.success) setPageContent(d.data); })
      .catch(() => {});
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { identifier, password } = formData;
    if (!identifier || !password) { setAlert({ type: 'error', message: 'Please fill in all fields' }); return; }
    const { success, error, message, user } = await login(identifier, password);
    if (success) {
      setAlert({ type: 'success', message: message || 'Login successful!' });
      navigate(user.role === 'admin' ? "/ad-dashboard" : "/dashboard");
    } else if (error) { setAlert({ type: 'error', message: error }); }
  };

  const handleGoogleSignIn = async () => {
    setAlert({ type: null, message: "" });
    const { success, error, message } = await signupWithGoogle();
    if (success) { toast.success(message || 'Welcome back!'); setTimeout(() => navigate('/dashboard'), 1000); }
    else if (error) { setAlert({ type: 'error', message: error }); }
  };

  const defaultBg = '#4c1d95';
  const bg = pageContent?.bgColor || defaultBg;

  const pc = pageContent;

  return (
    <div className="min-h-screen flex">
      <style>{ANIMATION_STYLES}</style>
      <link rel="stylesheet" href={GOOGLE_FONTS_URL} />
      {/* LEFT PANEL - desktop only */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-center relative overflow-hidden"
        style={{
          backgroundColor: bg,
          paddingLeft: pc?.panelPaddingX ?? 48,
          paddingRight: pc?.panelPaddingX ?? 48,
          paddingTop: pc?.panelPaddingY ?? 48,
          paddingBottom: pc?.panelPaddingY ?? 48,
        }}
      >
        {/* Background image */}
        {pc?.showImage && pc?.imageUrl && pc?.imagePosition === 'background' && (
          <div className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url(${pc.imageUrl})` }} />
        )}

        <div className="relative z-10 flex flex-col flex-1 mt-16">
          {/* Image top */}
          {pc?.showImage && pc?.imageUrl && pc?.imagePosition === 'top' && (
            <img src={pc.imageUrl} alt="banner" className="object-contain mb-8 rounded-xl"
              style={{
                width: `${pc.imageWidth ?? 100}%`,
                maxHeight: `${pc.imageHeight ?? 200}px`,
                marginTop: pc.imageMarginTop ?? 0,
                marginLeft: pc.imageMarginLeft ?? 0,
                paddingLeft: pc.imagePaddingLeft ?? 0,
              }} />
          )}

          {/* Text lines */}
          <div className="space-y-1">
            {(pc?.lines || []).map((line, i) => (
              <p key={i}
                className={`${fontSizeMap[line.fontSize] || 'text-base'} ${fontWeightMap[line.fontWeight] || 'font-normal'} leading-tight${line.animation && line.animation !== 'none' ? ` lp-anim-${line.animation}` : ''}`}
                style={{
                  color: line.color,
                  marginTop: line.marginTop ?? 0,
                  marginLeft: line.marginLeft ?? 0,
                  paddingLeft: line.paddingLeft ?? 0,
                  animationDelay: `${i * 0.15}s`,
                  fontFamily: FONT_FAMILIES[line.fontFamily || 'default'] || 'inherit',
                }}>
                {line.text}
              </p>
            ))}
          </div>

          {/* Image center */}
          {pc?.showImage && pc?.imageUrl && pc?.imagePosition === 'center' && (
            <img src={pc.imageUrl} alt="banner" className="object-contain mt-8 rounded-xl"
              style={{
                width: `${pc.imageWidth ?? 100}%`,
                maxHeight: `${pc.imageHeight ?? 200}px`,
                marginTop: pc.imageMarginTop ?? 0,
                marginLeft: pc.imageMarginLeft ?? 0,
                paddingLeft: pc.imagePaddingLeft ?? 0,
              }} />
          )}
        </div>

        {/* Image bottom */}
        {pc?.showImage && pc?.imageUrl && pc?.imagePosition === 'bottom' && (
          <img src={pc.imageUrl} alt="banner" className="relative z-10 object-contain rounded-xl"
            style={{
              width: `${pc.imageWidth ?? 100}%`,
              maxHeight: `${pc.imageHeight ?? 200}px`,
              marginTop: pc.imageMarginTop ?? 0,
              marginLeft: pc.imageMarginLeft ?? 0,
              paddingLeft: pc.imagePaddingLeft ?? 0,
            }} />
        )}

        {/* Decorative circles */}
        <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full opacity-10" style={{ backgroundColor: '#fff' }} />
        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full opacity-10" style={{ backgroundColor: '#fff' }} />
      </div>

      {/* RIGHT PANEL - login form */}
      <div className={`flex-1 flex flex-col items-center justify-center px-6 py-12 ${
        theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      }`}>
        {/* Mobile logo */}
        <div className="lg:hidden text-center mb-8">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
            Clurst AI
          </h1>
        </div>

        <div className={`w-full max-w-md rounded-2xl p-8 space-y-6 ${
          theme === 'dark'
            ? 'bg-gray-800/60 border border-gray-700 shadow-xl'
            : 'bg-white border border-gray-200 shadow-lg'
        }`}>
          {alert.type && (
            <div className={`px-4 py-3 rounded-lg text-sm ${
              alert.type === 'success'
                ? 'bg-green-500/15 text-green-400 border border-green-600/40'
                : 'bg-red-500/15 text-red-400 border border-red-600/40'
            }`}>
              {alert.message}
            </div>
          )}

          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            Sign in
          </h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              type="text" name="identifier" value={formData.identifier}
              onChange={handleChange} placeholder="Email or Phone"
              className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                theme === 'dark' ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-gray-100 text-gray-900 placeholder-gray-500'
              }`} required
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"} name="password"
                value={formData.password} onChange={handleChange} placeholder="Password"
                className={`w-full px-4 py-3 pr-16 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  theme === 'dark' ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-gray-100 text-gray-900 placeholder-gray-500'
                }`} required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-3.5 text-sm ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}>
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <button type="submit" disabled={isLoading}
              className={`w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}>
              {isLoading ? "Signing in..." : "Sign in"}
            </button>

            <div className="flex items-center gap-3">
              <div className={`flex-1 h-px ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`} />
              <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>OR</span>
              <div className={`flex-1 h-px ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`} />
            </div>

            <button type="button" onClick={handleGoogleSignIn} disabled={isLoading}
              className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                theme === 'dark' ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-800 border border-gray-200 hover:bg-gray-50'
              }`}>
              <FcGoogle className="text-xl" />
              Continue with Google
            </button>

            <div className="flex items-center justify-between text-sm">
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                No account?{" "}
                <Link to="/signup" className="text-purple-500 hover:text-purple-400 font-medium">Sign up</Link>
              </p>
              <Link to="/forgot-password" className="text-purple-500 hover:text-purple-400 text-sm">
                Forgot password?
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
