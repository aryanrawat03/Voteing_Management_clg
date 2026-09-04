import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Vote,
  User,
  Shield,
  ArrowRight,
} from "lucide-react";

import { persistAuthSession } from "../../components/ProtectedRoute";

function Login() {
  const navigate = useNavigate();

  const [role, setRole] = useState("voter");
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please enter email and password");
      return;
    }

    const loginData = {
      email: formData.email,
      password: formData.password,
      role: role,
    };

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Incorrect email or password");
        return;
      }

      persistAuthSession(data.token, data.user);
      toast.success("Login successful!");

      setTimeout(() => {
        if (data.user.role === "admin") {
          navigate("/admin/dashboard");
        } else if (data.user.role === "voter") {
          navigate("/voter/dashboard");
        }
      }, 1200);
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Unable to connect to server");
    }
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />

      <div className="min-h-screen bg-[#05071b] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mx-auto grid max-w-4xl overflow-hidden rounded-[18px] bg-white shadow-[0_24px_70px_rgba(0,0,0,0.42)] lg:grid-cols-[1fr_1.08fr]">
          <div className="relative hidden overflow-hidden bg-gradient-to-brbg-gradient-to-br from-[#4b36f5] via-[#513af4] to-[#3d28d9] p-8 text-white lg:flex lg:flex-col lg:justify-between">
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
                <p className="mb-3 text-sm font-medium uppercase tracking-[0.22em] text-violet-100/90">Secure voting portal</p>
                <h1 className="max-w-xs text-4xl font-bold leading-tight text-white">Welcome back!</h1>
                <p className="mt-4 max-w-sm text-base leading-7 text-violet-100/90">
                  Login to access your voting account and participate in a secure and transparent election.
                </p>
              </div>
            </div>

            <div className="relative z-10 space-y-4">
              {[{
                icon: ShieldCheck,
                title: "Secure authentication",
                text: "Protected sessions and verified secure access"
              }, {
                icon: Vote,
                title: "Fair and transparent elections",
                text: "Every vote remains accountable and traceable"
              }].map(({ icon: Icon, title, text }) => (
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
                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#5f4ef7]">Login</p>
                <h2 className="text-3xl font-bold text-slate-900">Welcome back</h2>
                <p className="mt-2 text-sm text-slate-500">Sign in to continue to your voting portal.</p>
              </div>

              <div className="mb-7">
                <label className="mb-3 block text-sm font-medium text-slate-700">Login as</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("voter")}
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
                    onClick={() => setRole("admin")}
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
                    <button type="button" onClick={() => navigate("/forgot-password")} className="text-sm font-medium text-[#5f4ef7] hover:text-[#4b3fe1]">
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
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
                </div>

                <div className="flex items-center gap-3">
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-300 accent-violet-600" />
                  <span className="text-sm text-slate-600">Remember me</span>
                </div>

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-500 from-[#5f4ef7] to-[#4b3fe1] px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:from-[#4a3fe3] hover:to-[#3a30cc]"
                >
                  Login as {role === "voter" ? "Voter" : "Admin"}
                  <ArrowRight size={18} />
                </button>
              </form>

              <p className="mt-7 text-center text-sm text-slate-500">
                Don’t have an account?{' '}
                <Link to="/register" className="font-semibold text-[#5f4ef7] hover:text-[#4b3fe1]">
                  Create account
                </Link>
              </p>

              <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-500">
                <ShieldCheck size={14} className="text-violet-500" />
                Secure & trusted voting platform
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;