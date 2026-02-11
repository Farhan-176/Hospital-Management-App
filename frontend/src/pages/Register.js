import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registrationData } = formData;
      await register(registrationData);
      toast.success('Registration successful!');
      navigate('/patient/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 p-0 lg:p-4 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary-400/30 blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-primary-500/40 blur-[120px]"></div>
      </div>

      <main className="w-full max-w-6xl h-[95vh] lg:h-[90vh] bg-white shadow-2xl overflow-hidden flex flex-col lg:flex-row lg:rounded-2xl">
        {/* Branded Sidebar */}
        <aside className="w-full lg:w-2/5 bg-gradient-to-br from-primary-600 to-primary-700 p-6 lg:p-8 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Decorative Patterns */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-20 -mb-20 blur-3xl"></div>

          <div className="relative z-10">
            {/* Brand Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-xl font-extrabold tracking-tight">HealthCare HMS</span>
            </div>

            {/* Hero Text */}
            <div className="space-y-3 mb-6">
              <h1 className="text-3xl font-extrabold leading-tight">Join our healthcare community.</h1>
              <p className="text-blue-100 text-base leading-relaxed">
                Create an account today to experience seamless healthcare management at your fingertips.
              </p>
            </div>

            {/* Benefits Cards */}
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-all duration-300">
                <div className="bg-white/20 p-2 rounded-lg flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-base mb-0.5">Easy Appointments</h3>
                  <p className="text-xs text-blue-100">Schedule and manage your appointments 24/7 with just a few clicks.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-all duration-300">
                <div className="bg-white/20 p-2 rounded-lg flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-base mb-0.5">Medical Records</h3>
                  <p className="text-xs text-blue-100">Access your complete medical history anytime, anywhere securely.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-all duration-300">
                <div className="bg-white/20 p-2 rounded-lg flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-base mb-0.5">Instant Notifications</h3>
                  <p className="text-xs text-blue-100">Get real-time updates about appointments and test results.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="relative z-10 mt-6 pt-6 border-t border-white/20">
            <div className="flex items-center justify-between text-xs text-blue-100">
              <span>Step 1 of 1</span>
              <span>Patient Registration</span>
            </div>
            <div className="mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full w-full transition-all duration-500"></div>
            </div>
          </div>
        </aside>

        {/* Main Registration Section */}
        <section className="w-full lg:w-3/5 p-6 lg:p-8 bg-white flex flex-col justify-center overflow-y-auto">
          {/* Progress Stepper - Hidden on mobile for space */}
          <div className="hidden lg:block mb-6">
            <div className="flex items-center justify-between max-w-md mx-auto">
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-9 h-9 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-primary-600/30">
                  1
                </div>
                <span className="text-xs font-semibold text-primary-600 uppercase tracking-wider">Account</span>
              </div>
              <div className="flex-1 h-1 mx-3 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-primary-600 w-0"></div>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-9 h-9 rounded-full border-2 border-gray-200 text-gray-400 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Verify</span>
              </div>
              <div className="flex-1 h-1 mx-3 bg-gray-200 rounded-full"></div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-9 h-9 rounded-full border-2 border-gray-200 text-gray-400 flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Complete</span>
              </div>
            </div>
          </div>

          {/* Form Header */}
          <div className="mb-5">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Create Your Account</h2>
            <p className="text-gray-600 text-sm">Fill in your details to get started with personalized healthcare.</p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  First Name *
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  placeholder="e.g. John"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:bg-white transition-all"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  placeholder="e.g. Doe"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:bg-white transition-all"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:bg-white transition-all"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:bg-white transition-all"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-gray-700 mb-2">
                  Date of Birth
                </label>
                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:bg-white transition-all"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
              </div>

              {/* Gender - Interactive Cards */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Gender
                </label>
                <div className="flex gap-3">
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      checked={formData.gender === 'male'}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="p-3 border-2 border-gray-200 rounded-lg peer-checked:border-primary-600 peer-checked:bg-primary-50 hover:bg-gray-50 transition-all text-center">
                      <svg className="w-5 h-5 mx-auto mb-1 text-gray-500 peer-checked:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-sm font-bold text-gray-700">Male</span>
                    </div>
                  </label>
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      checked={formData.gender === 'female'}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="p-3 border-2 border-gray-200 rounded-lg peer-checked:border-primary-600 peer-checked:bg-primary-50 hover:bg-gray-50 transition-all text-center">
                      <svg className="w-5 h-5 mx-auto mb-1 text-gray-500 peer-checked:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-sm font-bold text-gray-700">Female</span>
                    </div>
                  </label>
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="other"
                      checked={formData.gender === 'other'}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="p-3 border-2 border-gray-200 rounded-lg peer-checked:border-primary-600 peer-checked:bg-primary-50 hover:bg-gray-50 transition-all text-center">
                      <svg className="w-5 h-5 mx-auto mb-1 text-gray-500 peer-checked:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span className="text-sm font-bold text-gray-700">Other</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
                  Address (Optional)
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows="2"
                  placeholder="Enter your full address"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:bg-white transition-all resize-none"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:bg-white transition-all"
                  value={formData.password}
                  onChange={handleChange}
                  minLength="6"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  placeholder="Re-enter your password"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:bg-white transition-all"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  minLength="6"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-8 py-4 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-bold text-lg shadow-lg shadow-primary-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer Links */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold underline">
                Sign In
              </Link>
            </p>
            <p className="text-xs text-gray-500 text-center mt-4">
              By continuing, you agree to our{' '}
              <a href="#" className="underline hover:text-primary-600">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="underline hover:text-primary-600">Privacy Policy</a>.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Register;
