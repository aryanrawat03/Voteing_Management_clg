import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CreditCard,
  ShieldCheck,
  Vote,
  Shield,
  KeyRound,
  ArrowRight,
} from "lucide-react";

import { clearAuthSession } from "../../components/ProtectedRoute";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const generateStrongPassword = () => {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const numbers = "23456789";
  const specials = "!@#$%^&*()_+-=[]{}|;:,.<>?";
  const all = upper + lower + numbers + specials;

  const picks = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    specials[Math.floor(Math.random() * specials.length)],
  ];

  while (picks.length < 12) {
    picks.push(all[Math.floor(Math.random() * all.length)]);
  }

  for (let i = picks.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [picks[i], picks[j]] = [picks[j], picks[i]];
  }

  return picks.join("");
};

function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState("voter");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    voterId: "",
    email: "",
    password: "",
    confirmPassword: "",
    adminCode: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    setFormData((prev) => ({
      ...prev,
      voterId: "",
      adminCode: "",
    }));
  };

  const handleGeneratePassword = () => {
    const suggestedPassword = generateStrongPassword();
    setFormData((prev) => ({
      ...prev,
      password: suggestedPassword,
      confirmPassword: suggestedPassword,
    }));
    toast.info("Strong password suggested.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      toast.error("Please enter your full name.");
      return;
    }

    if (role === "voter" && !formData.voterId.trim()) {
      toast.error("Please enter a Voter ID.");
      return;
    }

    if (!emailRegex.test(formData.email.trim())) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!strongPasswordRegex.test(formData.password)) {
      toast.error("Password must be at least 8 characters and include uppercase, lowercase, number, and special character.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    if (!termsAccepted) {
      toast.error("You must accept the Terms & Conditions and Privacy Policy before registering.");
      return;
    }

    const registerData = {
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      role: role,
      termsAccepted,
    };

    if (role === "voter") {
      registerData.voterId = formData.voterId;
    }

    if (role === "admin") {
      registerData.adminCode = formData.adminCode;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Registration failed");
        return;
      }

      const accountType = data.user.role === "admin" ? "Admin" : "Voter";
      toast.success(`${accountType} registration successful!`);
      clearAuthSession();

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Unable to connect to server. Please try again.");
    }
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />

      <div className="min-h-screen bg-[#05071b] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mx-auto grid max-w-4xl overflow-hidden rounded-[18px] bg-white shadow-[0_24px_70px_rgba(0,0,0,0.42)] lg:grid-cols-[1fr_1.08fr]">
          <div className="relative hidden overflow-hidden bg-linear-to-br from-[rgb(75,54,245)] via-[#513af4] to-[#3d28d9] p-8 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="absolute -right-12 -top-14 h-52 w-52 rounded-full bg-[#7465ff]/55" />
            <div className="absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-[#3c2bdc]/75" />

            <div className="relative z-10">
              <div className="mb-10 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm">
                  <Vote size={24} />
                </div>
                <div>
                  <div className="text-2xl font-bold">Vote<span className="text-violet-100">Manage</span></div>
                </div>
              </div>

              <div className="max-w-md">
                <p className="mb-3 text-sm font-medium uppercase tracking-[0.22em] text-violet-100/90">Create account</p>
                <h1 className="max-w-xs text-4xl font-bold leading-tight text-white">Your voice.<br />Your vote.<br />Your future.</h1>
                <p className="mt-4 max-w-sm text-base leading-7 text-violet-100/90">
                  Create your account and participate in a secure, transparent and modern voting experience.
                </p>
              </div>
            </div>

            <div className="relative z-10 space-y-4">
              {[
                {
                  icon: ShieldCheck,
                  title: "Secure registration",
                  text: "Protected account setup with trusted validation",
                },
                {
                  icon: Vote,
                  title: "Transparent voting",
                  text: "A fair and accountable experience for every voter",
                },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex items-start gap-4 rounded-2xl p-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 text-violet-100">
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{title}</p>
                    <p className="mt-1 text-sm text-violet-100/90">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 lg:p-10">
            <div className="mx-auto max-w-md">
              <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#5a4df7] text-white shadow-lg shadow-violet-200">
                  <Vote size={22} />
                </div>
                <div className="text-xl font-bold text-slate-900">VoteManage</div>
              </div>

              <div className="mb-8">
                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#5f4ef7]">Register</p>
                <h2 className="text-3xl font-bold text-slate-900">Create account</h2>
                <p className="mt-2 text-sm text-slate-500">Select your account type and complete your profile.</p>
              </div>

              <div className="mb-7">
                <label className="mb-3 block text-sm font-medium text-slate-700">Register as</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleRoleChange("voter")}
                    className={`flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-sm font-semibold transition ${
                      role === "voter"
                        ? "border-[#5f4ef7] bg-violet-50 text-[#5f4ef7] shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:text-[#5f4ef7]"
                    }`}
                  >
                    <User size={18} />
                    Voter
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleChange("admin")}
                    className={`flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-sm font-semibold transition ${
                      role === "admin"
                        ? "border-[#5f4ef7] bg-violet-50 text-[#5f4ef7] shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:text-[#5f4ef7]"
                    }`}
                  >
                    <Shield size={18} />
                    Admin
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Full name</label>
                  <div className="relative">
                    <User size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                    />
                  </div>
                </div>

                {role === "voter" && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Voter ID</label>
                    <div className="relative">
                      <CreditCard size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        name="voterId"
                        value={formData.voterId}
                        onChange={handleChange}
                        placeholder="Enter your voter ID"
                        required
                        className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                      />
                    </div>
                  </div>
                )}

                {role === "admin" && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Admin secret code</label>
                    <div className="relative">
                      <KeyRound size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        name="adminCode"
                        value={formData.adminCode}
                        onChange={handleChange}
                        placeholder="Enter admin secret code"
                        required
                        className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Email address</label>
                  <div className="relative">
                    <Mail size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      required
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-700">Password</label>
                  </div>
                  <div className="relative">
                    <Lock size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a password"
                      required
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-12 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-400">Must be 8+ characters with uppercase, lowercase, number, and special character.</p>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="mt-2.5 flex w-full items-center justify-center rounded-xl border border-violet-100 bg-violet-50 py-2.5 text-sm font-semibold text-[#5f4ef7] transition hover:border-violet-200 hover:bg-violet-100"
                  >
                    Suggest strong password
                  </button>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Confirm password</label>
                  <div className="relative">
                    <Lock size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter your password"
                      required
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-12 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-violet-600"
                  />
                  <span>I agree to the Terms & Conditions and Privacy Policy.</span>
                </label>

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-500 from-[#5f4ef7] to-[#4b3fe1] px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:from-[#4a3fe3] hover:to-[#3a30cc]"
                >
                  Create account
                  <ArrowRight size={18} />
                </button>
              </form>

              <p className="mt-7 text-center text-sm text-slate-500">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-[#5f4ef7] hover:text-[#4b3fe1]">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;