const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '../dist/index.html');

if (fs.existsSync(indexPath)) {
  let html = fs.readFileSync(indexPath, 'utf8');

  // PWA manifest and meta tags
  const tags = `
    <link rel="manifest" href="/manifest.json" />
    <meta name="theme-color" content="#020617" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="HustlersHub" />
    <link rel="apple-touch-icon" href="/icon.png" />
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service Worker registered'))
            .catch(err => console.error('Service Worker registration failed', err));
        });
      }
    </script>
  `;

  // Inject before </head>
  html = html.replace('</head>', `${tags}\n  </head>`);

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('Successfully injected PWA manifest & meta tags into dist/index.html');
} else {
  console.error('dist/index.html not found!');
}
