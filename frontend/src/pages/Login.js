import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await login(formData.email, formData.password);
      toast.success('Login successful!');

      // Redirect based on role
      const role = response.data.user.role;
      switch (role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'doctor':
          navigate('/doctor/dashboard');
          break;
        case 'receptionist':
          navigate('/receptionist/dashboard');
          break;
        case 'patient':
          navigate('/patient/dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-0 lg:p-4 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none opacity-30">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-primary-400/20 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-indigo-400/20 blur-[100px]"></div>
      </div>

      <main className="w-full max-w-6xl h-[95vh] lg:h-[90vh] bg-white shadow-2xl overflow-hidden flex flex-col lg:flex-row lg:rounded-2xl">
        {/* Branded Sidebar */}
        <aside className="w-full lg:w-2/5 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 p-6 lg:p-8 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Decorative Patterns */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-20 -mb-20 blur-3xl"></div>

          <div className="relative z-10">
            {/* Brand Header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-xl">
                <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight">HealthCare HMS</h1>
                <p className="text-blue-100 text-xs font-medium">Enterprise Management System</p>
              </div>
            </div>

            {/* Hero Section */}
            <div className="space-y-4 mb-8">
              <h2 className="text-3xl font-extrabold leading-tight">
                Welcome to your healthcare portal.
              </h2>
              <p className="text-blue-100 text-base leading-relaxed">
                Secure access to comprehensive hospital management tools and patient care systems.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-all duration-300">
                <div className="bg-white/20 p-2 rounded-lg flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-base mb-0.5">Enterprise Security</h3>
                  <p className="text-xs text-blue-100">Bank-grade encryption and HIPAA-compliant data protection.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-all duration-300">
                <div className="bg-white/20 p-2 rounded-lg flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-base mb-0.5">Real-Time Updates</h3>
                  <p className="text-xs text-blue-100">Instant synchronization across all departments and devices.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-all duration-300">
                <div className="bg-white/20 p-2 rounded-lg flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-base mb-0.5">Advanced Analytics</h3>
                  <p className="text-xs text-blue-100">Comprehensive insights and reporting for better decision-making.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Stats */}
          <div className="relative z-10 mt-6 pt-6 border-t border-white/20">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xl font-extrabold">99.9%</div>
                <div className="text-xs text-blue-100">Uptime</div>
              </div>
              <div>
                <div className="text-xl font-extrabold">24/7</div>
                <div className="text-xs text-blue-100">Support</div>
              </div>
              <div>
                <div className="text-xl font-extrabold">500K+</div>
                <div className="text-xs text-blue-100">Users</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Login Section */}
        <section className="w-full lg:w-3/5 p-6 lg:p-8 bg-white flex flex-col justify-center">
          {/* Form Header */}
          <div className="mb-3">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Sign In to Your Account</h2>
            <p className="text-gray-600 text-sm">Enter your credentials to access the portal</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-800 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="block w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-gray-900 placeholder:text-gray-400 hover:border-gray-300"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@hospital.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-bold text-gray-800">
                  Password
                </label>
                <button type="button" className="text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors">
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  className="block w-full pl-12 pr-12 py-3.5 rounded-xl border-2 border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-gray-900 placeholder:text-gray-400 hover:border-gray-300"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded transition"
                />
                <label htmlFor="rememberMe" className="ml-2.5 block text-sm text-gray-700 font-medium">
                  Keep me signed in for 24 hours
                </label>
              </div>
            </div>

            {/* Sign In Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-8 py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold text-base shadow-xl shadow-primary-600/40 hover:shadow-2xl hover:shadow-primary-600/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In to Portal
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Divider with Text */}
          <div className="my-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-600 font-bold">OR</span>
              </div>
            </div>
          </div>

          {/* Register Link */}
          <div className="text-center mb-3">
            <p className="text-gray-700 text-sm font-medium">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-700 font-bold underline decoration-2 underline-offset-2 hover:underline-offset-4 transition-all">
                Register as Patient →
              </Link>
            </p>
          </div>

          {/* Demo Credentials - Professional Compact Design */}
          <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl border-2 border-blue-200/60 p-3 shadow-sm mb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-primary-100 p-1.5 rounded-lg">
                <svg className="w-4 h-4 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xs font-extrabold text-gray-900">Demo Login Credentials</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs mb-2">
              <div className="bg-white/90 px-2.5 py-2 rounded-lg border border-blue-200/50 shadow-sm hover:shadow-md transition-shadow">
                <span className="font-extrabold text-gray-800 block mb-0.5">Admin</span>
                <p className="text-gray-600 font-medium text-[11px]">admin@hospital.com</p>
                <p className="text-primary-700 font-mono font-bold text-[10px] mt-1">admin123</p>
              </div>
              <div className="bg-white/90 px-2.5 py-2 rounded-lg border border-blue-200/50 shadow-sm hover:shadow-md transition-shadow">
                <span className="font-extrabold text-gray-800 block mb-0.5">Doctor</span>
                <p className="text-gray-600 font-medium text-[11px]">dr.smith@hospital.com</p>
                <p className="text-primary-700 font-mono font-bold text-[10px] mt-1">doctor123</p>
              </div>
              <div className="bg-white/90 px-2.5 py-2 rounded-lg border border-blue-200/50 shadow-sm hover:shadow-md transition-shadow">
                <span className="font-extrabold text-gray-800 block mb-0.5">Receptionist</span>
                <p className="text-gray-600 font-medium text-[11px]">reception@hospital.com</p>
                <p className="text-primary-700 font-mono font-bold text-[10px] mt-1">reception123</p>
              </div>
              <div className="bg-white/90 px-2.5 py-2 rounded-lg border border-blue-200/50 shadow-sm hover:shadow-md transition-shadow">
                <span className="font-extrabold text-gray-800 block mb-0.5">Patient</span>
                <p className="text-gray-600 font-medium text-[11px]">patient@example.com</p>
                <p className="text-primary-700 font-mono font-bold text-[10px] mt-1">patient123</p>
              </div>
            </div>
          </div>

          {/* Security Footer */}
          <div className="mt-4 text-center">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="font-bold text-gray-600">Secured with AES-256 Encryption</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Login;
