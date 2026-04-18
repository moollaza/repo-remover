import { MotionConfig } from "framer-motion";
import { lazy, Suspense, useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import { ErrorBoundary } from "@/components/error-boundary";
import { FathomAnalytics } from "@/components/fathom-analytics";
import Footer from "@/components/footer";
import { MarketingHeader } from "@/components/marketing-header";
import { Providers } from "@/providers/providers";
import { Home } from "@/routes/home";

// Dashboard subtree is lazy so `/` does not ship Octokit / auth code.
const DashboardShell = lazy(() =>
  import("@/routes/dashboard-shell").then((m) => ({
    default: m.DashboardShell,
  })),
);

/** Reset scroll position on route change */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full">
      <MarketingHeader />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

export function App() {
  return (
    <Providers themeProps={{ attribute: "class", defaultTheme: "light" }}>
      <MotionConfig reducedMotion="user">
        <ErrorBoundary>
          <FathomAnalytics />
          <ScrollToTop />
          <Routes>
            <Route
              element={
                <MarketingLayout>
                  <Home />
                </MarketingLayout>
              }
              path="/"
            />
            <Route
              element={
                <Suspense fallback={null}>
                  <DashboardShell />
                </Suspense>
              }
              path="/dashboard"
            />
            <Route element={<Navigate replace to="/" />} path="*" />
          </Routes>
        </ErrorBoundary>
      </MotionConfig>
    </Providers>
  );
}
