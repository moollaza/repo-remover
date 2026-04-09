import React from "react";
import { useNavigate } from "react-router-dom";

import GitHubTokenForm from "@/components/github-token-form";
import { useGitHubData } from "@/hooks/use-github-data";
import { analytics } from "@/utils/analytics";

export default function TokenFormSection() {
  // Pre-populate with dev token if available (development only)
  const devToken = (
    import.meta.env.DEV ? import.meta.env.VITE_GITHUB_DEV_TOKEN : undefined
  ) as string | undefined;
  const [value, setValue] = React.useState(devToken ?? "");
  const { setPat } = useGitHubData();
  const navigate = useNavigate();

  const handleSubmit = (token: string, remember: boolean) => {
    setPat(token, remember);

    // Track successful token validation
    analytics.trackTokenValidated();

    void navigate("/dashboard");
  };

  return (
    <div className="pt-10" id="github-token-form">
      <GitHubTokenForm
        onSubmit={handleSubmit}
        onValueChange={setValue}
        value={value}
      />
    </div>
  );
}
