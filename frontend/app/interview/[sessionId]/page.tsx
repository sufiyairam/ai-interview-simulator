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

type Question = {
  id: string;
  question_text: string;
  skill_tag: string;
  answer: Answer | null;
};

type InterviewSession = {
  id: string;
  status: string;
  questions: Question[];
};

type AnswerResponse = {
  id: string;
  alignment_score: number;
  feedback: string;
};

export default function InterviewPage() {
  const params = useParams();
  const router = useRouter();

  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInterview() {
      try {
        setLoading(true);
        setError("");

        const data = await apiRequest<InterviewSession>(
          `/interview-sessions/${sessionId}`
        );

        setSession(data);

        // Find the first question that has not been answered.
        const firstUnansweredIndex = data.questions.findIndex(
          (question) => !question.answer
        );

        // If every question has already been answered,
        // take the user directly to the results page.
        if (firstUnansweredIndex === -1 && data.questions.length > 0) {
          router.replace(`/results/${sessionId}`);
          return;
        }

        // Resume from the first unanswered question.
        if (firstUnansweredIndex !== -1) {
          setCurrentQuestionIndex(firstUnansweredIndex);
        }
      } catch (err) {
        console.error("Failed to load interview:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load the interview."
        );
      } finally {
        setLoading(false);
      }
    }

    if (sessionId) {
      loadInterview();
    }
  }, [sessionId, router]);

  async function handleSubmitAnswer() {
    if (!session) return;

    const currentQuestion = session.questions[currentQuestionIndex];

    if (!answer.trim()) {
      setError("Please enter your answer before continuing.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const result = await apiRequest<AnswerResponse>("/answers", {
        method: "POST",
        body: JSON.stringify({
          question_id: currentQuestion.id,
          transcript: answer,
        }),
      });

      console.log("Answer submitted successfully:", result);

      // Update the current question locally so that
      // the answer is marked as completed immediately.
      const updatedQuestions = [...session.questions];

      updatedQuestions[currentQuestionIndex] = {
        ...currentQuestion,
        answer: {
          id: result.id,
          question_id: currentQuestion.id,
          transcript: answer,
          alignment_score: result.alignment_score,
          feedback: result.feedback,
        },
      };

      setSession({
        ...session,
        questions: updatedQuestions,
      });

      // Find the next unanswered question.
      const nextUnansweredIndex = updatedQuestions.findIndex(
        (question, index) =>
          index > currentQuestionIndex && !question.answer
      );

      // If there is another unanswered question, move to it.
      if (nextUnansweredIndex !== -1) {
        setCurrentQuestionIndex(nextUnansweredIndex);
        setAnswer("");
        return;
      }

      // Check whether every question is now answered.
      const allQuestionsAnswered = updatedQuestions.every(
        (question) => question.answer
      );

      if (allQuestionsAnswered) {
        router.push(`/results/${sessionId}`);
      }
    } catch (err) {
      console.error("Failed to submit answer:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit your answer."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
        <div className="text-center">
          <div className="text-2xl font-semibold text-gray-800">
            Preparing your AI interview...
          </div>

          <p className="mt-3 text-gray-600">
            Loading your personalized questions 🤖
          </p>
        </div>
      </main>
    );
  }

  if (error && !session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-md">
          <h1 className="text-2xl font-bold text-red-600">
            Something went wrong
          </h1>

          <p className="mt-4 text-gray-600">{error}</p>

          <button
            onClick={() => router.push("/interview")}
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Start a New Interview
          </button>
        </div>
      </main>
    );
  }

  if (!session || session.questions.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
        <div className="rounded-2xl bg-white p-8 text-center shadow-md">
          <h1 className="text-2xl font-bold text-gray-900">
            No Questions Found
          </h1>

          <p className="mt-3 text-gray-600">
            This interview session does not contain any questions.
          </p>
        </div>
      </main>
    );
  }

  const currentQuestion = session.questions[currentQuestionIndex];

  const answeredQuestions = session.questions.filter(
    (question) => question.answer
  ).length;

  const progress =
    ((answeredQuestions + 1) / session.questions.length) * 100;

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        {/* Header */}

        <div className="mb-8 flex items-start justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              AI Virtual Interview
            </p>

            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              Interview in Progress 🤖
            </h1>

            <p className="mt-3 text-gray-600">
              Answer each question as you would in a real interview.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/history")}
            className="rounded-xl border border-blue-600 px-4 py-3 font-semibold text-blue-600 transition hover:bg-blue-50"
          >
            Interview History 📊
          </button>
        </div>

        {/* Progress */}

        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between text-sm font-medium text-gray-600">
            <span>
              Question {currentQuestionIndex + 1} of{" "}
              {session.questions.length}
            </span>

            <span>
              {answeredQuestions} Answered
            </span>
          </div>

          <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}

        <div className="rounded-2xl bg-white p-8 shadow-md">
          <div className="mb-6">
            <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
              {currentQuestion.skill_tag}
            </span>
          </div>

          <h2 className="text-2xl font-bold leading-relaxed text-gray-900">
            {currentQuestion.question_text}
          </h2>

          {/* Answer */}

          <div className="mt-8">
            <label className="block text-lg font-semibold text-gray-800">
              Your Answer
            </label>

            <p className="mt-1 text-sm text-gray-500">
              Take your time and answer as you would in a real interview.
            </p>

            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here..."
              rows={10}
              disabled={submitting}
              className="mt-4 w-full resize-none rounded-xl border border-gray-300 px-5 py-4 text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
            />
          </div>

          {/* Error */}

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          {/* Submit */}

          <button
            onClick={handleSubmitAnswer}
            disabled={submitting}
            className="mt-6 w-full rounded-xl bg-blue-600 py-4 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? "Analyzing Your Answer..."
              : currentQuestionIndex === session.questions.length - 1
                ? "Finish Interview 🎉"
                : "Submit & Next Question →"}
          </button>
        </div>
      </div>
    </main>
  );
}