import { Heart } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { BlueskyIcon, GithubIcon } from "@/components/icons";

export default function Footer() {
  return (
    <footer
      className="w-full border-t border-divider bg-default-50/50"
      data-testid="footer"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-1 sm:col-span-2">
            <BrandLogo className="mb-4" />
            <p className="text-default-500 mb-4 max-w-md">
              The easiest way to archive and delete multiple GitHub
              repositories. Built with love by developers, for developers.
            </p>
            <div className="flex items-center gap-4">
              <a
                aria-label="Repo Remover on GitHub"
                className="text-default-400 hover:text-foreground transition-colors"
                href="https://github.com/moollaza/repo-remover"
                rel="noopener noreferrer"
                target="_blank"
              >
                <GithubIcon className="h-5 w-5" />
              </a>
              <a
                aria-label="Repo Remover on Bluesky"
                className="text-default-400 hover:text-foreground transition-colors"
                href="https://bsky.app/profile/reporemover.xyz"
                rel="noopener noreferrer"
                target="_blank"
              >
                <BlueskyIcon className="h-5 w-5" />
              </a>
              <a
                aria-label="Repo Remover on Product Hunt"
                className="block"
                href="https://www.producthunt.com/products/repo-remover/launches/repo-remover?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-repo-remover"
                rel="noopener noreferrer"
                style={{ height: 32, width: 150 }}
                target="_blank"
              >
                <img
                  alt="Repo Remover - Archive or delete multiple GitHub repos with a single click. | Product Hunt"
                  className="block h-8 w-[150px]"
                  decoding="async"
                  height={32}
                  loading="lazy"
                  src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=159117&theme=light&t=1775226012179"
                  width={150}
                />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-default-500">
              <li>
                <a
                  className="hover:text-foreground transition-colors"
                  href="#features"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  className="hover:text-foreground transition-colors"
                  href="#how-it-works"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  className="hover:text-foreground transition-colors"
                  href="#get-started"
                >
                  Get Started
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-default-500">
              <li>
                <a
                  className="hover:text-foreground transition-colors"
                  href="/guides/"
                >
                  Guides
                </a>
              </li>
              <li>
                <a
                  className="hover:text-foreground transition-colors"
                  href="https://github.com/moollaza/repo-remover"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  className="hover:text-foreground transition-colors"
                  href="https://bsky.app/profile/reporemover.xyz"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Bluesky
                </a>
              </li>
              <li>
                <a
                  className="hover:text-foreground transition-colors"
                  href="mailto:hello@reporemover.xyz?subject=Repo%20Remover%20Feedback"
                >
                  Feedback
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider + copyright row */}
        <div className="border-t border-divider mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-default-400">
            © 2019-2026 Repo Remover. All rights reserved.
          </p>
          <p className="text-sm text-default-400 flex items-center gap-1.5">
            Made with <Heart className="h-3.5 w-3.5 text-danger fill-danger" />{" "}
            by{" "}
            <a
              className="hover:text-foreground transition-colors"
              href="https://zaahir.ca"
              rel="noopener noreferrer"
              target="_blank"
            >
              Zaahir Moolla
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
