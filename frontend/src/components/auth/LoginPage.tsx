import React, { useState } from 'react';
import { useShelter } from '../../context/ShelterContext';
import {
  Mail,
  Lock,
  LogIn,
  Eye,
  EyeOff,
  UserPlus,
  User,
  CheckCircle,
  AlertCircle,
  Home,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

type TabType = 'login' | 'signup';

interface LoginFields {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface SignupFields {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FieldError {
  [key: string]: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const API_BASE = 'http://localhost:8000/api';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isStrongPassword(pwd: string): boolean {
  return pwd.length >= 8;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

interface InputFieldProps {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  icon: React.ReactNode;
  error?: string;
  rightElement?: React.ReactNode;
  autoComplete?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  type,
  placeholder,
  value,
  onChange,
  icon,
  error,
  rightElement,
  autoComplete,
}) => (
  <div className="space-y-1">
    <label htmlFor={id} className="block text-xs font-semibold text-[#075C55] uppercase tracking-wider">
      {label}
    </label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#075C55] pointer-events-none">
        {icon}
      </span>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        className={`w-full pl-10 pr-${rightElement ? '11' : '4'} py-3 rounded-xl bg-white border text-sm text-[#1A2E2B] font-medium placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 transition-all ${
          error
            ? 'border-red-400 focus:ring-red-300'
            : 'border-[#E5E1D5] focus:ring-[#075C55]/30 focus:border-[#075C55]'
        }`}
      />
      {rightElement && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</span>
      )}
    </div>
    {error && (
      <p className="flex items-center gap-1 text-xs text-red-500 mt-0.5">
        <AlertCircle className="w-3 h-3 shrink-0" />
        {error}
      </p>
    )}
  </div>
);

// ─── Login Form ──────────────────────────────────────────────────────────────

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignup }) => {
  const { setActivePage } = useShelter();
  const [fields, setFields] = useState<LoginFields>({ email: '', password: '', rememberMe: false });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldError>({});
  const [isLoading, setIsLoading] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const set = (key: keyof LoginFields) => (value: string | boolean) =>
    setFields((prev) => ({ ...prev, [key]: value }));

  const validate = (): boolean => {
    const errs: FieldError = {};
    if (!fields.email.trim()) errs.email = 'Email address is required.';
    else if (!isValidEmail(fields.email)) errs.email = 'Enter a valid email address.';
    if (!fields.password) errs.password = 'Password is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setNotice(null);

    try {
      // Attempt to call backend auth endpoint (login)
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fields.email, password: fields.password }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.token) {
          if (fields.rememberMe) localStorage.setItem('aashray_token', data.token);
          else sessionStorage.setItem('aashray_token', data.token);
        }
        setNotice({ type: 'success', message: 'Login successful! Redirecting…' });
        setTimeout(() => setActivePage('dashboard'), 800);
      } else {
        const err = await res.json().catch(() => ({}));
        setNotice({
          type: 'error',
          message: err?.detail || 'Invalid credentials. Please check your email and password.',
        });
      }
    } catch {
      setNotice({
        type: 'error',
        message:
          'Could not reach the server. Please verify the backend is running and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4" aria-label="Login form">
      {/* Notice */}
      {notice && (
        <div
          role="alert"
          className={`flex items-start gap-2 px-4 py-3 rounded-xl text-xs font-medium leading-relaxed ${
            notice.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : notice.type === 'error'
              ? 'bg-red-50 border border-red-200 text-red-700'
              : 'bg-amber-50 border border-amber-200 text-amber-800'
          }`}
        >
          {notice.type === 'success' ? (
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span>{notice.message}</span>
        </div>
      )}

      <InputField
        id="login-email"
        label="Email Address"
        type="email"
        placeholder="Enter your email address"
        value={fields.email}
        onChange={set('email')}
        icon={<Mail className="w-4 h-4" />}
        error={errors.email}
        autoComplete="email"
      />

      <InputField
        id="login-password"
        label="Password"
        type={showPassword ? 'text' : 'password'}
        placeholder="Enter your password"
        value={fields.password}
        onChange={set('password')}
        icon={<Lock className="w-4 h-4" />}
        error={errors.password}
        autoComplete="current-password"
        rightElement={
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="text-[#9CA3AF] hover:text-[#075C55] transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
      />

      {/* Remember Me + Forgot Password */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            id="login-remember"
            type="checkbox"
            checked={fields.rememberMe}
            onChange={(e) => set('rememberMe')(e.target.checked)}
            className="w-4 h-4 rounded border-[#E5E1D5] text-[#075C55] focus:ring-[#075C55]/30 cursor-pointer accent-[#075C55]"
          />
          <span className="text-xs text-[#4B5563] font-medium">Remember me</span>
        </label>
        <button
          type="button"
          className="text-xs font-semibold text-[#F36B21] hover:text-[#D45A18] hover:underline transition-colors"
          onClick={() =>
            setNotice({
              type: 'info',
              message: 'Password reset requires the backend server to be running.',
            })
          }
        >
          Forgot Password?
        </button>
      </div>

      {/* Submit */}
      <button
        id="login-submit-btn"
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#075C55] hover:bg-[#032B25] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
      >
        {isLoading ? (
          <>
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Signing in…</span>
          </>
        ) : (
          <>
            <LogIn className="w-4 h-4" />
            <span>Login</span>
          </>
        )}
      </button>

      {/* Divider */}
      <div className="relative flex items-center">
        <div className="flex-1 border-t border-[#E5E1D5]" />
        <span className="mx-3 text-xs text-[#9CA3AF] font-medium">OR</span>
        <div className="flex-1 border-t border-[#E5E1D5]" />
      </div>

      {/* Switch to Sign Up */}
      <p className="text-center text-xs text-[#6B7280]">
        Don't have an account?{' '}
        <button
          type="button"
          id="switch-to-signup-btn"
          onClick={onSwitchToSignup}
          className="text-[#F36B21] font-bold hover:underline transition-colors"
        >
          Sign Up
        </button>
      </p>
    </form>
  );
};

// ─── Sign Up Form ─────────────────────────────────────────────────────────────

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin }) => {
  const [fields, setFields] = useState<SignupFields>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FieldError>({});
  const [isLoading, setIsLoading] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const set = (key: keyof SignupFields) => (value: string) =>
    setFields((prev) => ({ ...prev, [key]: value }));

  const validate = (): boolean => {
    const errs: FieldError = {};
    if (!fields.fullName.trim()) errs.fullName = 'Full name is required.';
    else if (fields.fullName.trim().length < 2) errs.fullName = 'Name must be at least 2 characters.';
    if (!fields.email.trim()) errs.email = 'Email address is required.';
    else if (!isValidEmail(fields.email)) errs.email = 'Enter a valid email address.';
    if (!fields.password) errs.password = 'Password is required.';
    else if (!isStrongPassword(fields.password)) errs.password = 'Password must be at least 8 characters.';
    if (!fields.confirmPassword) errs.confirmPassword = 'Please confirm your password.';
    else if (fields.password !== fields.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setNotice(null);

    try {
      // Create user via backend auth registration endpoint
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fields.fullName.trim(),
          email: fields.email.trim().toLowerCase(),
          password: fields.password,
          confirmPassword: fields.confirmPassword,
          role: 'architect',
        }),
      });

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        setNotice({
          type: 'success',
          message: data?.message || 'Account created successfully! You can now log in.',
        });
        setFields({
          fullName: '',
          email: '',
          password: '',
          confirmPassword: '',
        });
        setTimeout(() => onSwitchToLogin(), 1500);
      } else {
        const err = await res.json().catch(() => ({}));
        const detail = err?.detail || '';
        if (
          detail.toLowerCase().includes('duplicate') ||
          detail.toLowerCase().includes('unique') ||
          detail.toLowerCase().includes('already exists')
        ) {
          setNotice({ type: 'error', message: 'An account with this email already exists.' });
        } else {
          setNotice({ type: 'error', message: detail || 'Could not create account. Please check your details and try again.' });
        }
      }
    } catch {
      setNotice({
        type: 'error',
        message:
          'Could not reach the server. Please verify the backend is running and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4" aria-label="Sign up form">
      {/* Notice */}
      {notice && (
        <div
          role="alert"
          className={`flex items-start gap-2 px-4 py-3 rounded-xl text-xs font-medium leading-relaxed ${
            notice.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : notice.type === 'error'
              ? 'bg-red-50 border border-red-200 text-red-700'
              : 'bg-amber-50 border border-amber-200 text-amber-800'
          }`}
        >
          {notice.type === 'success' ? (
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span>{notice.message}</span>
        </div>
      )}

      <InputField
        id="signup-name"
        label="Full Name"
        type="text"
        placeholder="Enter your full name"
        value={fields.fullName}
        onChange={set('fullName')}
        icon={<User className="w-4 h-4" />}
        error={errors.fullName}
        autoComplete="name"
      />

      <InputField
        id="signup-email"
        label="Email Address"
        type="email"
        placeholder="Enter your email address"
        value={fields.email}
        onChange={set('email')}
        icon={<Mail className="w-4 h-4" />}
        error={errors.email}
        autoComplete="email"
      />

      <InputField
        id="signup-password"
        label="Password"
        type={showPassword ? 'text' : 'password'}
        placeholder="Create a password (min 8 characters)"
        value={fields.password}
        onChange={set('password')}
        icon={<Lock className="w-4 h-4" />}
        error={errors.password}
        autoComplete="new-password"
        rightElement={
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="text-[#9CA3AF] hover:text-[#075C55] transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
      />

      <InputField
        id="signup-confirm-password"
        label="Confirm Password"
        type={showConfirmPassword ? 'text' : 'password'}
        placeholder="Confirm your password"
        value={fields.confirmPassword}
        onChange={set('confirmPassword')}
        icon={<Lock className="w-4 h-4" />}
        error={errors.confirmPassword}
        autoComplete="new-password"
        rightElement={
          <button
            type="button"
            onClick={() => setShowConfirmPassword((v) => !v)}
            className="text-[#9CA3AF] hover:text-[#075C55] transition-colors"
            aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
      />

      {/* Submit */}
      <button
        id="signup-submit-btn"
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#075C55] hover:bg-[#032B25] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
      >
        {isLoading ? (
          <>
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Creating account…</span>
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4" />
            <span>Create Account</span>
          </>
        )}
      </button>

      {/* Switch to Login */}
      <p className="text-center text-xs text-[#6B7280]">
        Already have an account?{' '}
        <button
          type="button"
          id="switch-to-login-btn"
          onClick={onSwitchToLogin}
          className="text-[#F36B21] font-bold hover:underline transition-colors"
        >
          Log In
        </button>
      </p>
    </form>
  );
};

// ─── Main LoginPage ───────────────────────────────────────────────────────────

export const LoginPage: React.FC = () => {
  const { setActivePage } = useShelter();
  const [activeTab, setActiveTab] = useState<TabType>('login');

  return (
    /*
     * Full-viewport standalone layout — Navbar/Footer are hidden when on
     * this page, so the card fills the entire screen height.
     */
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#032B25] px-4 py-8 sm:py-10 lg:py-12">

      {/* ── Floating Home Button (top-left) ─────────────────────────── */}
      <button
        id="floating-home-btn"
        onClick={() => setActivePage('home')}
        title="Back to Homepage"
        aria-label="Back to Homepage"
        className="
          fixed top-4 left-4 z-50
          flex items-center gap-2
          px-3 py-2 rounded-full
          bg-white/15 hover:bg-white/25
          backdrop-blur-md
          border border-white/20
          text-white hover:text-white
          text-xs font-semibold
          shadow-lg
          transition-all duration-200
          active:scale-95
        "
      >
        <Home className="w-4 h-4" />
        <span className="hidden sm:inline">Home</span>
      </button>

      {/* ── Outer Card ─────────────────────────────────────────────────── */}
      <div
        className="
          w-full max-w-5xl
          flex flex-col lg:flex-row
          rounded-2xl overflow-hidden
          shadow-2xl
          border border-white/10
        "
      >
        {/* ════════════════════════════════════════════
            LEFT SECTION — Branding + Architectural Image
            ════════════════════════════════════════════ */}
        <div
          className="
            relative flex flex-col
            w-full lg:w-[55%]
            min-h-[220px] sm:min-h-[280px] lg:min-h-[600px]
            overflow-hidden
            bg-[#043B34]
          "
        >
          {/* Logo + Brand — always visible */}
          <div className="relative z-10 p-5 sm:p-6 flex items-center gap-3 bg-gradient-to-b from-black/40 to-transparent">
            {/* Logo badge */}
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#075C55] border border-white/20 flex items-center justify-center shadow-md shrink-0">
              <span className="text-[1.6rem] sm:text-3xl font-bold text-white leading-none" style={{ fontFamily: 'serif' }}>
                आ
              </span>
            </div>
            <div>
              <p className="text-white font-extrabold text-xl sm:text-2xl tracking-tight leading-tight">
                AASHRAY
              </p>
              <p
                className="text-[#F36B21] text-xs sm:text-sm font-semibold tracking-wide mt-0.5"
              >
                Mitti Se Mausam Tak
              </p>
            </div>
          </div>

          {/* Architectural photograph */}
          <div className="flex-1 relative min-h-[160px] sm:min-h-[220px] lg:min-h-0">
            <img
              src="/himalayan-shelter.jpg"
              alt="Climate-responsive sustainable shelter in the Himalayan mountains"
              className="absolute inset-0 w-full h-full object-cover"
              loading="eager"
            />
            {/* Subtle vignette overlay so the bottom blends into the card */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#043B34]/60 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>

        {/* ════════════════════════════════════════════
            RIGHT SECTION — Authentication Form
            ════════════════════════════════════════════ */}
        <div
          className="
            w-full lg:w-[45%]
            bg-[#F5F3E9]
            flex flex-col
            px-6 sm:px-8 lg:px-10
            py-8 sm:py-10
          "
        >
          {/* Heading */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#032B25] tracking-tight leading-tight">
              Welcome Back!
            </h1>
            <p className="text-sm text-[#4B5563] mt-1.5">
              Sign in to continue to{' '}
              <span className="font-bold text-[#075C55]">AASHRAY</span>
            </p>
            {/* Orange accent underline */}
            <div className="mx-auto mt-3 w-14 h-0.5 rounded-full bg-[#F36B21]" />
          </div>

          {/* ── Tabs ─────────────────────────────────── */}
          <div
            className="flex rounded-xl overflow-hidden border border-[#E5E1D5] mb-6"
            role="tablist"
            aria-label="Authentication options"
          >
            <button
              id="tab-login"
              role="tab"
              aria-selected={activeTab === 'login'}
              aria-controls="panel-login"
              onClick={() => setActiveTab('login')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-all duration-200 ${
                activeTab === 'login'
                  ? 'bg-[#075C55] text-white shadow-sm'
                  : 'bg-transparent text-[#6B7280] hover:text-[#075C55]'
              }`}
            >
              <LogIn className="w-4 h-4" />
              Login
            </button>
            <button
              id="tab-signup"
              role="tab"
              aria-selected={activeTab === 'signup'}
              aria-controls="panel-signup"
              onClick={() => setActiveTab('signup')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-all duration-200 ${
                activeTab === 'signup'
                  ? 'bg-[#075C55] text-white shadow-sm'
                  : 'bg-transparent text-[#6B7280] hover:text-[#075C55]'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Sign Up
            </button>
          </div>

          {/* ── Form Panels ─────────────────────────── */}
          <div className="flex-1">
            <div
              id="panel-login"
              role="tabpanel"
              aria-labelledby="tab-login"
              hidden={activeTab !== 'login'}
            >
              {activeTab === 'login' && (
                <LoginForm onSwitchToSignup={() => setActiveTab('signup')} />
              )}
            </div>

            <div
              id="panel-signup"
              role="tabpanel"
              aria-labelledby="tab-signup"
              hidden={activeTab !== 'signup'}
            >
              {activeTab === 'signup' && (
                <SignupForm onSwitchToLogin={() => setActiveTab('login')} />
              )}
            </div>
          </div>


        </div>
      </div>
    </div>
  );
};
