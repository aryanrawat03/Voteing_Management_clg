import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, CheckCircle2, Loader2, ShieldCheck, Vote, TrendingUp } from "lucide-react";

function VoterElectionDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [voteStatus, setVoteStatus] = useState(null);

  const token = localStorage.getItem("token");

  const fetchElection = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/elections/voter/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load election details");
      }

      setElection(data.election);
      setCandidates(data.candidates || []);
    } catch (error) {
      console.error("Fetch election details error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVoteStatus = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/votes/election/${id}/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setVoteStatus(data);
      if (data?.vote?.candidate?._id) {
        setSelectedCandidate(data.vote.candidate._id);
      }
    } catch (error) {
      console.error("Fetch vote status error:", error);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchElection();
    fetchVoteStatus();
  }, [id, token, navigate]);

  const handleVote = async () => {
    if (!selectedCandidate) return;

    try {
      setSubmitting(true);
      const response = await fetch("http://localhost:5000/api/votes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ electionId: id, candidateId: selectedCandidate }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Vote failed");
      }

      navigate("/voter/history", { state: { successMessage: "Vote submitted successfully" } });
    } catch (error) {
      console.error("Submit vote error:", error);
      alert(error.message || "Unable to submit vote");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm border border-slate-200">
          <Loader2 className="mx-auto animate-spin text-indigo-600" size={32} />
          <p className="mt-4 text-slate-600">Loading election details...</p>
        </div>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Election not found</h2>
          <button onClick={() => navigate("/voter/elections")} className="mt-5 rounded-xl bg-indigo-600 px-4 py-3 text-white font-medium">
            Back to elections
          </button>
        </div>
      </div>
    );
  }

  const hasVoted = voteStatus?.hasVoted;
  const isActive = election.status === "active";

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={() => navigate("/voter/elections")}
          className="mb-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50 p-5 md:p-7">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Election</p>
                <h1 className="mt-2 text-2xl font-bold text-slate-900 md:text-3xl">{election.title}</h1>
              </div>
              <span className="inline-flex w-fit items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                {election.status}
              </span>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <div className="rounded-xl bg-white p-3 border border-slate-200">
                <p className="text-xs uppercase tracking-wide text-slate-400">Starts</p>
                <p className="mt-2 text-sm font-semibold text-slate-700">{formatDate(election.startDate)}</p>
              </div>
              <div className="rounded-xl bg-white p-3 border border-slate-200">
                <p className="text-xs uppercase tracking-wide text-slate-400">Ends</p>
                <p className="mt-2 text-sm font-semibold text-slate-700">{formatDate(election.endDate)}</p>
              </div>
              <div className="rounded-xl bg-white p-3 border border-slate-200">
                <p className="text-xs uppercase tracking-wide text-slate-400">Voting</p>
                <p className="mt-2 text-sm font-semibold text-slate-700">{hasVoted ? "Submitted" : isActive ? "Open" : "Closed"}</p>
              </div>
            </div>
          </div>

          <div className="p-5 md:p-7">
            <div className="mb-5 flex items-center gap-3 text-slate-700">
              <CalendarDays size={18} className="text-indigo-600" />
              <span className="font-medium">Election Information</span>
            </div>
            <p className="leading-7 text-slate-600">{election.description}</p>
          </div>
        </div>

        <div className="mt-8">
          <div className="mb-4 flex items-center gap-3">
            <Vote className="text-indigo-600" size={20} />
            <h2 className="text-2xl font-bold text-slate-900">Candidates</h2>
          </div>

          {hasVoted ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
              <CheckCircle2 className="mx-auto text-emerald-600" size={28} />
              <h3 className="mt-3 text-xl font-bold text-slate-900">Your vote has already been recorded</h3>
              <p className="mt-2 text-sm text-slate-600">You cannot submit another vote for this election.</p>
            </div>
          ) : !isActive ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
                <ShieldCheck className="mx-auto text-amber-600" size={28} />
                <h3 className="mt-3 text-xl font-bold text-slate-900">Voting is not open</h3>
                <p className="mt-2 text-sm text-slate-600">This election is currently unavailable for voting.</p>
              </div>

              {/* VIEW RESULTS BUTTON */}
              {(election.status === "ended" || election.status === "results_published") && (
                <button
                  onClick={() => navigate(`/voter/results/${id}`)}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-3 text-base font-semibold text-white transition hover:shadow-lg hover:shadow-indigo-500/50"
                >
                  <TrendingUp size={20} />
                  View Election Results
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {candidates.map((candidate) => (
                <label
                  key={candidate._id}
                  className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition ${
                    selectedCandidate === candidate._id ? "border-indigo-500 bg-indigo-50 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="candidate"
                    checked={selectedCandidate === candidate._id}
                    onChange={() => setSelectedCandidate(candidate._id)}
                    className="mt-1 h-4 w-4 text-indigo-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-lg font-bold text-slate-900">{candidate.name}</h3>
                      {candidate.party && <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">{candidate.party}</span>}
                    </div>
                    <p className="mt-2 text-sm text-slate-500">{candidate.position || "Candidate"}</p>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{candidate.manifesto || candidate.description || "No manifesto provided."}</p>
                  </div>
                </label>
              ))}

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={handleVote}
                  disabled={!selectedCandidate || submitting}
                  className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {submitting ? "Submitting..." : "Submit Vote"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VoterElectionDetails;
