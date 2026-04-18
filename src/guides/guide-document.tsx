import type { DocumentShellProps, GuideMeta, GuideWithContent } from "./types";
import { GuideLayout } from "./guide-layout";
import { SingleGuideHead, GuidesIndexHead } from "./guide-meta";
import { GuidePage } from "./guide-page";
import { GuidesIndexPage } from "./guides-index-page";

export function SingleGuideDocument({
  meta,
  cssPath,
  fathomSiteId,
}: DocumentShellProps & { meta: GuideMeta }) {
  return (
    <GuideLayout
      cssPath={cssPath}
      fathomSiteId={fathomSiteId}
      head={<SingleGuideHead meta={meta} />}
      breadcrumb={[
        { label: "Home", href: "/" },
        { label: "Guides", href: "/guides/" },
        { label: meta.title },
      ]}
    >
      <GuidePage meta={meta} />
    </GuideLayout>
  );
}

export function GuidesIndexDocument({
  guides,
  cssPath,
  fathomSiteId,
}: DocumentShellProps & { guides: GuideWithContent[] }) {
  return (
    <GuideLayout
      cssPath={cssPath}
      fathomSiteId={fathomSiteId}
      head={<GuidesIndexHead />}
      breadcrumb={[{ label: "Home", href: "/" }, { label: "Guides" }]}
    >
      <GuidesIndexPage guides={guides} />
    </GuideLayout>
  );
}
