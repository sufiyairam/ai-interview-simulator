"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

type Answer = {
  id: string;
  question_id: string;
  transcript: string;
  alignment_score: number | null;
  feedback: string | null;
};

type InterviewQuestion = {
  id: string;
  order_index: number;
  question_text: string;
  skill_tag: string | null;
  answer: Answer | null;
};

type InterviewSession = {
  id: string;
  status: string;
  overall_score: number | null;
  overall_summary: string | null;
  questions: InterviewQuestion[];
};

function getScoreMessage(score: number | null) {
  if (score === null) {
    return "Your interview has been completed.";
  }

  if (score >= 90) {
    return "Excellent work! You demonstrated strong interview skills.";
  }

  if (score >= 75) {
    return "Great job! You have a strong foundation with room to improve.";
  }

  if (score >= 60) {
    return "Good effort! Keep practicing to build more confidence.";
  }

  return "Keep practicing. Every interview is an opportunity to improve.";
}

function getScoreStyle(score: number | null) {
  if (score === null) {
    return "bg-gray-100 text-gray-600";
  }

  if (score >= 75) {
    return "bg-green-100 text-green-700";
  }

  if (score >= 60) {
    return "bg-yellow-100 text-yellow-700";
  }

  return "bg-red-100 text-red-700";
}

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();

  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadResults() {
      try {
        setLoading(true);
        setError("");

        const data = await apiRequest<InterviewSession>(
          `/interview-sessions/${sessionId}`
        );

        setSession(data);
      } catch (err) {
        console.error("Failed to load results:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load your interview results."
        );
      } finally {
        setLoading(false);
      }
    }

    if (sessionId) {
      loadResults();
    }
  }, [sessionId]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-3xl">
            📊
          </div>

          <h1 className="mt-6 text-2xl font-bold text-gray-900">
            Preparing Your Results
          </h1>

          <p className="mt-3 text-gray-600">
            Loading your interview performance and AI feedback...
          </p>
        </div>
      </main>
    );
  }

  if (error || !session) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-md">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl">
            ⚠️
          </div>

          <h1 className="mt-6 text-2xl font-bold text-gray-900">
            Unable to Load Results
          </h1>

          <p className="mt-4 text-gray-600">
            {error || "Interview results were not found."}
          </p>

          <button
            onClick={() => router.push("/")}
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </main>
    );
  }

  const score =
    session.overall_score !== null
      ? Math.round(session.overall_score)
      : null;

  const totalQuestions = session.questions.length;

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <section className="text-center">
          <div className="inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600">
            🤖 AI INTERVIEW SIMULATOR
          </div>

          <h1 className="mt-5 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Your Interview Results 🎉
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-gray-600">
            Review your performance, understand your strengths, and use the
            AI feedback to improve for your next interview.
          </p>
        </section>

        {/* Overall Score Card */}
        <section className="mt-10 overflow-hidden rounded-3xl bg-white shadow-lg">
          <div className="bg-blue-600 px-8 py-6 text-center text-white">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-100">
              Interview Completed
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Great job finishing your interview! 🎉
            </h2>
          </div>

          <div className="p-8 text-center sm:p-12">
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Overall Score
            </p>

            <div className="mt-5 flex justify-center">
              <div className="flex h-40 w-40 flex-col items-center justify-center rounded-full border-8 border-blue-100 bg-blue-50">
                <span className="text-5xl font-bold text-blue-600">
                  {score !== null ? score : "N/A"}
                </span>

                <span className="mt-1 text-sm font-medium text-gray-500">
                  out of 100
                </span>
              </div>
            </div>

            <p className="mx-auto mt-6 max-w-2xl text-lg font-medium text-gray-800">
              {getScoreMessage(score)}
            </p>

            {session.overall_summary && (
              <p className="mx-auto mt-4 max-w-2xl leading-7 text-gray-600">
                {session.overall_summary}
              </p>
            )}

            <div className="mx-auto mt-8 grid max-w-2xl gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-gray-50 p-5">
                <p className="text-sm font-medium text-gray-500">
                  Questions Completed
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {totalQuestions}
                </p>
              </div>

              <div className="rounded-2xl bg-gray-50 p-5">
                <p className="text-sm font-medium text-gray-500">
                  Average Alignment
                </p>

                <p className="mt-2 text-3xl font-bold text-blue-600">
                  {score !== null ? `${score}%` : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Performance Summary */}
        <section className="mt-10">
          <div className="mb-6">
            <p className="font-semibold text-blue-600">
              PERFORMANCE BREAKDOWN
            </p>

            <h2 className="mt-2 text-3xl font-bold text-gray-900">
              Question-by-Question Feedback
            </h2>

            <p className="mt-2 text-gray-600">
              Review each answer and learn how you can make your responses
              stronger.
            </p>
          </div>

          <div className="space-y-6">
            {session.questions.map((question, index) => {
              const questionScore =
                question.answer?.alignment_score !== null &&
                question.answer?.alignment_score !== undefined
                  ? Math.round(question.answer.alignment_score)
                  : null;

              return (
                <article
                  key={question.id}
                  className="overflow-hidden rounded-3xl bg-white shadow-md transition hover:shadow-lg"
                >
                  {/* Question Header */}
                  <div className="border-b border-gray-100 px-7 py-6">
                    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                      <div className="flex gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white">
                          {index + 1}
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-gray-500">
                            QUESTION {index + 1}
                          </p>

                          {question.skill_tag && (
                            <span className="mt-2 inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-600">
                              {question.skill_tag}
                            </span>
                          )}
                        </div>
                      </div>

                      <div
                        className={`rounded-2xl px-5 py-3 text-center ${getScoreStyle(
                          questionScore
                        )}`}
                      >
                        <p className="text-xs font-semibold uppercase tracking-wide">
                          Score
                        </p>

                        <p className="mt-1 text-2xl font-bold">
                          {questionScore !== null
                            ? `${questionScore}/100`
                            : "N/A"}
                        </p>
                      </div>
                    </div>

                    <h3 className="mt-6 text-xl font-bold leading-relaxed text-gray-900">
                      {question.question_text}
                    </h3>
                  </div>

                  {/* Answer */}
                  <div className="px-7 py-6">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">💬</span>

                      <h4 className="font-bold text-gray-900">
                        Your Answer
                      </h4>
                    </div>

                    <div className="mt-4 rounded-2xl bg-gray-50 p-5">
                      <p className="whitespace-pre-wrap leading-7 text-gray-700">
                        {question.answer?.transcript ||
                          "No answer was recorded."}
                      </p>
                    </div>
                  </div>

                  {/* AI Feedback */}
                  <div className="border-t border-gray-100 bg-blue-50/50 px-7 py-6">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🤖</span>

                      <h4 className="font-bold text-gray-900">
                        AI Feedback
                      </h4>
                    </div>

                    <div className="mt-4 rounded-2xl border border-blue-100 bg-white p-5">
                      <p className="whitespace-pre-wrap leading-7 text-gray-700">
                        {question.answer?.feedback ||
                          "Feedback is not available."}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Improvement Tip */}
        <section className="mt-10 rounded-3xl border border-blue-100 bg-blue-50 p-7 text-center">
          <div className="text-3xl">💡</div>

          <h2 className="mt-3 text-xl font-bold text-gray-900">
            Keep Practicing!
          </h2>

          <p className="mx-auto mt-2 max-w-2xl leading-7 text-gray-600">
            Interview skills improve with practice. Review the AI feedback,
            identify the areas you want to strengthen, and try another
            interview to track your progress.
          </p>
        </section>

        {/* Actions */}
        <section className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <button
            onClick={() => router.push("/")}
            className="rounded-xl border border-gray-300 bg-white px-8 py-4 font-semibold text-gray-700 transition hover:bg-gray-100"
          >
            ← Back to Home
          </button>

          <button
            onClick={() => router.push("/interview")}
            className="rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white shadow-md transition hover:bg-blue-700"
          >
            Start Another Interview 🤖
          </button>
        </section>
      </div>
    </main>
  );
}