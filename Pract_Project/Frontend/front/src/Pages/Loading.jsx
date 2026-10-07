
import { Users } from "lucide-react";

const Loading = () => {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">

      <div className="w-full max-w-sm rounded-3xl bg-white border border-slate-200 shadow-xl p-10 text-center">

        {/* Logo */}

        <div className="mx-auto h-14 w-14 rounded-2xl bg-slate-900 flex items-center justify-center">
          <Users
            size={26}
            className="text-white"
          />
        </div>


        {/* Brand */}

        <h2 className="mt-5 text-xl font-bold text-slate-900">
          TeamFlow
        </h2>


        {/* Loader */}

        <div className="mt-7 flex justify-center">

          <div className="h-8 w-8 rounded-full border-4 border-slate-200 border-t-slate-900 animate-spin" />

        </div>


        {/* Message */}

        <p className="mt-5 text-sm font-medium text-slate-700">
          Loading your workspace
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Please wait while we verify your session...
        </p>

      </div>

    </div>
  );
};

export default Loading;
