import { siBluesky, siGithub } from "simple-icons";

function SimpleIcon({ className, path }: { className?: string; path: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={path} />
    </svg>
  );
}

export function GithubIcon({ className }: { className?: string }) {
  return <SimpleIcon className={className} path={siGithub.path} />;
}

export function BlueskyIcon({ className }: { className?: string }) {
  return <SimpleIcon className={className} path={siBluesky.path} />;
}
