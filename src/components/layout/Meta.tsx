import Head from "next/head";

type MetaProps = {
  title?: string;
  description?: string;
  ogImage?: string;
  noindex?: boolean;
};

export default function Meta({
  title = "LocalScore - AI Benchmark",
  description = "LocalScore is an open benchmark which helps you understand how well your computer can handle AI tasks.",
  ogImage = "/og-image.png",
  noindex = false,
}: MetaProps) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      {noindex && <meta name="robots" content="noindex" />}
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
}
