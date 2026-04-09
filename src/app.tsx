import { MotionConfig } from "framer-motion";
import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import { ErrorBoundary } from "@/components/error-boundary";
import { FathomAnalytics } from "@/components/fathom-analytics";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { Providers } from "@/providers/providers";
import { Dashboard } from "@/routes/dashboard";
import { Home } from "@/routes/home";

/** Reset scroll position on route change */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function App() {
  return (
    <Providers themeProps={{ attribute: "class", defaultTheme: "light" }}>
      <MotionConfig reducedMotion="user">
        <ErrorBoundary>
          <FathomAnalytics />
          <ScrollToTop />
          <div className="min-h-full">
            <Header />
            <main>
              <Routes>
                <Route element={<Home />} path="/" />
                <Route
                  element={
                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
                      <Dashboard />
                    </div>
                  }
                  path="/dashboard"
                />
                <Route element={<Navigate replace to="/" />} path="*" />
              </Routes>
            </main>
            <Footer />
          </div>
        </ErrorBoundary>
      </MotionConfig>
    </Providers>
  );
}
