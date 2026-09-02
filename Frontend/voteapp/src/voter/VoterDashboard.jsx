import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Vote,
  LogOut,
  ShieldCheck,
  Bell,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  CalendarClock,
  UserRound,
  LockKeyhole,
} from "lucide-react";

import { clearAuthSession, getStoredUser } from "../components/ProtectedRoute";

function VoterDashboard() {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [publishedElections, setPublishedElections] = useState([]);

  const user = getStoredUser();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        setProfileLoading(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/voters/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Profile fetch failed");
        }

        const data = await response.json();
        setProfileUser(data.user || null);
      } catch (error) {
        console.error("Voter dashboard profile error:", error);
        setProfileUser(null);
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [token]);

  useEffect(() => {
    const loadPublishedElections = async () => {
      try {
        if (!token) return;

        const response = await fetch("http://localhost:5000/api/elections/voter/list", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) return;

        const data = await response.json();
        setPublishedElections(
          (data.elections || []).filter((election) => election.status === "results_published")
        );
      } catch (error) {
        console.error("Voter dashboard results error:", error);
      }
    };

    loadPublishedElections();
  }, [token]);

  const currentUser = profileUser || user;

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login", { replace: true });
  };

  if (!user && !profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
            <ShieldCheck size={26} />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-slate-900">Session Expired</h1>
          <p className="mt-2 text-sm text-slate-500">Your login session is no longer available. Please login again.</p>
          <button
            onClick={() => navigate("/login")}
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const hasVoted = currentUser.hasVoted === true;
  const isActive = currentUser.status === "active";

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
              <Vote size={20} />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900">VoteManage</h1>
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Voter Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button type="button" className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-blue-200 hover:text-blue-600">
              <Bell size={16} />
            </button>

            <div className="hidden items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 sm:flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                {currentUser.fullName?.charAt(0)?.toUpperCase()}
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-slate-800">{currentUser.fullName}</p>
                <p className="text-[11px] text-slate-500">Voter</p>
              </div>
            </div>

            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-7 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-blue-600">Overview</p>
              <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">Welcome, {currentUser.fullName}</h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-500 md:text-base">
                Check your account status, review election activity, and access recent voting results.
              </p>
            </div>

            <div className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${isActive ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100" : "bg-red-50 text-red-700 ring-1 ring-red-100"}`}>
              <span className={`h-2 w-2 rounded-full ${isActive ? "bg-emerald-500" : "bg-red-500"}`} />
              {isActive ? "Account Active" : "Account Blocked"}
            </div>
          </div>
        </section>

        <section className="mb-7 grid gap-5 md:grid-cols-3">
          {[
            { title: "Profile", value: currentUser.fullName, icon: UserRound, tone: "blue", text: currentUser.email },
            { title: "Voting status", value: hasVoted ? "Completed" : "Pending", icon: CheckCircle2, tone: hasVoted ? "green" : "amber", text: hasVoted ? "Your vote has been submitted" : "Waiting for active election" },
            { title: "Election access", value: isActive ? "Enabled" : "Restricted", icon: LockKeyhole, tone: isActive ? "green" : "red", text: isActive ? "You can participate in elections" : "Please contact support" },
          ].map(({ title, value, icon: Icon, tone, text }) => (
            <div key={title} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">{title}</p>
                  <h3 className="mt-3 text-xl font-bold text-slate-900">{value}</h3>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                  tone === "blue" ? "bg-blue-100 text-blue-600" : tone === "green" ? "bg-emerald-100 text-emerald-600" : tone === "amber" ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-600"
                }`}>
                  <Icon size={20} />
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-500">{text}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">Results</p>
                <h3 className="mt-2 text-xl font-bold text-slate-900">Published elections</h3>
              </div>
              <button type="button" onClick={() => navigate("/voter/elections")} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:text-blue-600">
                Explore elections
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="space-y-3">
              {publishedElections.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-7 text-center">
                  <p className="text-lg font-semibold text-slate-700">No results published yet</p>
                  <p className="mt-2 text-sm text-slate-500">Results will appear here once an election is finalized.</p>
                </div>
              ) : (
                publishedElections.map((election) => (
                  <div key={election._id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-base font-semibold text-slate-900">{election.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{election.description}</p>
                    </div>
                    <button type="button" onClick={() => navigate(`/voter/results/${election._id}`)} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
                      View result
                      <ArrowRight size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                <CalendarClock size={20} />
              </div>
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">Quick actions</p>
                <h3 className="mt-2 text-xl font-bold text-slate-900">Your next steps</h3>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { label: "Browse elections", icon: Vote, route: "/voter/elections" },
                { label: "View profile", icon: UserRound, route: "/voter/profile" },
                { label: "Election results", icon: BarChart3, route: "/voter/history" },
              ].map(({ label, icon: Icon, route }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => navigate(route)}
                  className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-blue-200 hover:bg-blue-50"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                      <Icon size={16} />
                    </span>
                    <span className="font-medium text-slate-700">{label}</span>
                  </span>
                  <ArrowRight size={16} className="text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>

      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <LogOut size={20} />
            </div>
            <h3 className="text-center text-xl font-bold text-slate-900">Confirm logout</h3>
            <p className="mt-2 text-center text-sm text-slate-500">Are you sure you want to sign out of your voting account?</p>

            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => setShowLogoutModal(false)} className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100">
                Cancel
              </button>
              <button type="button" onClick={handleLogout} className="flex-1 rounded-2xl bg-red-600 px-4 py-3 text-sm font-medium text-white hover:bg-red-700">
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VoterDashboard;