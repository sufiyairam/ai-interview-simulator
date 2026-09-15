"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

type JobDescription = {
  id: string;
  title: string;
  company: string | null;
};

type InterviewSession = {
  id: string;
  status: string;
  overall_score: number | null;
  overall_summary: string | null;
  completed_at: string | null;
  job_description: JobDescription | null;
};

export default function InterviewHistoryPage() {
  const router = useRouter();

  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadHistory() {
      const userId = localStorage.getItem("user_id");

      if (!userId) {
        setError(
          "No user information was found. Please start an interview first."
        );
        setLoading(false);
        return;
      }

      try {
        const data = await apiRequest<InterviewSession[]>(
          `/users/${userId}/interview-history`
        );

        setSessions(data);
      } catch (err) {
        console.error("Failed to load interview history:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load interview history."
        );
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, []);

  async function handleDelete(sessionId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this interview? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(sessionId);
      setError("");

      await apiRequest<{ message: string }>(
        `/interview-sessions/${sessionId}`,
        {
          method: "DELETE",
        }
      );

      setSessions((previousSessions) =>
        previousSessions.filter((session) => session.id !== sessionId)
      );
    } catch (err) {
      console.error("Failed to delete interview:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete the interview."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              Interview History 📊
            </h1>

            <p className="mt-3 text-gray-600">
              Review your previous interview practice sessions and track your
              progress.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/interview")}
            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Start New Interview 🤖
          </button>
        </div>

        {loading && (
          <div className="mt-10 rounded-2xl bg-white p-8 text-center shadow-md">
            <p className="text-gray-600">
              Loading your interview history...
            </p>
          </div>
        )}

        {error && !loading && (
          <div className="mt-10 rounded-2xl bg-red-50 p-6 text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && sessions.length === 0 && (
          <div className="mt-10 rounded-2xl bg-white p-10 text-center shadow-md">
            <div className="text-5xl">🎯</div>

            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              No interviews yet
            </h2>

            <p className="mt-2 text-gray-600">
              Start your first AI-powered interview and your results will
              appear here.
            </p>

            <button
              type="button"
              onClick={() => router.push("/interview")}
              className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Start Your First Interview
            </button>
          </div>
        )}

        {!loading && sessions.length > 0 && (
          <div className="mt-10 space-y-5">
            {sessions.map((session, index) => (
              <div
                key={session.id}
                className="rounded-2xl bg-white p-6 shadow-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Interview #{sessions.length - index}
                    </p>

                    <h2 className="mt-2 text-xl font-bold text-gray-900">
                      {session.job_description?.title ||
                        "AI Interview Practice"}
                    </h2>

                    {session.job_description?.company && (
                      <p className="mt-1 text-sm font-medium text-blue-600">
                        🏢 {session.job_description.company}
                      </p>
                    )}

                    <p className="mt-3 text-sm text-gray-500">
                      Status:{" "}
                      <span className="font-semibold capitalize">
                        {session.status.replace("_", " ")}
                      </span>
                    </p>

                    {session.completed_at && (
                      <p className="mt-1 text-sm text-gray-500">
                        Completed:{" "}
                        {new Date(session.completed_at).toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div className="rounded-2xl bg-blue-50 px-6 py-4 text-center">
                    <p className="text-sm text-gray-600">
                      Overall Score
                    </p>

                    <p className="mt-1 text-3xl font-bold text-blue-600">
                      {session.overall_score !== null
                        ? `${Math.round(session.overall_score)}%`
                        : "—"}
                    </p>
                  </div>
                </div>

                {session.overall_summary && (
                  <p className="mt-5 border-t border-gray-100 pt-4 text-gray-600">
                    {session.overall_summary}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => router.push(`/interview/${session.id}`)}
                    disabled={deletingId === session.id}
                    className="rounded-lg border border-blue-600 px-4 py-2 font-semibold text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    View Interview
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(session.id)}
                    disabled={deletingId === session.id}
                    className="rounded-lg border border-red-500 px-4 py-2 font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deletingId === session.id
                      ? "Deleting..."
                      : "🗑️ Delete Interview"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}