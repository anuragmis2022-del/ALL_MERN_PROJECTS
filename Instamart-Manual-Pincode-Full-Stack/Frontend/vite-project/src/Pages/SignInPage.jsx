import React from "react";
import { Link } from "react-router-dom";
function SignInPage() { return <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"><h1 className="text-xl font-bold text-slate-900">Sign In</h1><p className="mt-2 text-sm text-slate-500">This page is currently a placeholder and is not part of the active dashboard routes.</p><Link to="/dashboard" className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">Go to Dashboard</Link></div>; }
export default SignInPage;
