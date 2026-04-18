export interface GuideMeta {
  title: string;
  description: string;
  slug: string;
  canonical: string;
  date: string;
  lastmod?: string;
}

export interface GuideWithContent {
  meta: GuideMeta;
  html: string;
}

export interface DocumentShellProps {
  cssPath: string;
  fathomSiteId: string;
}
