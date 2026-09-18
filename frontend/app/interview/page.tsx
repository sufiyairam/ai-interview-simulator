"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

export default function InterviewSetup() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      // STEP 1: Create or get the user
      const user = await apiRequest<{ id: string }>("/users", {
        method: "POST",
        body: JSON.stringify({
          full_name: fullName,
          email: email,
        }),
      });

      // Save the user ID so we can later load interview history.
      localStorage.setItem("user_id", user.id);

      // STEP 2: Create the job description
      const jobDescriptionData = await apiRequest<{ id: string }>(
        "/job-descriptions",
        {
          method: "POST",
          body: JSON.stringify({
            user_id: user.id,
            title: jobTitle,
            company: company,
            raw_text: jobDescription,
          }),
        }
      );

      // STEP 3: Upload the resume
      if (!resumeFile) {
        throw new Error("Please upload your resume.");
      }

      const formData = new FormData();
      formData.append("user_id", user.id);
      formData.append("file", resumeFile);

     await apiRequest(`/resumes?user_id=${user.id}`, {
        method: "POST",
        body: formData,
      });

      // STEP 4: Create the interview session
      const interviewSession = await apiRequest<{ id: string }>(
        "/interview-sessions",
        {
          method: "POST",
          body: JSON.stringify({
            user_id: user.id,
            job_description_id: jobDescriptionData.id,
            num_questions: numQuestions,
          }),
        }
      );

      console.log("Interview created successfully:", interviewSession);

      // Move to the interview page
      router.push(`/interview/${interviewSession.id}`);
    } catch (err) {
      console.error("Interview creation error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while creating your interview."
      );
    } finally {
      setLoading(false);
    }
  }

  function goToHistory() {
    const userId = localStorage.getItem("user_id");

    if (!userId) {
      setError(
        "Please start an interview first so we can identify your interview history."
      );
      return;
    }

    router.push("/history");
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              Set Up Your Interview
            </h1>

            <p className="mt-3 text-gray-600">
              Tell us about yourself and the job you want to practice for.
            </p>
          </div>

          <button
            type="button"
            onClick={goToHistory}
            className="rounded-xl border border-blue-600 px-4 py-3 font-semibold text-blue-600 transition hover:bg-blue-50"
          >
            Interview History 📊
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-10 space-y-6 rounded-2xl bg-white p-8 shadow-md"
        >
          {/* Full Name */}
          <div>
            <label className="block font-semibold text-gray-700">
              Full Name
            </label>

            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              required
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block font-semibold text-gray-700">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* Job Title */}
          <div>
            <label className="block font-semibold text-gray-700">
              Job Title
            </label>

            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Example: Software Developer"
              required
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* Company */}
          <div>
            <label className="block font-semibold text-gray-700">
              Company
            </label>

            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Example: Google"
              required
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* Job Description */}
          <div>
            <label className="block font-semibold text-gray-700">
              Job Description
            </label>

            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              required
              rows={8}
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* Resume Upload */}
          <div>
            <label className="block font-semibold text-gray-700">
              Resume (PDF)
            </label>

            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) =>
                setResumeFile(e.target.files?.[0] || null)
              }
              required
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3"
            />

            <p className="mt-2 text-sm text-gray-500">
              Upload your resume in PDF format.
            </p>
          </div>

          {/* Number of Questions */}
          <div>
            <label className="block font-semibold text-gray-700">
              Number of Questions
            </label>

            <select
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value={3}>3 Questions</option>
              <option value={5}>5 Questions</option>
              <option value={10}>10 Questions</option>
            </select>
          </div>

          {/* Error */}
          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-4 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Creating Your Interview..."
              : "Start My Interview 🤖"}
          </button>
        </form>
      </div>
    </main>
  );
}