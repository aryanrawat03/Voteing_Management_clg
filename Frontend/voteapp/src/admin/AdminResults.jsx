import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, TrendingUp, Users, Award, BarChart3, Download } from "lucide-react";
import { toast } from "react-toastify";

function AdminResults() {
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [chartView, setChartView] = useState('list');

  // ==========================================
  // FETCH ELECTIONS
  // ==========================================
  const fetchElections = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/elections", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch elections");

      const data = await response.json();
      const endedElections = (data.elections || []).filter(
        (e) => e.status === "ended" || e.status === "results_published"
      );
      setElections(endedElections);
    } catch (error) {
      toast.error("Failed to load elections");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FETCH RESULTS FOR SELECTED ELECTION
  // ==========================================
  const fetchResults = async (electionId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/results/${electionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch results");

      const data = await response.json();
      setResults(data.result);
    } catch (error) {
      toast.error("Failed to load results");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // PUBLISH RESULTS
  // ==========================================
  const publishResults = async (electionId) => {
    try {
      setPublishing(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/results/${electionId}/publish`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Failed to publish results");

      toast.success("Results published successfully!");
      fetchElections();
      fetchResults(electionId);
    } catch (error) {
      toast.error(error.message || "Failed to publish results");
      console.error(error);
    } finally {
      setPublishing(false);
    }
  };

  // ==========================================
  // ON MOUNT
  // ==========================================
  useEffect(() => {
    fetchElections();
  }, []);

  // ==========================================
  // HANDLE ELECTION SELECTION
  // ==========================================
  const handleSelectElection = (election) => {
    setSelectedElection(election);
    fetchResults(election._id);
  };

  return (
    <div className="min-h-screen bg gradient-to-br from-slate-900 to-slate-800">
      {/* HEADER */}
      <div className="sticky top-0 z-40 border-b border-slate-700 bg-slate-950/80 px-6 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="rounded-lg border border-slate-600 bg-slate-800 p-2 text-slate-300 hover:bg-slate-700 transition"
          >
            <ChevronLeft size={20} />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-white">Election Results</h1>
            <p className="text-base text-slate-400 mt-1">View and publish election results</p>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ELECTIONS LIST */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-slate-700 bg-slate-800 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
                <h2 className="text-xl font-bold text-white">Elections</h2>
                <p className="text-sm text-indigo-200 mt-1">
                  {elections.length} completed elections
                </p>
              </div>

              <div className="divide-y divide-slate-700 max-h-96 overflow-y-auto">
                {elections.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-base text-slate-400">No completed elections</p>
                  </div>
                ) : (
                  elections.map((election) => (
                    <button
                      key={election._id}
                      onClick={() => handleSelectElection(election)}
                      className={`w-full text-left p-4 transition ${
                        selectedElection?._id === election._id
                          ? "bg-indigo-600/30 border-l-4 border-indigo-500"
                          : "bg-slate-800 hover:bg-slate-700"
                      }`}
                    >
                      <h3 className="font-semibold text-white text-base">
                        {election.title}
                      </h3>
                      <div className="mt-2 flex items-center gap-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            election.status === "results_published"
                              ? "bg-green-900/30 text-green-300"
                              : "bg-orange-900/30 text-orange-300"
                          }`}
                        >
                          {election.status === "results_published"
                            ? "Published"
                            : "Ended"}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* RESULTS DISPLAY */}
          <div className="lg:col-span-2">
            {!selectedElection ? (
              <div className="rounded-2xl border border-slate-700 bg-slate-800 p-12 text-center">
                <TrendingUp size={48} className="mx-auto text-slate-500 mb-4" />
                <p className="text-lg text-slate-300">
                  Select an election to view results
                </p>
              </div>
            ) : loading ? (
              <div className="rounded-2xl border border-slate-700 bg-slate-800 p-12 text-center">
                <div className="inline-flex h-12 w-12 animate-spin rounded-full border-4 border-slate-600 border-t-indigo-500 mb-4" />
                <p className="text-lg text-slate-300">Loading results...</p>
              </div>
            ) : results ? (
              <div className="space-y-6">
                {/* ELECTION INFO & STATS */}
                <div className="rounded-2xl border border-slate-700 bg-slate-800 overflow-hidden">
                  <div className="bg-gradient-to r from-indigo-700 to-indigo-800 px-8 py-8">
                    <h2 className="text-3xl font-bold text-white mb-2">
                      {results.election.title}
                    </h2>
                    <p className="text-base text-indigo-100">
                      Election Results Summary
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 p-4 sm:p-8 border-b border-slate-700">
                    <div className="rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 p-6 text-center shadow-lg shadow-slate-900/20">
                      <Users size={32} className="mx-auto text-indigo-400 mb-3" />
                      <p className="text-base text-slate-300">Total Votes</p>
                      <p className="mt-2 text-4xl font-bold text-white">
                        {results.totalVotes}
                      </p>
                    </div>

                    <div className="rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 p-6 text-center shadow-lg shadow-slate-900/20">
                      <BarChart3 size={32} className="mx-auto text-purple-400 mb-3" />
                      <p className="text-base text-slate-300">Candidates</p>
                      <p className="mt-2 text-4xl font-bold text-white">
                        {results.results.length}
                      </p>
                    </div>

                    <div className="rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 p-6 text-center shadow-lg shadow-slate-900/20">
                      <TrendingUp size={32} className="mx-auto text-emerald-400 mb-3" />
                      <p className="text-base text-slate-300">Status</p>
                      <p className="mt-2 text-lg font-bold text-emerald-300 uppercase">
                        {results.election.resultsPublished ? "Published" : "Calculating"}
                      </p>
                    </div>
                  </div>

                  {/* PUBLISH BUTTON */}
                  <div className="p-8">
                    {selectedElection.status === "ended" ? (
                      <button
                        onClick={() => publishResults(selectedElection._id)}
                        disabled={publishing || results.election.resultsPublished}
                        className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-8 py-4 text-lg font-bold text-white transition hover:shadow-lg hover:shadow-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {publishing ? "Publishing..." : results.election.resultsPublished ? "✓ Results Published" : "📢 Publish Results"}
                      </button>
                    ) : (
                      <div className="rounded-lg bg-emerald-900/20 border border-emerald-600/30 px-6 py-3 text-center">
                        <p className="text-emerald-300 font-semibold">✓ Results are published and visible to voters</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* WINNER HIGHLIGHT */}
                {results.winner && (
                  <div className="rounded-2xl border-2 border-yellow-400/60 bg-gradient-to-br from-amber-100 via-yellow-200 to-yellow-300 overflow-hidden shadow-xl shadow-yellow-200/40">
                    <div className="bg-gradient-to-r from-yellow-400 to-amber-300 px-8 py-6">
                      <div className="flex items-center gap-3">
                        <Award size={36} className="text-slate-900" />
                        <div>
                          <p className="text-lg text-slate-900 font-semibold uppercase tracking-wide">ELECTION WINNER</p>
                          <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
                            {results.winner.name}
                          </h3>
                        </div>
                      </div>
                    </div>

                    <div className="p-8 bg-[#7a4b10] bg-opacity-95">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          {results.winner.party && (
                            <p className="text-xs text-yellow-100 uppercase tracking-[0.18em]">Party</p>
                          )}
                          <p className="mt-2 text-2xl font-bold text-yellow-50">
                            {results.winner.party || "Independent"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-yellow-100 uppercase tracking-[0.18em]">Vote Share</p>
                          <p className="mt-2 text-4xl font-bold text-white">
                            {results.winner.percentage}%
                          </p>
                          <p className="text-base text-yellow-50 mt-1">
                            {results.winner.votes} votes
                          </p>
                        </div>
                      </div>

                      <div className="mt-8">
                        <div className="h-4 overflow-hidden rounded-full bg-yellow-900/40 border border-yellow-200/30">
                          <div
                            className="h-full bg-gradient-to-r from-yellow-300 to-yellow-500 transition-all duration-500"
                            style={{ width: `${results.winner.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* RESULTS TABLE */}
                <div className="rounded-2xl border border-slate-700 bg-slate-800 overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-8 py-6">
                    <h3 className="text-2xl font-bold text-white">
                      Complete Results
                    </h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700 bg-slate-700/50">
                          <th className="px-8 py-4 text-left text-lg font-semibold text-slate-300">Rank</th>
                          <th className="px-8 py-4 text-left text-lg font-semibold text-slate-300">Candidate</th>
                          <th className="px-8 py-4 text-left text-lg font-semibold text-slate-300">Party</th>
                          <th className="px-8 py-4 text-center text-lg font-semibold text-slate-300">Votes</th>
                          <th className="px-8 py-4 text-center text-lg font-semibold text-slate-300">Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.results
                          .sort((a, b) => b.votes - a.votes)
                          .map((candidate, index) => (
                            <tr
                              key={candidate.candidateId}
                              className="border-b border-slate-700 hover:bg-slate-700/50 transition"
                            >
                              <td className="px-8 py-5">
                                <div className="flex items-center gap-3">
                                  <div className={`h-10 w-10 rounded-full flex items-center justify-center text-lg font-bold text-white ${
                                    index === 0 ? 'bg-yellow-600' : index === 1 ? 'bg-gray-500' : 'bg-orange-700'
                                  }`}>
                                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                                  </div>
                                </div>
                              </td>
                              <td className="px-8 py-5">
                                <p className="text-lg font-semibold text-white">
                                  {candidate.name}
                                </p>
                              </td>
                              <td className="px-8 py-5">
                                <p className="text-base text-slate-300">
                                  {candidate.party || 'Independent'}
                                </p>
                              </td>
                              <td className="px-8 py-5 text-center">
                                <p className="text-2xl font-bold text-indigo-300">
                                  {candidate.votes}
                                </p>
                              </td>
                              <td className="px-8 py-5 text-center">
                                <p className="text-xl font-bold text-white">
                                  {candidate.percentage}%
                                </p>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  {/* DETAILED BREAKDOWN */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-slate-700/30">
                    {results.results
                      .sort((a, b) => b.votes - a.votes)
                      .map((candidate, index) => (
                        <div
                          key={candidate.candidateId}
                          className="rounded-xl bg-slate-700/50 p-6 border border-slate-600"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <p className="text-sm text-slate-400 uppercase tracking-wide">
                                {index === 0 ? '🥇 1st Place' : index === 1 ? '🥈 2nd Place' : index === 2 ? '🥉 3rd Place' : `#${index + 1}`}
                              </p>
                              <h4 className="text-2xl font-bold text-white mt-2">
                                {candidate.name}
                              </h4>
                              <p className="text-base text-indigo-300 mt-1">
                                {candidate.party || 'Independent'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-slate-400">Vote Count</p>
                              <p className="text-4xl font-bold text-white mt-1">
                                {candidate.votes}
                              </p>
                            </div>
                          </div>

                          {/* PROGRESS BAR */}
                          <div className="mt-4">
                            <p className="text-sm text-slate-400 mb-2">{candidate.percentage}% of Total Votes</p>
                            <div className="h-3 overflow-hidden rounded-full bg-slate-600">
                              <div
                                className={`h-full transition-all duration-500 ${
                                  index === 0
                                    ? 'bg-gradient-to-r from-yellow-500 to-yellow-400'
                                    : 'bg-gradient-to-r from-indigo-500 to-indigo-400'
                                }`}
                                style={{ width: `${candidate.percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminResults;
