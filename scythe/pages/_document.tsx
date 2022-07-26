import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";

export default function Document() {
  return (
    <Html>
      <Head>
        <meta
          name="description"
          content="A Tool to kickstart your private community"
        />
        <link rel="icon" href="/together.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Yusei+Magic&display=swap"
          rel="stylesheet"
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-868074880"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-868074880');
            gtag('event', 'conversion', {'send_to': 'AW-868074880/ITOFCOmQ0s8DEICL950D'});
            `}
        </Script>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
