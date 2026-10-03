import { useState } from "react";
import InputComp from "./Comp/InputComp";
import DisplayComp from "./Comp/DisplayComp";

function App() {
  const [aiRes, setAiRes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">

      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5">

          <p className="text-sm font-semibold tracking-widest text-indigo-600 uppercase">
            AI Powered
          </p>

          <h1 className="text-3xl font-bold text-slate-900 mt-1">
            ATS Resume Checker
          </h1>

          <p className="text-slate-500 mt-1">
            Check how well your resume matches a job description.
          </p>

        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <InputComp
            setAiRes={setAiRes}
            loading={loading}
            setLoading={setLoading}
            error={error}
            setError={setError}
          />

          <DisplayComp
            aiRes={aiRes}
            loading={loading}
          />

        </div>

      </main>
    </div>
  );
}

export default App;