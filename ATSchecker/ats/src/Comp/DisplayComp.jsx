function DisplayComp({ aiRes, loading }) {

  // Gemini API is running
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 min-h-[500px]">

        <p className="text-sm font-bold tracking-wider text-indigo-600 uppercase">
          Analysis
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-1">
          Resume Report
        </h2>

        <div className="flex flex-col items-center justify-center h-72">

          <div
            className="w-10 h-10 border-4 border-indigo-100
                       border-t-indigo-600 rounded-full animate-spin"
          ></div>

          <p className="text-slate-600 font-medium mt-4">
            Analyzing your resume...
          </p>

          <p className="text-sm text-slate-400 mt-1">
            Please wait while Gemini checks your resume.
          </p>

        </div>

      </div>
    );
  }

  // No result yet
  if (!aiRes) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 min-h-[500px]">

        <p className="text-sm font-bold tracking-wider text-indigo-600 uppercase">
          Analysis
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-1">
          Resume Report
        </h2>

        <div className="flex flex-col items-center justify-center h-72 text-center">

          <div
            className="w-16 h-16 flex items-center justify-center
                       rounded-2xl bg-indigo-50 text-3xl mb-4"
          >
            📊
          </div>

          <h3 className="text-lg font-semibold text-slate-800">
            Your report is waiting
          </h3>

          <p className="text-slate-500 text-sm mt-2 max-w-sm">
            Upload your resume and enter a job description.
            Your ATS analysis will appear here.
          </p>

        </div>

      </div>
    );
  }

  // Show result
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">

      <p className="text-sm font-bold tracking-wider text-indigo-600 uppercase">
        Analysis Result
      </p>

      <h2 className="text-2xl font-bold text-slate-900 mt-1 mb-6">
        Resume Report
      </h2>

      {/* ATS Score */}
      <div
        className="bg-gradient-to-r from-indigo-50 to-blue-50
                   border border-indigo-100 rounded-2xl p-5 mb-6"
      >

        <p className="text-sm font-semibold text-slate-500">
          ATS Score
        </p>

        <div className="flex items-end gap-2 mt-1">

          <p className="text-5xl font-bold text-indigo-600">
            {aiRes.atsScore}
          </p>

          <span className="text-xl font-semibold text-slate-400 mb-1">
            /100
          </span>

        </div>

      </div>

      {/* Summary */}
      <div className="mb-6">

        <h3 className="text-lg font-bold text-slate-900 mb-3">
          Summary
        </h3>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">

          <p className="text-slate-600 leading-7">
            {aiRes.summary}
          </p>

        </div>

      </div>

      {/* Good Points */}
      <div className="mb-6">

        <h3 className="text-lg font-bold text-emerald-700 mb-3">
          ✓ Good Points
        </h3>

        <ul className="space-y-2">

          {aiRes.goodPoints.map((point, index) => (
            <li
              key={index}
              className="bg-emerald-50 border border-emerald-100
                         rounded-xl p-3 text-slate-700"
            >
              {point}
            </li>
          ))}

        </ul>

      </div>

      {/* Weak Points */}
      <div className="mb-6">

        <h3 className="text-lg font-bold text-rose-700 mb-3">
          ✕ Weak Points
        </h3>

        <ul className="space-y-2">

          {aiRes.badPoints.map((point, index) => (
            <li
              key={index}
              className="bg-rose-50 border border-rose-100
                         rounded-xl p-3 text-slate-700"
            >
              {point}
            </li>
          ))}

        </ul>

      </div>

      {/* Suggestions */}
      <div>

        <h3 className="text-lg font-bold text-blue-700 mb-3">
          💡 Suggestions
        </h3>

        <ul className="space-y-2">

          {aiRes.suggestions.map((suggestion, index) => (
            <li
              key={index}
              className="bg-blue-50 border border-blue-100
                         rounded-xl p-3 text-slate-700"
            >
              {suggestion}
            </li>
          ))}

        </ul>

      </div>

    </div>
  );
}

export default DisplayComp;