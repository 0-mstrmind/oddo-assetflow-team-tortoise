import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Loader2, LogIn, UserPlus } from 'lucide-react';
import { useLogin, useRegister, extractMessage } from '@/hooks/useAuth';
import { resendVerification } from '@/services/auth.service';
import { toast } from 'sonner';

export default function LoginPage() {
  const navigate = useNavigate();
  const { mutate: login, isPending: isLoginLoading } = useLogin({
    onError: (err) => {
      const msg = extractMessage(err, "Login failed. Please try again.");
      setError(msg);
      toast.error(msg);
    }
  });
  const { mutate: register, isPending: isRegisterLoading } = useRegister();
  const isLoading = isLoginLoading || isRegisterLoading;

  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', companyName: '' });
  const [error, setError] = useState(null);
  const [isResending, setIsResending] = useState(false);

  const clearError = () => setError(null);

  const updateField = (field, value) => {
    clearError();
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    clearError();

    // Frontend Validations
    if (!form.email || !form.email.includes('@')) {
      return setError('Please enter a valid email address.');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters long.');
    }

    if (mode === 'register') {
      if (!form.name || form.name.length < 2) {
        return setError('Please enter your admin name.');
      }
      if (!form.companyName || form.companyName.length < 2) {
        return setError('Please enter your company name.');
      }
      register({ name: form.name, email: form.email, password: form.password, companyName: form.companyName });
    } else {
      login({ email: form.email, password: form.password });
    }
  };

  const toggleMode = () => {
    clearError();
    setMode((m) => (m === 'login' ? 'register' : 'login'));
  };

  const handleResendEmail = async () => {
    if (!form.email) return;
    setIsResending(true);
    try {
      const res = await resendVerification(form.email);
      toast.success(res.message || "Verification email sent!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to resend verification email.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[#FAF7F5] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background warmth */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#D97736]/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-[#D49B28]/[0.025] rounded-full blur-[100px]" />
        <div className="absolute top-[40%] left-[20%] w-[300px] h-[300px] bg-[#1E4620]/[0.015] rounded-full blur-[90px]" />
      </div>

      <div className="relative z-10 w-full max-w-[420px]">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div className="relative">
            <div className="w-10 h-10 bg-[#1E2022] rounded-xl flex items-center justify-center shadow-[0_2px_8px_rgba(30,32,34,0.15)]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M4 18V8l8-5l8 5v10l-8 5L4 18Z" stroke="#D97736" strokeWidth="1.8" strokeLinejoin="round"/>
                <path d="M12 13v9M4 8l8 5l8-5" stroke="#D97736" strokeWidth="1.8" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#D97736] rounded-full border-2 border-[#FAF7F5]" />
          </div>
          <span className="text-[#1E2022] text-xl font-semibold tracking-tight">
            Asset<span className="font-bold">Flow</span>
          </span>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl p-8 md:p-9 shadow-[0_4px_24px_rgba(30,32,34,0.06),0_1px_4px_rgba(30,32,34,0.04)] border border-[#F0EBE6]/80">
          {/* Header */}
          <div className="bg-[#F9F7F5] p-1 rounded-full flex mb-8">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-full text-xs font-semibold tracking-tight transition-all duration-300 ${
                mode === 'login' 
                  ? 'bg-[#1E2022] text-white shadow-sm' 
                  : 'text-[#6B7280] hover:text-[#1E2022]'
              }`}
            >
              <LogIn size={14} />
              Sign In
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-full text-xs font-semibold tracking-tight transition-all duration-300 ${
                mode === 'register' 
                  ? 'bg-[#1E2022] text-white shadow-sm' 
                  : 'text-[#6B7280] hover:text-[#1E2022]'
              }`}
            >
              <UserPlus size={14} />
              Initialize Company
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name and Company fields (register only) */}
            {mode === 'register' && (
              <>
                <div className="space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <label htmlFor="name" className="block text-[13px] font-medium text-[#6B7280]">
                    Admin Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={form.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="Sarah Mitchell"
                    required
                    className="w-full h-11 px-4 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-sm text-[#1E2022] placeholder:text-[#C4BEB8] outline-none transition-all duration-200 focus:border-[#D97736]/50 focus:ring-2 focus:ring-[#D97736]/10 focus:bg-white"
                  />
                </div>
                <div className="space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-75">
                  <label htmlFor="companyName" className="block text-[13px] font-medium text-[#6B7280]">
                    Company Name
                  </label>
                  <input
                    id="companyName"
                    type="text"
                    value={form.companyName}
                    onChange={(e) => updateField('companyName', e.target.value)}
                    placeholder="Acme Corp"
                    required
                    className="w-full h-11 px-4 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-sm text-[#1E2022] placeholder:text-[#C4BEB8] outline-none transition-all duration-200 focus:border-[#D97736]/50 focus:ring-2 focus:ring-[#D97736]/10 focus:bg-white"
                  />
                </div>
              </>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-[13px] font-medium text-[#6B7280]">
                {mode === 'register' ? 'Admin Email Address' : 'Email Address'}
              </label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="sarah@acmecorp.com"
                required
                className="w-full h-11 px-4 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-sm text-[#1E2022] placeholder:text-[#C4BEB8] outline-none transition-all duration-200 focus:border-[#D97736]/50 focus:ring-2 focus:ring-[#D97736]/10 focus:bg-white"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-[13px] font-medium text-[#6B7280]">
                  Password
                </label>
                {mode === 'login' && (
                  <a href="#forgot" className="text-xs text-[#D97736] hover:text-[#C85C27] font-medium transition-colors">
                    Forgot password?
                  </a>
                )}
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-11 px-4 pr-11 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-sm text-[#1E2022] placeholder:text-[#C4BEB8] outline-none transition-all duration-200 focus:border-[#D97736]/50 focus:ring-2 focus:ring-[#D97736]/10 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex flex-col gap-3 px-3.5 py-3 bg-[#C85C27]/[0.06] border border-[#C85C27]/10 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#C85C27] rounded-full shrink-0" />
                  <p className="text-xs text-[#C85C27] font-medium">{error}</p>
                </div>
                {error.includes("verify your email") && (
                  <button
                    type="button"
                    onClick={handleResendEmail}
                    disabled={isResending}
                    className="self-start text-xs font-semibold text-white bg-[#C85C27] hover:bg-[#b04a1c] px-3 py-1.5 rounded-lg transition-colors disabled:opacity-70 flex items-center gap-2"
                  >
                    {isResending && <Loader2 size={12} className="animate-spin" />}
                    Resend Verification Email
                  </button>
                )}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              id="auth-submit"
              className="w-full h-11 mt-2 flex items-center justify-center gap-2 bg-[#D97736] text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:bg-[#C85C27] hover:shadow-[0_4px_16px_rgba(217,119,54,0.25)] disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99]"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Mode toggle */}
          <div className="mt-6 text-center">
            <p className="text-sm text-[#9CA3AF]">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                onClick={toggleMode}
                className="text-[#D97736] font-medium hover:text-[#C85C27] transition-colors"
              >
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>

        {/* Functional note */}
        <p className="mt-5 text-center text-xs text-[#9CA3AF]/80 leading-relaxed max-w-[340px] mx-auto">
          New here? Sign up creates an employee account. Admin roles are assigned later by your organization admin.
        </p>
      </div>
    </div>
  );
}
