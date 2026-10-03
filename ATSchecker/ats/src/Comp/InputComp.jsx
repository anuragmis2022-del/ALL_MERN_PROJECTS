import React, { useRef, useState } from "react";
import { extractText } from "../Utils/readpdf";
import { ai } from "../Utils/Gemini";

function InputComp({
  setAiRes,
  loading,
  setLoading,
  error,
  setError
}) {
  const ipRef = useRef(null);
  const taRef = useRef(null);

  const [resume, setResume] = useState(null);
  const [text, setText] = useState("");

  // Handle Resume
  const handleResume = async (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    try {
      setError("");

      const extractedText = await extractText(file);

      setResume(file);
      setText(extractedText);

    } catch (error) {
      setError("Could not read the PDF. Please try again.");  // just in case pdf is corrupted , protected , unreadable , invalid pdf 
    }
  };

  // Check Resume
  const handleCheckResume = async () => {
    const jobDescription = taRef.current.value;

    // Remove previous error
    setError("");

    // Check both
    if (!resume && !jobDescription.trim()) {
      setError(
        "Please upload your resume and enter a job description."
      );
      return;
    }

    // Check resume
    if (!resume) {
      setError("Please upload your resume.");
      return;
    }

    // Check job description
    if (!jobDescription.trim()) {
      setError("Please enter a job description.");
      return;
    }

    try {
      setLoading(true);

      const prompt = `
You are an ATS Resume Checker.

Compare the candidate's resume with the job description.

Check the following:

1. Technical skills match
2. Relevant experience
3. Projects
4. Education
5. ATS keywords
6. Missing skills
7. Overall suitability

Give an ATS score between 0 and 100.

Also provide:

- A short summary
- 5 good points
- 5 bad points
- 5 suggestions

Return ONLY valid JSON.

Use exactly this format:

{
  "atsScore": 0,
  "summary": "",
  "goodPoints": [],
  "badPoints": [],
  "suggestions": []
}

Job Description:

${jobDescription}

Resume:

${text}
`;

      const result = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const data = JSON.parse(result.text);

      setAiRes(data);

    } catch (error) {
      setError(
        error.message || "Something went wrong. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">

      {/* Heading */}
      <div className="mb-6">

        <p className="text-sm font-bold tracking-wider text-indigo-600 uppercase">
          Resume Input
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-1">
          Check Your Resume
        </h2>

        <p className="text-slate-500 mt-2">
          Upload your resume and paste the job description.
        </p>

      </div>

      {/* Job Description */}
      <div className="mb-6">

        <label
          htmlFor="jd"
          className="block text-sm font-semibold text-slate-700 mb-2"
        >
          Job Description
        </label>

        <textarea
          ref={taRef}
          id="jd"
          placeholder="Paste the job description here..."
          className="w-full h-64 p-4 bg-slate-50 border border-slate-300
                     rounded-xl text-slate-700 placeholder-slate-400
                     focus:outline-none focus:ring-2
                     focus:ring-indigo-500/30 focus:border-indigo-500
                     resize-none"
        />

      </div>

      {/* Hidden File Input */}
      <input
        ref={ipRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleResume}
      />

      {/* Buttons */}
      <div className="flex gap-4">

        {/* Add Resume */}
        <button
          onClick={() => ipRef.current.click()}
          className="flex-1 bg-indigo-600 text-white py-3 rounded-xl
                     font-semibold hover:bg-indigo-700 transition"
        >
          + Add Resume
        </button>

        {/* Check Resume */}
        <button
          onClick={handleCheckResume}
          disabled={loading}
          className={`flex-1 py-3 rounded-xl font-semibold transition
            ${
              loading
                ? "bg-slate-400 text-white cursor-not-allowed"
                : "bg-slate-900 text-white hover:bg-slate-800"
            }
          `}
        >
          {loading ? "Analyzing..." : "Check My Resume"}
        </button>

      </div>

      {/* Selected Resume */}
      {resume && (
        <div className="mt-5 p-4 bg-indigo-50 border border-indigo-200 rounded-xl">

          <div className="flex items-center gap-3">

            <div className="w-9 h-9 flex items-center justify-center
                            rounded-lg bg-indigo-100 text-indigo-600">
              📄
            </div>

            <div className="min-w-0">

              <p className="text-xs font-medium text-indigo-500">
                Selected Resume
              </p>

              <p className="text-sm font-semibold text-indigo-800 truncate">
                {resume.name}
              </p>

            </div>

          </div>

        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700">
          {error}
        </div>
      )}

    </div>
  );
}

export default InputComp;