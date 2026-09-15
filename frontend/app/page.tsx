import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
          <div className="max-w-3xl">
            <p className="mb-4 font-semibold text-blue-600">
              AI-POWERED INTERVIEW PRACTICE
            </p>

            <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Practice Interviews.
              <br />
              Build Confidence.
              <br />
              Get Better.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
              Practice realistic job interviews with AI, receive personalized
              feedback, and improve your confidence before your real interview.
            </p>

            <div className="mt-8 flex justify-center gap-4">
              <Link
                href="/interview"
                className="rounded-xl bg-blue-600 px-7 py-3 font-semibold text-white shadow-md transition hover:bg-blue-700"
              >
                Start Your Interview
              </Link>

              <a
                href="#how-it-works"
                className="rounded-xl border border-gray-300 bg-white px-7 py-3 font-semibold text-gray-700 transition hover:bg-gray-100"
              >
                Learn More
              </a>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-white px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-gray-900">
                Everything You Need to Prepare
              </h2>

              <p className="mt-4 text-gray-600">
                Practice smarter and understand exactly where you can improve.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900">
                  🤖 AI Interviewer
                </h3>

                <p className="mt-3 text-gray-600">
                  Practice with AI-generated interview questions based on your
                  role and job description.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900">
                  📊 Smart Feedback
                </h3>

                <p className="mt-3 text-gray-600">
                  Receive detailed feedback and scores to understand your
                  strengths and areas for improvement.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900">
                  🎯 Personalized Practice
                </h3>

                <p className="mt-3 text-gray-600">
                  Practice interviews tailored to your resume, skills, and job
                  description.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="bg-gray-50 px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-3xl font-bold text-gray-900">
              How It Works
            </h2>

            <div className="mt-12 grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
                  1
                </div>

                <h3 className="mt-4 text-xl font-semibold">
                  Add Your Details
                </h3>

                <p className="mt-2 text-gray-600">
                  Tell us about the role and upload your information.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
                  2
                </div>

                <h3 className="mt-4 text-xl font-semibold">
                  Take the Interview
                </h3>

                <p className="mt-2 text-gray-600">
                  Answer AI-generated questions in a realistic interview.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
                  3
                </div>

                <h3 className="mt-4 text-xl font-semibold">
                  Get Feedback
                </h3>

                <p className="mt-2 text-gray-600">
                  Review your performance and improve for your real interview.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}