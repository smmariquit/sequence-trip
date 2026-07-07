// app/+html.tsx
//
// ONLY used when app.json web.output is "static" — the current "single"
// output ignores this file entirely. Skip link + katex CSS live in
// WebPageShell's runtime injection instead.

import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";
import {
  APP_DESCRIPTION,
  APP_NAME,
  APP_SHORT_NAME,
  APP_TAGLINE,
  APP_THEME_COLOR,
} from "../src/constants/brand";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <title>{APP_NAME}</title>
        <meta name="application-name" content={APP_SHORT_NAME} />
        <meta name="description" content={APP_DESCRIPTION} />
        <meta name="theme-color" content={APP_THEME_COLOR} />
        <meta name="color-scheme" content="dark" />
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.png" type="image/png" sizes="512x512" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={APP_NAME} />
        <meta property="og:description" content={APP_TAGLINE} />
        <meta property="og:image" content="/icon.png" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={APP_NAME} />
        <meta name="twitter:description" content={APP_TAGLINE} />
        <meta name="twitter:image" content="/icon.png" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: webStyles }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const webStyles = `
html, body {
  height: 100%;
  background-color: #07060E;
}
body {
  overflow: auto;
  color: #F0ECFF;
}
#root {
  display: flex;
  min-height: 100%;
  flex: 1;
  width: 100%;
  max-width: 100vw;
}
`;
