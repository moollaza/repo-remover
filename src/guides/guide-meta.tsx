import type { GuideMeta } from "./types";

const SITE_ORIGIN = "https://reporemover.xyz";
const OG_IMAGE = `${SITE_ORIGIN}/images/og-image.png`;

interface JsonLdProps {
  data: unknown;
}

// JSON-LD emitted as text child of a <script> tag. Escaping `<` → `\u003c`
// keeps the output valid JSON while preventing any accidental early-close of
// the <script> block. Data comes from git-checked frontmatter, never user
// input, but defensive encoding is free and avoids raw-HTML injection.
function JsonLd({ data }: JsonLdProps) {
  const payload = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json">{payload}</script>;
}

function articleSchema(meta: GuideMeta) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: meta.title,
    description: meta.description,
    url: meta.canonical,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": meta.canonical,
    },
    image: {
      "@type": "ImageObject",
      url: OG_IMAGE,
      width: 1200,
      height: 630,
    },
    datePublished: meta.date,
    dateModified: meta.lastmod ?? meta.date,
    author: {
      "@type": "Organization",
      name: "Repo Remover",
      url: `${SITE_ORIGIN}/`,
    },
    publisher: {
      "@type": "Organization",
      name: "Repo Remover",
      url: `${SITE_ORIGIN}/`,
    },
  };
}

function breadcrumbSchema(trail: { name: string; item?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      ...(crumb.item ? { item: crumb.item } : {}),
    })),
  };
}

interface SharedMetaProps {
  title: string;
  description: string;
  canonical: string;
  ogType: "article" | "website";
}

function SharedMeta({
  title,
  description,
  canonical,
  ogType,
}: SharedMetaProps) {
  const fullTitle = `${title} | Repo Remover`;
  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content="Repo Remover" />
      <meta property="og:image" content={OG_IMAGE} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/png" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={OG_IMAGE} />
    </>
  );
}

export function SingleGuideHead({ meta }: { meta: GuideMeta }) {
  return (
    <>
      <SharedMeta
        title={meta.title}
        description={meta.description}
        canonical={meta.canonical}
        ogType="article"
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", item: `${SITE_ORIGIN}/` },
          { name: "Guides", item: `${SITE_ORIGIN}/guides/` },
          { name: meta.title },
        ])}
      />
      <JsonLd data={articleSchema(meta)} />
    </>
  );
}

export function GuidesIndexHead() {
  return (
    <>
      <SharedMeta
        title="GitHub Repository Management Guides"
        description="Learn how to manage your GitHub repositories effectively. Guides on bulk deleting, archiving, and cleaning up repos."
        canonical={`${SITE_ORIGIN}/guides/`}
        ogType="website"
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", item: `${SITE_ORIGIN}/` },
          { name: "Guides" },
        ])}
      />
    </>
  );
}
