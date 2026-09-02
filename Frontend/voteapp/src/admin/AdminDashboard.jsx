import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Vote,
  Users,
  UserRound,
  BarChart3,
  LogOut,
  Plus,
  ShieldCheck,
  Bell,
  ArrowUpRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { clearAuthSession, getStoredUser } from "../components/ProtectedRoute";

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalVoters: 0,
    verifiedVoters: 0,
    totalElections: 0,
    activeElections: 0,
    upcomingElections: 0,
    completedElections: 0,
    totalCandidates: 0,
    totalVotes: 0,
  });
  const [recentElections, setRecentElections] = useState([]);
  const [recentVoters, setRecentVoters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getStoredUser();

    if (!currentUser || currentUser.role !== "admin") {
      clearAuthSession();
      navigate("/login", { replace: true });
      return;
    }

    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          clearAuthSession();
          navigate("/login", { replace: true });
          return;
        }

        const response = await fetch("http://localhost:5000/api/admin/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to load dashboard");
        }

        setStats(data.stats || stats);
        setRecentElections(data.recentElections || []);
        setRecentVoters(data.recentVoters || []);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [navigate]);

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login", { replace: true });
  };

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-";

  const navItems = [
    { label: "Dashboard", route: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Elections", route: "/admin/elections", icon: Vote },
    { label: "Candidates", route: "/admin/candidates", icon: UserRound },
    { label: "Voters", route: "/admin/voters", icon: Users },
    { label: "Results", route: "/admin/results", icon: BarChart3 },
  ];

  const statCards = [
    { label: "Elections", value: stats.totalElections, icon: Vote, tone: "blue" },
    { label: "Candidates", value: stats.totalCandidates, icon: UserRound, tone: "green" },
    { label: "Voters", value: stats.totalVoters, icon: Users, tone: "purple" },
    { label: "Votes Cast", value: stats.totalVotes, icon: BarChart3, tone: "orange" },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 flex-col bg-slate-700 text-white lg:flex">
          <div className="border-b border-slate-800 px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-900/40">
                <Vote size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold">VoteManage</h1>
                <p className="text-xs text-slate-400">Admin Panel</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-2 px-4 py-6">
            {navItems.map(({ label, route, icon: Icon }) => {
              const isActive = route === "/admin/dashboard" || window.location.pathname.startsWith(route);
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => navigate(route)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </button>
              );
            })}
          </nav>

          <div className="border-t border-slate-800 px-4 py-5">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-red-300 transition hover:bg-red-500/10 hover:text-red-200"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <header className="mb-7 rounded-3xl border border-slate-200 bg-white/90 px-4 py-4 shadow-sm backdrop-blur sm:px-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-600">Overview</p>
                  <h2 className="mt-2 text-3xl font-bold text-slate-900">Admin Dashboard</h2>
                </div>

                <div className="flex items-center gap-3 self-start md:self-auto">
                  <button type="button" className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-blue-200 hover:text-blue-600">
                    <Bell size={18} />
                  </button>

                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                      {getStoredUser()?.fullName?.charAt(0)?.toUpperCase() || "A"}
                    </div>
                    <div className="leading-tight">
                      <p className="text-sm font-semibold text-slate-900">{getStoredUser()?.fullName || "Admin"}</p>
                      <p className="text-[11px] text-slate-500">Administrator</p>
                    </div>
                  </div>
                </div>
              </div>
            </header>

            <section className="mb-7 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {statCards.map(({ label, value, icon: Icon, tone }) => (
                <div
                  key={label}
                  onClick={() => {
                    if (label === "Elections") navigate("/admin/elections");
                    if (label === "Candidates") navigate("/admin/candidates");
                    if (label === "Voters") navigate("/admin/voters");
                    if (label === "Votes Cast") navigate("/admin/results");
                  }}
                  className="cursor-pointer rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">{label}</p>
                      <h3 className="mt-3 text-3xl font-bold text-slate-900">{loading ? "—" : value}</h3>
                    </div>
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                      tone === "blue" ? "bg-blue-100 text-blue-600" :
                      tone === "green" ? "bg-emerald-100 text-emerald-600" :
                      tone === "purple" ? "bg-violet-100 text-violet-600" :
                      "bg-amber-100 text-amber-600"
                    }`}>
                      <Icon size={22} />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-500">
                    <span className="inline-flex items-center gap-1 text-emerald-600">
                      <ArrowUpRight size={14} />
                      Live
                    </span>
                    <span>Updated today</span>
                  </div>
                </div>
              ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">Operations</p>
                    <h3 className="mt-2 text-xl font-bold text-slate-900">Recent Elections</h3>
                  </div>
                  <button type="button" onClick={() => navigate("/admin/elections")} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 hover:border-blue-200 hover:text-blue-600">
                    <Plus size={16} />
                    New election
                  </button>
                </div>

                <div className="space-y-3">
                  {recentElections.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-7 text-center">
                      <p className="text-lg font-semibold text-slate-700">No elections yet</p>
                      <p className="mt-2 text-sm text-slate-500">Create your first election to start managing voting activity.</p>
                    </div>
                  ) : (
                    recentElections.map((election) => (
                      <div key={election._id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-base font-semibold text-slate-900">{election.title}</p>
                          <p className="mt-1 text-xs text-slate-500">{formatDate(election.startDate)} → {formatDate(election.endDate)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-blue-700 capitalize">
                            {election.status ? election.status.replace("_", " ") : "Draft"}
                          </span>
                          <button type="button" onClick={() => navigate(`/admin/elections/${election._id}`)} className="text-sm font-medium text-blue-600 hover:text-blue-700">
                            View
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">Membership</p>
                    <h3 className="mt-2 text-xl font-bold text-slate-900">Recent Voters</h3>
                  </div>
                  <button type="button" onClick={() => navigate("/admin/voters")} className="text-sm font-medium text-blue-600 hover:text-blue-700">
                    View all
                  </button>
                </div>

                <div className="space-y-3">
                  {recentVoters.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-7 text-center">
                      <p className="text-lg font-semibold text-slate-700">No voters registered yet</p>
                    </div>
                  ) : (
                    recentVoters.map((voter) => (
                      <div key={voter._id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                            {voter.fullName?.charAt(0)?.toUpperCase() || "V"}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{voter.fullName}</p>
                            <p className="text-xs text-slate-500">{voter.email}</p>
                          </div>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${voter.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                          {voter.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            <section className="mt-6 grid gap-5 md:grid-cols-3">
              {[
                { title: "Security", icon: ShieldCheck, text: "Maintain secure admin and voter access" },
                { title: "Election status", icon: Vote, text: "Monitor live election timelines and updates" },
                { title: "Results", icon: BarChart3, text: "Track outcomes and view published results" },
              ].map(({ title, icon: Icon, text }) => (
                <div key={title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                    <Icon size={20} />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">{title}</h4>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
                </div>
              ))}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;