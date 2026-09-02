import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarDays, CheckCircle2, Filter, Loader2, Search, Vote } from "lucide-react";

function VoterElections() {
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const token = localStorage.getItem("token");

  const fetchElections = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("http://localhost:5000/api/elections/voter/list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load elections");
      }

      setElections(data.elections || []);
    } catch (error) {
      console.error("Fetch voter elections error:", error);
      setError(error.message || "Unable to load elections");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchElections();
  }, [token, navigate]);

  const filteredElections = useMemo(() => {
    return elections.filter((election) => {
      const matchesSearch =
        election.title?.toLowerCase().includes(search.toLowerCase()) ||
        election.description?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        status === "all" ||
        election.status === status ||
        election.votingStatus === status;

      return matchesSearch && matchesStatus;
    });
  }, [elections, search, status]);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  const getStatusLabel = (statusValue) => {
    if (statusValue === "upcoming") return "Upcoming";
    if (statusValue === "active") return "Active";
    if (statusValue === "ended") return "Ended";
    if (statusValue === "results_published") return "Results Published";
    return "Closed";
  };

  const getActionLabel = (election) => {
    if (election.votingStatus === "already_voted") return "Vote Submitted";
    if (election.status === "active") return "Vote Now";
    if (election.status === "results_published") return "View Results";
    return "View Details";
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <Loader2 className="mx-auto animate-spin text-blue-600" size={30} />
          <p className="mt-4 text-slate-600">Loading elections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate("/voter/dashboard")}
              className="mb-4 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-200 hover:text-blue-700"
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <h1 className="text-3xl font-bold text-slate-900">Elections</h1>
            <p className="mt-1 text-sm text-slate-500">Browse all current and upcoming elections</p>
          </div>
        </div>

        <div className="mb-6 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search election title or description"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div className="relative w-full md:min-w- [200px]">
              <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              >
                <option value="all">All statuses</option>
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="ended">Ended</option>
                <option value="results_published">Results Published</option>
              </select>
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-[28px] border border-red-200 bg-white p-10 text-center shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800">Unable to load elections</h3>
            <p className="mt-2 text-sm text-slate-500">{error}</p>
            <button
              type="button"
              onClick={fetchElections}
              className="mt-5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Try again
            </button>
          </div>
        ) : filteredElections.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <Vote className="mx-auto text-slate-400" size={38} />
            <h3 className="mt-4 text-lg font-semibold text-slate-800">No elections found</h3>
            <p className="mt-2 text-sm text-slate-500">Try a different search or filter.</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredElections.map((election) => (
              <div key={election._id} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="border-b border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400">Election</p>
                      <h3 className="mt-2 text-xl font-bold text-slate-900">{election.title}</h3>
                    </div>
                    <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
                      {getStatusLabel(election.status)}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <p className="text-sm leading-6 text-slate-600">{election.description}</p>

                  <div className="mt-4 space-y-3 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={15} className="text-slate-400" />
                      <span>{formatDate(election.startDate)}</span>
                      <span>→</span>
                      <span>{formatDate(election.endDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={15} className="text-emerald-500" />
                      <span>{election.hasVoted ? "You already voted" : "Not voted yet"}</span>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (election.status === "results_published") {
                          navigate(`/voter/results/${election._id}`);
                        } else {
                          navigate(`/voter/elections/${election._id}`);
                        }
                      }}
                      className="flex-1 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                    >
                      {getActionLabel(election)}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default VoterElections;
