import React from 'react';
import { ScrollViewStyleReset } from 'expo-router/html';

// This file is web-only and used to configure the root HTML for every
// web page during static rendering (npx expo export or export:web).
export default function HTML({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/* Diagnostic script to capture and display runtime errors on web */}
        <script dangerouslySetInnerHTML={{ __html: `
          window.addEventListener('error', function(e) {
            var div = document.getElementById('runtime-error-banner');
            if (!div) {
              div = document.createElement('div');
              div.id = 'runtime-error-banner';
              div.style.position = 'fixed';
              div.style.top = '0';
              div.style.left = '0';
              div.style.width = '100%';
              div.style.backgroundColor = 'red';
              div.style.color = 'white';
              div.style.padding = '20px';
              div.style.zIndex = '999999';
              div.style.fontFamily = 'monospace';
              div.style.fontSize = '14px';
              div.style.whiteSpace = 'pre-wrap';
              document.body.appendChild(div);
            }
            div.innerText = 'Runtime Error: ' + e.message + '\\nAt: ' + e.filename + ':' + e.lineno + ':' + e.colno + '\\nStack: ' + (e.error ? e.error.stack : 'N/A');
          });
          window.addEventListener('unhandledrejection', function(e) {
            var div = document.getElementById('runtime-error-banner');
            if (!div) {
              div = document.createElement('div');
              div.id = 'runtime-error-banner';
              div.style.position = 'fixed';
              div.style.top = '0';
              div.style.left = '0';
              div.style.width = '100%';
              div.style.backgroundColor = 'darkred';
              div.style.color = 'white';
              div.style.padding = '20px';
              div.style.zIndex = '999999';
              div.style.fontFamily = 'monospace';
              div.style.fontSize = '14px';
              div.style.whiteSpace = 'pre-wrap';
              document.body.appendChild(div);
            }
            div.innerText = 'Unhandled Rejection: ' + e.reason + '\\nStack: ' + (e.reason && e.reason.stack ? e.reason.stack : 'N/A');
          });
        `}} />

        {/* Link manifest.json for PWA support */}
        <link rel="manifest" href="/manifest.json" />

        {/* iOS PWA styling */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="HustlersHub" />
        <link rel="apple-touch-icon" href="/icon.png" />

        {/* Theme color for mobile browser styling */}
        <meta name="theme-color" content="#020617" />

        {/* Disable body scrolling when using ScrollView */}
        <ScrollViewStyleReset />

        <style id="expo-reset">{`
          /* These styles make the body full-height */
          html,
          body {
            height: 100%;
          }
          /* These styles disable body scrolling if you are using <ScrollView> */
          body {
            overflow: hidden;
          }
          /* These styles make the root element full-height */
          #root {
            display: flex;
            height: 100%;
            flex: 1;
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
