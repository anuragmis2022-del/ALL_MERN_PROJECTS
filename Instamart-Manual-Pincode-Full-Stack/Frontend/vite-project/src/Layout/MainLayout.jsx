import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Sidebar from "../Components/Sidebar";
import Footer from "../Components/Footer";

function MainLayout() {
  // This state only controls whether the mobile sidebar is open.
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-hidden bg-slate-50">
      <Navbar onMenuClick={() => setMobileOpen(true)} />

      <div className="flex min-h-[calc(100vh-64px)] w-full flex-1">
        <Sidebar
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />

        <div className="flex min-h-[calc(100vh-64px)] min-w-0 flex-1 flex-col">
          <main className="min-w-0 w-full flex-1">
            {/* Outlet displays whichever protected page matches the URL. */}
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default MainLayout;
