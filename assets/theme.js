/*
  Токены темы office8.kz (светлая тема) для Tailwind v4.
  Подключается в <head> ДО @tailwindcss/browser — так классы сайта
  (bg-primary, text-gold, bg-cta, ring-slate-200/70 …) работают как в продакшене.
*/
// Прячем страницу, пока app.js не отрисует разметку (с запасным таймером на случай ошибки)
document.documentElement.classList.add('o8-loading');
setTimeout(function () { document.documentElement.classList.remove('o8-loading'); }, 1500);

document.write(
  '<style type="text/tailwindcss">' +
  '@theme {' +
  '  --font-sans: "Montserrat", "Segoe UI", -apple-system, BlinkMacSystemFont, "Roboto", "Helvetica Neue", Arial, sans-serif;' +
  '  --color-background: #f4f6f6;' +
  '  --color-primary: #0b1f3a;' +
  '  --color-primary-hover: #16375f;' +
  '  --color-cta: #0b1f3a;' +
  '  --color-cta-hover: #16375f;' +
  '  --color-accent-soft: #e6ebeb;' +
  '  --color-gold: #c9a66b;' +
  '  --color-gold-hover: #b8914f;' +
  '  --color-gold-soft: #f4ecdd;' +
  '  --color-graphite: #2c2f36;' +
  '  --color-muted: #6b717c;' +
  '}' +
  '</style>'
);
