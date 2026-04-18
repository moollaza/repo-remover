import Footer from "@/components/footer";
import { GuideHeader } from "./guide-header";

const THEME_FLASH_SCRIPT = `(function(){var t=localStorage.getItem("theme");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme:dark)").matches)){document.documentElement.classList.add("dark");}})();`;

const THEME_TOGGLE_SCRIPT = `(function(){function t(){var d=document.documentElement.classList.contains("dark");if(d){document.documentElement.classList.remove("dark");localStorage.setItem("theme","light");}else{document.documentElement.classList.add("dark");localStorage.setItem("theme","dark");}}var b=document.querySelector("[data-theme-toggle]");if(b){b.addEventListener("click",t);}})();`;

const THEME_ICON_CSS = `.theme-icon-sun{display:none}.theme-icon-moon{display:inline}.dark .theme-icon-sun{display:inline}.dark .theme-icon-moon{display:none}`;

interface Breadcrumb {
  label: string;
  href?: string;
}

interface GuideLayoutProps {
  cssPath: string;
  fathomSiteId: string;
  head: React.ReactNode;
  breadcrumb: Breadcrumb[];
  children: React.ReactNode;
}

function BreadcrumbNav({ items }: { items: Breadcrumb[] }) {
  if (items.length === 0) return null;
  return (
    <nav
      aria-label="Breadcrumb"
      className="text-sm text-default-400"
      data-testid="breadcrumb"
    >
      {items.map((crumb, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i}>
            {i > 0 && <span className="mx-2">/</span>}
            {crumb.href && !isLast ? (
              <a
                href={crumb.href}
                className="hover:text-foreground transition-colors"
              >
                {crumb.label}
              </a>
            ) : (
              <span className={isLast ? "text-foreground" : ""}>
                {crumb.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export function GuideLayout({
  cssPath,
  fathomSiteId,
  head,
  breadcrumb,
  children,
}: GuideLayoutProps) {
  return (
    <html lang="en" className="min-h-full">
      <head>
        <meta charSet="UTF-8" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="theme-color"
          content="#ffffff"
          media="(prefers-color-scheme: light)"
        />
        <meta
          name="theme-color"
          content="#000000"
          media="(prefers-color-scheme: dark)"
        />
        {head}
        {cssPath && <link rel="stylesheet" href={`/${cssPath}`} />}
        <style>{THEME_ICON_CSS}</style>
        <script>{THEME_FLASH_SCRIPT}</script>
      </head>
      <body className="min-h-full bg-background text-foreground font-sans antialiased">
        <GuideHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
          <BreadcrumbNav items={breadcrumb} />
        </div>
        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">{children}</main>
        <Footer />
        <script>{THEME_TOGGLE_SCRIPT}</script>
        {fathomSiteId && (
          <script
            src="https://cdn.usefathom.com/script.js"
            data-site={fathomSiteId}
            defer
          />
        )}
      </body>
    </html>
  );
}
