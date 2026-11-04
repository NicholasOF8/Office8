/*
  Office8 — прототип раздела «Услуги».
  Собирает шапку, подвал, страницу «Услуги» и страницы отдельных услуг из window.O8 (data.js),
  затем включает интерактив: появление блоков, фильтр «кто вы», вкладки, таймлайны, конфигуратор.
  Разметка — на классах Tailwind, как на office8.kz, чтобы её можно было перенести в проект.
*/
(function () {
  'use strict';

  const D = window.O8;
  const body = document.body;
  const PAGE = body.dataset.page;          // 'services' | 'service'
  const BASE = body.dataset.base || '';    // путь до корня прототипа: '' или '../'
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const SITE = 'https://www.office8.kz';
  const PHONE = '+7 708 970 29 29';
  const TEL = 'tel:+77089702929';
  const WA = 'https://wa.me/77089702929';
  const TG = 'https://t.me/office8_work';
  const IG = 'https://instagram.com/office8_';

  const cats = Object.fromEntries(D.categories.map(c => [c.id, c]));
  const svcs = Object.fromEntries(D.services.map(s => [s.slug, s]));
  const current = PAGE === 'service' ? svcs[body.dataset.slug] : null;

  /* ───────── helpers ───────── */
  const photo = (id, w = 1200, q = 72) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=${q}`;
  const ic = (name, cls = 'size-5') => `<i data-lucide="${name}" class="${cls}" aria-hidden="true"></i>`;
  const wa = text => `${WA}?text=${encodeURIComponent(text)}`;
  const svcHref = slug => `${BASE}services/${slug}.html`;
  const homeHref = `${BASE}index.html`;
  const nameOf = s => s.card || s.title;
  const pad = n => String(n).padStart(2, '0');
  const plural = (n, f) => {
    const a = n % 10, b = n % 100;
    if (a === 1 && b !== 11) return f[0];
    if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return f[1];
    return f[2];
  };
  const svcText = s => `Здравствуйте! Интересует услуга «${nameOf(s)}».`;

  const BRAND = {
    wa: '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>',
    tg: '<path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>',
    ig: '<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>'
  };
  const brand = (k, cls = 'size-[18px]') => `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="${cls}">${BRAND[k]}</svg>`;

  // Квадратная иконка в фирменном градиенте — как у контактов в подвале сайта
  const facadeIcon = (inner, size = 'h-11 w-11 rounded-2xl') => `
    <span class="facade-dark relative flex ${size} shrink-0 items-center justify-center text-white shadow-[0_8px_16px_-10px_rgba(15,23,42,0.75)] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-[0_12px_22px_-10px_rgba(15,23,42,0.6)]">
      <span aria-hidden="true" class="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-b from-white/25 to-transparent"></span>
      <span aria-hidden="true" class="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/15"></span>
      <span class="relative">${inner}</span>
    </span>`;

  // Силуэт зданий с окнами — декоративный узор из промо-блока на главной
  let patternId = 0;
  const windowsArt = cls => {
    const id = 'o8-win-' + (++patternId);
    return `<svg aria-hidden="true" viewBox="0 0 120 120" preserveAspectRatio="xMaxYMax slice" class="pointer-events-none absolute ${cls}"><defs><pattern id="${id}" width="10" height="14" patternUnits="userSpaceOnUse"><rect width="7" height="10" x="1.5" y="2" fill="white" opacity="0.5"></rect></pattern></defs><path d="M0 120 L0 54 L46 34 L46 120 Z" fill="url(#${id})"></path><path d="M42 120 L42 24 L98 6 L98 120 Z" fill="url(#${id})"></path></svg>`;
  };

  const CARD = 'rounded-2xl bg-white ring-1 ring-slate-200/70';
  const H2 = 'text-[20px] font-bold leading-tight text-slate-900 sm:text-[22px]';
  const EYEBROW = 'text-[13px] font-semibold uppercase tracking-[0.08em] text-slate-400';
  const BTN_WHITE = 'inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-[15px] font-semibold text-slate-900 shadow-[0_10px_24px_-16px_rgba(0,0,0,0.6)] transition-transform hover:-translate-y-0.5';
  const BTN_GLASS = 'inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white/10 px-6 text-[15px] font-semibold text-white ring-1 ring-white/20 backdrop-blur-sm transition-colors hover:bg-white/15';

  /* ───────── шапка, меню, подвал ───────── */
  const NAV = [
    ['building-2', 'Офисы', SITE + '/?tab=offices'],
    ['users', 'Коворкинги', SITE + '/?tab=coworking'],
    ['trending-up', 'Инвестиции', SITE + '/investments'],
    ['briefcase', 'Услуги', homeHref, true]
  ];

  // Иконки шапки и подвала — те же SVG, что на сайте (там Lucide новее, чем CDN-сборка прототипа)
  const SITE_IC = {
    'building-2': '<path d="M10 12h4"></path><path d="M10 8h4"></path><path d="M14 21v-3a2 2 0 0 0-4 0v3"></path><path d="M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2"></path><path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"></path>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><path d="M16 3.128a4 4 0 0 1 0 7.744"></path><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><circle cx="9" cy="7" r="4"></circle>',
    'trending-up': '<path d="M16 7h6v6"></path><path d="m22 7-8.5 8.5-5-5L2 17"></path>',
    briefcase: '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path><rect width="20" height="14" x="2" y="6" rx="2"></rect>',
    globe: '<circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path>',
    check: '<path d="M20 6 9 17l-5-5"></path>',
    sun: '<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path>',
    'shield-check': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path>',
    bell: '<path d="M10.268 21a2 2 0 0 0 3.464 0"></path><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"></path>',
    inbox: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>',
    menu: '<path d="M4 5h16"></path><path d="M4 12h16"></path><path d="M4 19h16"></path>',
    phone: '<path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"></path>',
    'layout-grid': '<rect width="7" height="7" x="3" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="14" rx="1"></rect><rect width="7" height="7" x="3" y="14" rx="1"></rect>',
    'circle-plus': '<circle cx="12" cy="12" r="10"></circle><path d="M8 12h8"></path><path d="M12 8v8"></path>',
    'file-text': '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"></path><path d="M14 2v5a1 1 0 0 0 1 1h5"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path>',
    'scroll-text': '<path d="M15 12h-5"></path><path d="M15 8h-5"></path><path d="M19 17V5a2 2 0 0 0-2-2H4"></path><path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"></path>',
    receipt: '<path d="M12 17V7"></path><path d="M16 8h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8"></path><path d="M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z"></path>'
  };
  const hic = (name, size, stroke, cls = '') => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-${name}${cls ? ' ' + cls : ''}" aria-hidden="true">${SITE_IC[name]}</svg>`;

  // Шапка повторяет разметку office8.kz из сохранённых страниц (вход под админом).
  // data-fit: если пункты не помещаются в строку, шапка ужимается full → dense → tight (см. initHeaderFit)
  function header() {
    const link = ([icon, t, href, on]) => `<a href="${href}"${on ? ' aria-current="page"' : ''} class="flex items-center gap-2 whitespace-nowrap rounded-[10px] px-3 py-1.5 text-[16px] transition-colors group-data-[fit=dense]/hdr:gap-1.5 group-data-[fit=dense]/hdr:px-1.5 group-data-[fit=dense]/hdr:text-[15px] group-data-[fit=tight]/hdr:px-2 group-data-[fit=tight]/hdr:text-[15px] ${on ? 'bg-primary/10 font-medium text-primary' : 'text-slate-900 hover:bg-slate-100 hover:text-primary'}">${hic(icon, 18, 1.75, 'group-data-[fit=tight]/hdr:hidden')}${t}</a>`;
    const MENU = 'absolute right-0 top-full z-30 mt-2 origin-top-right overflow-hidden rounded-2xl bg-white shadow-[0_16px_40px_-8px_rgba(15,23,42,0.18)] ring-1 ring-slate-100 transition-all duration-150 pointer-events-none scale-95 opacity-0';
    const LABEL = 'text-[12px] font-semibold uppercase tracking-wide text-slate-500';
    const opt = (label, on) => `<li><button type="button" role="menuitemradio" aria-checked="${on}" class="flex min-h-10 w-full items-center justify-between gap-3 rounded-xl px-3 text-left text-sm transition-colors ${on ? 'bg-primary/10 font-semibold text-primary' : 'text-slate-900 hover:bg-slate-100'}">${label}${on ? hic('check', 16, 2) : ''}</button></li>`;
    const langs = [['Қазақ'], ['Русский', true], ['English']].map(([t, on]) => opt(`<span>${t}</span>`, !!on)).join('');
    const currencies = [['Казахстанский тенге', '₸', true], ['Доллар США', '$'], ['Российский рубль', '₽'], ['Китайский юань', '¥'], ['Евро', '€']]
      .map(([t, sym, on]) => opt(`<span class="flex items-center gap-2"><span>${t}</span><span class="text-slate-500">${sym}</span></span>`, !!on)).join('');
    return `
<header data-fit="full" class="group/hdr relative z-50 px-4 pt-1.5 max-md:sticky max-md:top-0 max-md:bg-background sm:px-6 sm:pt-2 xl:px-[100px]">
  <div class="rounded-2xl bg-white shadow-[0_1px_0_rgba(15,23,42,0.04)] ring-1 ring-slate-200/60">
    <div data-fit-row="true" class="o8m-hdr-row flex h-[70px] items-center justify-between gap-4 px-4 sm:px-6">
      <div class="flex shrink-0 items-center gap-8 group-data-[fit=full]/hdr:gap-[59px] group-data-[fit=dense]/hdr:gap-5 group-data-[fit=tight]/hdr:gap-5">
        <a aria-label="OFFICE8" class="flex min-h-11 shrink-0 items-center" href="${SITE}/">
          <img alt="OFFICE8" width="136" height="30" decoding="async" class="o8m-logo-word h-auto w-auto shrink-0 select-none max-md:hidden" style="color:transparent;height:30px;width:auto" src="${BASE}assets/img/logo-office8-outline.png">
          <img alt="OFFICE8" width="22" height="38" decoding="async" class="o8m-logo-8 h-auto w-auto shrink-0 select-none md:hidden" style="color:transparent;height:38px;width:auto" src="${BASE}assets/img/logo-8-outline.png">
        </a>
        <nav aria-label="Основное меню" class="-mx-3 hidden items-center gap-4 xl:flex group-data-[fit=full]/hdr:gap-[31px] group-data-[fit=dense]/hdr:-mx-2 group-data-[fit=dense]/hdr:gap-1 group-data-[fit=tight]/hdr:-mx-2 group-data-[fit=tight]/hdr:gap-1">${NAV.map(link).join('')}</nav>
      </div>
      <div class="flex shrink-0 items-center gap-4 group-data-[fit=dense]/hdr:gap-2 group-data-[fit=tight]/hdr:gap-2">
        <a class="o8m-cta me-2 hidden h-[41px] items-center justify-center whitespace-nowrap rounded-[10px] bg-cta px-5 text-[15px] font-medium text-white transition-colors hover:bg-cta-hover md:inline-flex group-data-[fit=full]/hdr:px-6" href="${SITE}/publish-tax">Разместить</a>
        <span class="hidden md:contents">
          <div class="relative" data-menu>
            <button type="button" aria-haspopup="menu" aria-expanded="false" class="flex min-h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-2 text-[16px] text-slate-900 transition-colors hover:bg-slate-50">${hic('globe', 20, 1.75)}<span>RU/₸</span></button>
            <div role="menu" class="${MENU} hidden w-64 md:block">
              <div class="border-b border-slate-100 p-3">
                <p class="mb-2 px-2 ${LABEL}">Язык интерфейса</p>
                <ul class="space-y-0.5">${langs}</ul>
              </div>
              <div class="border-b border-slate-100 p-3">
                <div class="mb-2 flex items-center justify-between gap-2 px-2"><p class="${LABEL}">Валюта цен</p><span class="text-[12px] font-medium text-primary">● курс НБ РК</span></div>
                <ul class="space-y-0.5">${currencies}</ul>
              </div>
              <div class="hidden p-3 md:block">
                <p class="mb-2 px-2 ${LABEL}">Тема оформления</p>
                <button type="button" aria-disabled="true" disabled class="flex min-h-10 w-full cursor-not-allowed items-center justify-between gap-3 rounded-xl px-3 text-left text-sm text-slate-400"><span class="flex items-center gap-2">${hic('sun', 16, 2)}Светлая</span><span class="rounded-full bg-slate-100 px-1.5 py-0.5 ${LABEL}">Скоро</span></button>
              </div>
            </div>
          </div>
        </span>
        <a class="o8m-admin hidden h-10 items-center gap-1 rounded-full border border-gold/40 bg-gold-soft px-3.5 text-[13px] font-medium text-primary hover:border-gold/60 hover:bg-gold/20 group-data-[fit=full]/hdr:inline-flex" href="${SITE}/panel">${hic('shield-check', 14, 2)}Админка</a>
        <div class="hidden md:block">
          <div class="relative" data-menu>
            <button type="button" aria-haspopup="menu" aria-expanded="false" aria-label="Уведомления" class="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900">${hic('bell', 18, 2)}</button>
            <div role="menu" class="${MENU} w-80 sm:w-96">
              <div class="flex items-center justify-between border-b border-slate-100 px-4 py-3"><h3 class="text-[17px] font-semibold leading-snug text-slate-900">Уведомления</h3></div>
              <div class="flex flex-col items-center gap-2 px-6 py-12 text-center">${hic('inbox', 32, 1.5, 'text-slate-300')}<p class="text-xs text-slate-500">Уведомлений пока нет</p></div>
              <div class="border-t border-slate-100 px-4 py-2 text-right"><a class="inline-flex min-h-10 items-center text-[13px] font-medium text-primary hover:underline" href="${SITE}/profile/notifications">Все уведомления →</a></div>
            </div>
          </div>
        </div>
        <a aria-label="Профиль" class="hidden shrink-0 transition-opacity hover:opacity-90 md:block" href="${SITE}/profile"><span class="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-slate-500" style="width:40px;height:40px"><span class="font-semibold leading-none text-slate-600" style="font-size:14px">НИ</span></span></a>
        <button type="button" data-drawer-open aria-label="Открыть меню" aria-controls="header-drawer" aria-expanded="false" class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 xl:hidden">${hic('menu', 20, 2)}</button>
      </div>
    </div>
  </div>
</header>`;
  }

  function drawer() {
    const svcLinks = D.categories.map(c => `
      <p class="mb-1 mt-4 px-3 ${EYEBROW}">${c.title}</p>
      ${D.services.filter(s => s.cat === c.id).map(s => `<a href="${svcHref(s.slug)}" class="flex min-h-10 items-center gap-2.5 rounded-xl px-3 text-[14px] ${current && current.slug === s.slug ? 'bg-primary/10 font-semibold text-primary' : 'text-slate-700 hover:bg-slate-50'}">${ic(s.icon, 'size-4 text-slate-400')}${nameOf(s)}</a>`).join('')}`).join('');
    return `
<div id="header-drawer" class="drawer fixed inset-0 z-[60] xl:hidden" aria-hidden="true">
  <div class="absolute inset-0 bg-slate-950/40" data-drawer-close></div>
  <div class="drawer-panel absolute inset-y-0 right-0 flex w-[min(360px,88vw)] flex-col bg-white shadow-2xl" role="dialog" aria-label="Меню">
    <div class="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 px-4">
      <img alt="OFFICE8" src="${BASE}assets/img/logo-office8-outline.png" class="h-[22px] w-auto">
      <button type="button" data-drawer-close aria-label="Закрыть меню" class="flex size-11 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100">${ic('x', 'size-5')}</button>
    </div>
    <nav class="flex-1 overflow-y-auto p-3" aria-label="Меню">
      ${NAV.map(([icon, t, href, on]) => `<a href="${href}" class="flex min-h-11 items-center gap-3 rounded-xl px-3 text-[16px] ${on ? 'bg-primary/10 font-semibold text-primary' : 'text-slate-900 hover:bg-slate-50'}">${hic(icon, 18, 1.75)}${t}</a>`).join('')}
      <div class="mt-2 border-t border-slate-100 pt-1">${svcLinks}</div>
    </nav>
    <div class="grid shrink-0 gap-2 border-t border-slate-100 p-4">
      <a href="${wa('Здравствуйте! Хочу обсудить услуги Office8.')}" target="_blank" rel="noopener noreferrer" class="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary text-[15px] font-semibold text-white">${brand('wa')}Написать в WhatsApp</a>
      <a href="${TEL}" class="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-100 text-[15px] font-semibold text-slate-900">${ic('phone', 'size-[18px]')}${PHONE}</a>
    </div>
  </div>
</div>`;
  }

  // Контакт с иконкой в фирменном градиенте — как в колонке «Связаться с нами» подвала
  const contactCard = (icon, t, sub, href, blank = true) => `<li><a href="${href}"${blank ? ' target="_blank" rel="noopener noreferrer"' : ''} class="group flex items-center gap-3 rounded-2xl px-2 py-2 transition-colors hover:bg-slate-50">${facadeIcon(icon)}<span class="min-w-0"><span class="block text-[15px] font-semibold leading-tight text-slate-900">${t}</span><span class="block truncate text-[13px] leading-snug text-slate-500">${sub}</span></span></a></li>`;

  // Подвал повторяет разметку office8.kz из сохранённых страниц
  function footer() {
    const lnk = ([icon, t, href]) => `<li><a class="group flex min-h-10 items-center gap-2.5 rounded-xl px-2 py-2 text-[15px] text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900" href="${href}">${hic(icon, 17, 1.75, 'shrink-0 text-slate-400 transition-colors group-hover:text-primary')}${t}</a></li>`;
    const mLnk = ([icon, t, href]) => `<li><a class="-mx-2 flex min-h-10 items-center gap-2 rounded-xl px-2 text-sm leading-tight text-slate-900 transition-colors hover:bg-slate-50 hover:text-primary" href="${href}">${hic(icon, 15, 1.75, 'shrink-0 text-slate-400')}<span class="min-w-0 hyphens-auto break-words">${t}</span></a></li>`;
    const col = t => `<h2 class="mb-4 text-[13px] font-semibold uppercase tracking-[0.08em] text-slate-400">${t}</h2>`;
    const premises = [['building-2', 'Офисы', SITE + '/?tab=offices'], ['trending-up', 'Инвестиции', SITE + '/investments'], ['layout-grid', 'Все объявления', SITE + '/search'], ['circle-plus', 'Разместить объявление', SITE + '/publish']];
    const docs = [['shield-check', 'Политика конфиденциальности', SITE + '/privacy'], ['file-text', 'Пользовательское соглашение', SITE + '/terms'], ['scroll-text', 'Правила размещения объявлений', SITE + '/rules'], ['receipt', 'Реквизиты компании', SITE + '/requisites']];
    const bottom = [['Конфиденциальность', '/privacy'], ['Соглашение', '/terms'], ['Правила', '/rules'], ['Реквизиты', '/requisites']]
      .map(([t, h]) => `<a class="inline-flex min-h-10 items-center rounded-lg px-2 transition-colors hover:bg-slate-50 hover:text-slate-900" href="${SITE}${h}">${t}</a>`).join('');
    const DESK = 'mx-auto hidden w-full max-w-[1920px] px-6 lg:block xl:px-14 2xl:px-[100px]';
    return `
<footer class="px-4 sm:px-6 xl:px-[100px]">
  <div class="rounded-t-2xl border border-b-0 border-[#E6EBEB] bg-white">
    <div class="${DESK} pt-[77px]">
      <div class="grid grid-cols-[repeat(3,auto)] justify-between gap-x-8 gap-y-10 min-[90rem]:grid-cols-[1fr_auto_auto_auto] min-[90rem]:justify-normal">
        <div class="col-span-3 min-[90rem]:col-span-1">
          <a aria-label="OFFICE8" class="inline-flex min-h-11 min-w-max items-center" href="${SITE}/"><img alt="OFFICE8" width="208" height="46" decoding="async" class="h-auto w-auto shrink-0 select-none" style="color:transparent;height:46px;width:auto" src="${BASE}assets/img/logo-office8-outline.png"></a>
          <p class="mt-5 max-w-[280px] text-[14px] leading-relaxed text-slate-500">Маркетплейс коммерческой недвижимости — бизнес-центры, офисы в ЖК, коворкинги и коттеджи в Казахстане.</p>
        </div>
        <div>${col('Помещения')}<ul class="-ml-2 space-y-0.5">${premises.map(lnk).join('')}</ul></div>
        <div>${col('Документация')}<ul class="-ml-2 space-y-0.5">${docs.map(lnk).join('')}</ul></div>
        <div>${col('Связаться с нами')}<ul class="-ml-2 space-y-1">${contactCard(brand('tg'), 'Telegram', '@office8_work', TG)}${contactCard(brand('wa'), 'WhatsApp', PHONE, WA)}${contactCard(brand('ig'), 'Instagram', '@office8_', IG)}</ul></div>
      </div>
    </div>
    <div class="px-4 pt-6 pb-[max(7rem,var(--pwa-reserve,0px))] sm:px-6 md:pb-[max(calc(7rem+var(--ai-slot,0px)),var(--pwa-reserve,0px))] lg:hidden">
      <div class="flex items-center justify-between">
        <img alt="OFFICE8" width="136" height="30" decoding="async" class="h-auto w-auto shrink-0 select-none" style="color:transparent;height:30px;width:auto" src="${BASE}assets/img/logo-office8-outline.png">
        <div class="flex gap-2.5">
          ${[['tg', TG, 'Telegram: @office8_work'], ['wa', WA, `WhatsApp: ${PHONE}`], ['ig', IG, 'Instagram: @office8_']].map(([k, h, l]) => `<a href="${h}" target="_blank" rel="noopener noreferrer" aria-label="${l}" class="group">${facadeIcon(brand(k), 'h-10 w-10 rounded-xl')}</a>`).join('')}
        </div>
      </div>
      <div class="mt-6 grid grid-cols-1 gap-y-6 md:grid-cols-2 md:gap-x-3">
        <div><h2 class="mb-3 ${EYEBROW}">Помещения</h2><ul class="space-y-1.5">${premises.map(mLnk).join('')}</ul></div>
        <div><h2 class="mb-3 ${EYEBROW}">Документация</h2><ul class="space-y-1.5">${docs.map(mLnk).join('')}</ul></div>
      </div>
      <div class="mt-6 border-t border-slate-100 pt-4 text-xs text-slate-500">
        <div class="-mx-2 mb-2 grid grid-cols-2 gap-x-1 sm:flex sm:flex-wrap sm:items-center sm:gap-y-1">${bottom}</div>
        <span>@office8.kz</span>
      </div>
    </div>
    <div class="${DESK}">
      <div class="mt-[63px] border-t border-slate-300 pt-[26px] pb-[27px]">
        <div class="-ml-2 flex flex-wrap items-center gap-x-[49px] gap-y-2 text-[14px] text-slate-500"><span class="ml-2">@office8.kz</span>${bottom}</div>
      </div>
    </div>
  </div>
</footer>`;
  }

  /* ───────── плавающие кнопки (как на сайте) ───────── */
  // На телефоне — «Связаться с нами», с 768px — WhatsApp. На страницах услуг на телефоне вместо
  // кнопки нижняя панель (как на странице объекта), поэтому там только WhatsApp.
  // В WhatsApp, как на сайте, уходит адрес страницы, с которой пишут.
  const pageWa = wa(`Здравствуйте! Пишу с сайта Office8: ${SITE}/services${current ? '/' + current.slug : ''}`);
  const fabIcon = inner => `<span class="facade-dark relative flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-[0_10px_22px_-10px_rgba(15,23,42,0.8)] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-[0_14px_26px_-10px_rgba(15,23,42,0.7)] group-active:scale-95"><span aria-hidden="true" class="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-b from-white/25 to-transparent"></span><span aria-hidden="true" class="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/15"></span><span class="relative">${inner}</span></span>`;
  const fabs = () => (current ? '' : `<button type="button" data-sheet-open aria-controls="contact-sheet" aria-expanded="false" aria-label="Связаться с нами" title="Связаться с нами" class="group fab-low fixed right-4 z-40 print:hidden sm:right-6 md:hidden">${fabIcon(hic('phone', 24, 2))}</button>`)
    + `<a href="${pageWa}" target="_blank" rel="noopener noreferrer" aria-label="Написать в WhatsApp" title="Написать в WhatsApp" class="group fab-low fixed right-4 z-40 hidden print:hidden sm:right-6 md:block">${fabIcon(brand('wa', 'size-[26px]'))}</a>`;

  // Панель кнопки «Связаться с нами». В сохранённых страницах её нет (сайт рисует её по клику),
  // поэтому здесь заглушка из блока контактов подвала
  const contactSheet = () => `
<div id="contact-sheet" class="drawer fixed inset-0 z-[60] md:hidden" aria-hidden="true">
  <div class="absolute inset-0 bg-slate-950/40" data-sheet-close></div>
  <div class="sheet-panel absolute inset-x-0 bottom-0 rounded-t-2xl bg-white px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pt-2 shadow-2xl" role="dialog" aria-label="Связаться с нами">
    <div class="flex items-center justify-between">
      <h2 class="${EYEBROW}">Связаться с нами</h2>
      <button type="button" data-sheet-close aria-label="Закрыть" class="-me-2 flex size-11 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100">${ic('x', 'size-5')}</button>
    </div>
    <ul class="-mx-2 mt-1 space-y-1">
      ${contactCard(hic('phone', 18, 2), 'Позвонить', PHONE, TEL, false)}
      ${contactCard(brand('wa'), 'WhatsApp', PHONE, pageWa)}
      ${contactCard(brand('tg'), 'Telegram', '@office8_work', TG)}
      ${contactCard(brand('ig'), 'Instagram', '@office8_', IG)}
    </ul>
  </div>
</div>`;

  /* ───────── карточка услуги с фото (как «Типы недвижимости» на главной) ───────── */
  function svcCard(s, size = 'md') {
    const big = size === 'lg';
    const box = big ? 'min-h-[300px] p-5 sm:min-h-[360px] sm:p-7 xl:min-h-[456px]' : size === 'tall' ? 'min-h-[280px] p-5 sm:min-h-[340px] sm:p-6' : 'min-h-[230px] p-4 sm:min-h-[220px] sm:p-5';
    return `
<a href="${svcHref(s.slug)}" class="svc-link group relative isolate flex h-full ${box} flex-col overflow-hidden rounded-[20px] bg-slate-900 ring-1 ring-slate-200/70 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-24px_rgba(11,31,58,0.6)]">
  <img src="${photo(s.hero, big ? 1400 : 800)}" alt="" loading="lazy" class="absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105">
  <span aria-hidden="true" class="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-slate-950/90 via-slate-950/55 to-slate-950/20"></span>
  <span class="flex items-start justify-between gap-3">
    <span class="flex size-12 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/25 backdrop-blur-sm transition-colors duration-300 group-hover:bg-gold group-hover:ring-gold">${ic(s.icon, 'size-[22px]')}</span>
    <span class="match-badge h-7 items-center gap-1 rounded-full bg-gold px-2.5 text-[12px] font-semibold text-white">${ic('sparkles', 'size-3.5')}Подходит</span>
  </span>
  <span class="mt-auto block pt-8">
    ${s.sub && /[a-z]/i.test(s.title) ? `<span class="mb-1 block text-[12px] font-semibold uppercase tracking-[0.06em] text-gold">${s.sub}</span>` : ''}
    <span class="block ${big ? 'text-[24px] sm:text-[32px]' : 'text-[18px] sm:text-[20px]'} font-semibold leading-tight text-white">${nameOf(s)}</span>
    <span class="mt-2 block ${big ? 'max-w-lg text-[15px] sm:text-[16px]' : 'text-[13px]'} leading-snug text-white/75">${big ? s.lead : s.short}</span>
    <span class="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-white">Подробнее${ic('arrow-up-right', 'card-arrow size-4')}</span>
  </span>
</a>`;
  }

  /* ───────── общий CTA-блок ───────── */
  function ctaBlock(title, text, waText) {
    const steps = ['Расскажите о задаче удобным способом', 'Уточним детали и предложим формат работы', 'Подготовим предложение под ваш объект'];
    return `
<section class="reveal facade-dark relative mt-12 overflow-hidden rounded-[24px] p-6 sm:mt-16 sm:p-10 xl:p-14">
  ${windowsArt('bottom-0 right-0 h-64 w-64 translate-y-8 opacity-[0.16] sm:h-96 sm:w-96')}
  <div class="relative grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-12">
    <div>
      <h2 class="text-[24px] font-bold leading-tight text-white sm:text-[34px]">${title}</h2>
      <p class="mt-3 max-w-xl text-[15px] leading-relaxed text-white/75 sm:text-[16px]">${text}</p>
      <ul class="mt-6 space-y-2.5">${steps.map(t => `<li class="flex items-start gap-2.5 text-[15px] leading-snug text-white/85"><span class="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-white/15 text-white">${ic('check', 'size-3')}</span>${t}</li>`).join('')}</ul>
    </div>
    <div class="grid gap-3 sm:grid-cols-2">
      <a href="${wa(waText)}" target="_blank" rel="noopener noreferrer" class="group flex items-center gap-4 rounded-2xl bg-white p-4 shadow-[0_10px_24px_-16px_rgba(0,0,0,0.6)] transition-transform hover:-translate-y-0.5 sm:col-span-2 sm:p-5">
        <span class="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#25D366]/10 text-[#1fa855]">${brand('wa', 'size-6')}</span>
        <span class="min-w-0 flex-1"><span class="block text-[17px] font-semibold text-slate-900">Написать в WhatsApp</span><span class="block text-[14px] text-slate-500">${PHONE}</span></span>
        ${ic('arrow-up-right', 'card-arrow size-5 text-slate-400')}
      </a>
      <a href="${TG}" target="_blank" rel="noopener noreferrer" class="group flex items-center gap-3 rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 transition-colors hover:bg-white/15">
        <span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">${brand('tg')}</span>
        <span class="min-w-0"><span class="block text-[15px] font-semibold text-white">Telegram</span><span class="block truncate text-[13px] text-white/60">@office8_work</span></span>
      </a>
      <a href="${TEL}" class="group flex items-center gap-3 rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 transition-colors hover:bg-white/15">
        <span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">${ic('phone', 'size-[18px]')}</span>
        <span class="min-w-0"><span class="block text-[15px] font-semibold text-white">Позвонить</span><span class="block truncate text-[13px] text-white/60">${PHONE}</span></span>
      </a>
    </div>
  </div>
</section>`;
  }

  /* ═════════ СТРАНИЦА «УСЛУГИ» ═════════ */
  function renderOverview() {
    const counts = Object.fromEntries(D.categories.map(c => [c.id, D.services.filter(s => s.cat === c.id).length]));
    const chips = [['Офисы', 'building-2', 'left-[12%] top-[10%]', '0s'], ['Гостиницы', 'hotel', 'left-[0%] top-[30%]', '.6s'], ['Склады', 'warehouse', 'left-[28%] top-[56%]', '1.2s'], ['Торговля', 'shopping-bag', 'right-[6%] top-[71%]', '2.1s']];

    const hero = `
<section class="facade-dark relative isolate overflow-hidden rounded-[24px] sm:rounded-[28px]">
  ${windowsArt('bottom-0 left-0 h-72 w-72 translate-y-10 opacity-[0.10]')}
  <div class="relative grid gap-10 p-6 sm:p-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-12 xl:p-14">
    <div>
      <span class="reveal inline-flex h-8 items-center gap-2 rounded-full bg-white/10 px-3.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-gold ring-1 ring-white/15">${ic('briefcase', 'size-4')}Услуги Office8</span>
      <h1 class="reveal mt-5 text-[32px] font-bold leading-[1.08] text-white sm:text-[46px] xl:text-[56px]" style="--d:80ms">Услуги в сфере коммерческой <span class="text-gold">недвижимости</span></h1>
      <p class="reveal mt-5 max-w-xl text-[15px] leading-relaxed text-white/75 sm:text-[17px]" style="--d:160ms">Брокеридж, аналитика, консалтинг и управление объектами — для торговых, офисных, складских, многофункциональных комплексов и гостиниц.</p>
      <div class="reveal mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap" style="--d:240ms">
        <a href="${wa('Здравствуйте! Хочу обсудить задачу по коммерческой недвижимости.')}" target="_blank" rel="noopener noreferrer" class="${BTN_WHITE}">${brand('wa', 'size-[18px] text-[#1fa855]')}Обсудить задачу</a>
        <a href="#catalog" class="${BTN_GLASS}">Все услуги${ic('arrow-down', 'size-4')}</a>
      </div>
      <dl class="reveal mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-white/10 pt-6" style="--d:320ms">
        <div><dt class="text-[12px] leading-snug text-white/55">Услуг</dt><dd class="mt-1 text-[28px] font-bold leading-none text-white">${D.services.length}</dd></div>
        <div><dt class="text-[12px] leading-snug text-white/55">Направления</dt><dd class="mt-1 text-[28px] font-bold leading-none text-white">${D.categories.length}</dd></div>
        <div><dt class="text-[12px] leading-snug text-white/55">Типов объектов</dt><dd class="mt-1 text-[28px] font-bold leading-none text-white">5</dd></div>
      </dl>
    </div>
    <div class="relative hidden min-h-[460px] lg:block" aria-hidden="true">
      <figure class="reveal absolute right-0 top-0 h-[64%] w-[68%] overflow-hidden rounded-[22px] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)] ring-1 ring-white/15"><img src="${photo('1497366216548-37526070297c', 1000)}" alt="" class="hero-kb h-full w-full object-cover"></figure>
      <figure class="reveal absolute bottom-0 left-0 h-[50%] w-[52%] overflow-hidden rounded-[22px] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)] ring-1 ring-white/15" style="--d:140ms"><img src="${photo('1553413077-190dd305871c', 800)}" alt="" class="h-full w-full object-cover"></figure>
      <figure class="reveal absolute bottom-[4%] right-[3%] h-[30%] w-[40%] overflow-hidden rounded-[22px] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)] ring-1 ring-white/15" style="--d:260ms"><img src="${photo('1519567241046-7f570eee3ce6', 700)}" alt="" class="h-full w-full object-cover"></figure>
      ${chips.map(([t, icon, pos, d]) => `<span class="floaty absolute ${pos} inline-flex h-10 items-center gap-2 rounded-full bg-white/15 px-4 text-[14px] font-semibold text-white ring-1 ring-white/25 backdrop-blur-md" style="--d:${d}">${ic(icon, 'size-4 text-gold')}${t}</span>`).join('')}
    </div>
    <div class="grid grid-cols-3 gap-2 lg:hidden" aria-hidden="true">
      ${['1497366216548-37526070297c', '1553413077-190dd305871c', '1519567241046-7f570eee3ce6'].map(id => `<div class="aspect-[4/5] overflow-hidden rounded-2xl ring-1 ring-white/15"><img src="${photo(id, 400)}" alt="" class="h-full w-full object-cover"></div>`).join('')}
    </div>
  </div>
</section>`;

    // Бегущая строка партнёров (пока в двух местах — после первого экрана и перед подвалом). Второй ряд — копия
    // для бесшовной петли, скрыт от скринридеров; --k делает широкие логотипы ниже, чтобы все смотрелись соразмерно
    const partnerRow = copy => `<ul class="marquee-row"${copy ? ' aria-hidden="true"' : ''}>${D.partners.map(p => `<li class="flex shrink-0 items-center px-6 sm:px-8"><img src="${BASE}assets/img/partners/${p.logo}" alt="${copy ? '' : p.name}" width="${p.w}" height="${p.h}" decoding="async" class="partner-logo" style="--k:${((p.h / p.w) ** 0.4 * (p.scale || 1)).toFixed(3)}"></li>`).join('')}</ul>`;
    const partners = `
<section class="reveal mt-5 flex flex-col gap-4 ${CARD} py-5 sm:mt-6 sm:py-6 lg:flex-row lg:items-center lg:gap-0">
  <h2 class="shrink-0 px-5 text-[13px] font-semibold uppercase tracking-[0.08em] text-slate-500 sm:px-6 lg:border-r lg:border-slate-200 lg:py-2.5 lg:pr-8">Наши партнёры</h2>
  <div class="marquee min-w-0 flex-1" style="--dur:${D.partners.length * 4}s">${partnerRow(false)}${partnerRow(true)}</div>
</section>`;

    const roles = `
<section id="roles"class="reveal mt-5 rounded-2xl bg-white p-4 ring-1 ring-slate-200/70 sm:mt-6 sm:p-6">
  <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
    <div>
      <h2 class="${H2}">Подберём услугу под вашу задачу</h2>
      <p class="mt-1 text-[14px] text-slate-500">Выберите, кто вы, — подсветим подходящие услуги в каталоге</p>
    </div>
    <div class="no-scrollbar -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <div role="tablist" aria-label="Кто вы" class="inline-flex gap-1 rounded-full bg-slate-100 p-1">
        ${D.roles.map((r, i) => `<button type="button" role="tab" data-role="${r.id}" aria-selected="${i === 0}" class="tab-btn inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-full px-4 text-[14px] font-medium text-slate-600 transition-colors hover:text-slate-900">${ic(r.icon, 'size-4')}${r.t}</button>`).join('')}
      </div>
    </div>
  </div>
  ${D.roles.filter(r => r.services).map(r => `
  <div data-role-panel="${r.id}" class="tab-panel mt-4 flex flex-col gap-4 rounded-2xl bg-gold-soft/70 p-4 ring-1 ring-gold/30 lg:flex-row lg:items-center" hidden>
    <span class="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white text-gold-hover shadow-sm">${ic(r.icon, 'size-6')}</span>
    <div class="min-w-0 lg:max-w-sm">
      <p class="text-[15px] font-semibold text-slate-900">${r.t}: ${r.services.length} ${plural(r.services.length, ['услуга', 'услуги', 'услуг'])}</p>
      <p class="mt-0.5 text-[14px] leading-snug text-slate-600">${r.d}</p>
    </div>
    <div class="flex flex-wrap gap-2 lg:ml-auto lg:justify-end">
      ${r.services.map(slug => `<a href="${svcHref(slug)}" class="inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-3.5 text-[13px] font-semibold text-slate-800 ring-1 ring-slate-200 transition-colors hover:bg-primary hover:text-white hover:ring-primary">${ic(svcs[slug].icon, 'size-4')}${nameOf(svcs[slug])}</a>`).join('')}
    </div>
  </div>`).join('')}
</section>`;

    const tabs = `
<div id="catalog" class="sticky top-[58px] z-30 -mx-4 mt-6 scroll-mt-24 px-4 py-2 sm:mx-0 sm:px-0 md:top-2">
  <div class="no-scrollbar flex w-max max-w-full gap-1.5 overflow-x-auto rounded-2xl bg-white/85 p-1.5 shadow-[0_8px_24px_-18px_rgba(11,31,58,0.5)] ring-1 ring-slate-200/70 backdrop-blur-md">
    ${D.categories.map(c => `<a href="#cat-${c.id}" class="cat-tab inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-xl px-3.5 text-[14px] font-medium text-slate-700 transition-colors hover:bg-slate-100">${ic(c.icon, 'size-4')}${c.title}<span class="cnt rounded-full bg-slate-100 px-1.5 text-[12px] font-semibold leading-5 text-slate-500">${counts[c.id]}</span></a>`).join('')}
  </div>
</div>`;

    const sections = D.categories.map(c => {
      const list = D.services.filter(s => s.cat === c.id);
      const bento = list.length >= 5;
      return `
<section id="cat-${c.id}" class="scroll-mt-28 pt-8 sm:pt-12">
  <div class="reveal flex items-start gap-4">
    <span class="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/[0.08] text-primary">${ic(c.icon, 'size-6')}</span>
    <div>
      <h2 class="text-[24px] font-bold leading-tight text-slate-900 sm:text-[30px]">${c.title}</h2>
      <p class="mt-2 max-w-2xl text-[15px] leading-relaxed text-slate-500">${c.desc}</p>
    </div>
  </div>
  <ul class="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 ${bento ? 'xl:grid-cols-4' : 'xl:grid-cols-3'}">
    ${list.map((s, i) => {
      const span = i === 0 ? (bento ? 'sm:col-span-2 xl:row-span-2' : 'sm:col-span-2 xl:col-span-1') : '';
      const size = i === 0 && bento ? 'lg' : bento ? 'md' : 'tall';
      return `<li class="svc-item ${span}" data-slug="${s.slug}"><div class="reveal h-full" style="--d:${i * 70}ms">${svcCard(s, size)}</div></li>`;
    }).join('')}
  </ul>
</section>`;
    }).join('');

    return `
<main class="flex-1">
  <div class="container-page pb-6 pt-4 sm:pt-6">
    ${hero}
    ${partners}
    ${roles}
    ${tabs}
    ${sections}
    ${ctaBlock('Не нашли нужную услугу?', 'Расскажите о задаче — подскажем, с чего начать и какие услуги понадобятся именно вашему объекту.', 'Здравствуйте! Хочу обсудить задачу по коммерческой недвижимости.')}
    ${partners}
  </div>
</main>`;
  }

  /* ═════════ СТРАНИЦА УСЛУГИ: блоки ═════════ */
  const section = (inner, attrs = '') => `<section class="reveal ${CARD} p-5 sm:p-7"${attrs ? ' ' + attrs : ''}>${inner}</section>`;
  const head = (title, aside = '') => `<div class="flex flex-wrap items-end justify-between gap-x-4 gap-y-1"><h2 class="${H2}">${title}</h2>${aside}</div>`;
  const note = t => `<span class="text-[13px] font-medium text-slate-500">${t}</span>`;
  const badge = t => `<span class="inline-flex h-7 items-center rounded-full bg-slate-100 px-2.5 text-[12px] font-semibold text-slate-500">${t}</span>`;
  const check = cls => `<span class="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 ${cls || ''}">${ic('check', 'size-3.5')}</span>`;

  function svcHero(s, c) {
    return `
<section class="relative isolate flex min-h-[480px] overflow-hidden rounded-[24px] bg-slate-900 sm:min-h-[540px] sm:rounded-[28px] xl:min-h-[580px]">
  <img src="${photo(s.hero, 2000, 75)}" alt="" class="hero-kb absolute inset-0 -z-10 h-full w-full object-cover">
  <span aria-hidden="true" class="absolute inset-0 -z-10 bg-gradient-to-t from-slate-950/95 via-slate-950/55 to-slate-950/10"></span>
  <span aria-hidden="true" class="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950/75 via-slate-950/25 to-transparent"></span>
  <span aria-hidden="true" class="floaty absolute right-6 top-6 hidden sm:block xl:right-10 xl:top-10">${facadeIcon(ic(s.icon, 'size-9 text-gold'), 'size-20 rounded-[26px]')}</span>
  <div class="mt-auto w-full p-6 pb-16 sm:p-10 sm:pb-20 xl:p-14 xl:pb-24">
    <div class="reveal flex flex-wrap items-center gap-2">
      <a href="${homeHref}#cat-${c.id}" class="inline-flex h-8 items-center gap-1.5 rounded-full bg-white/10 px-3 text-[12px] font-semibold text-white ring-1 ring-white/20 backdrop-blur-sm transition-colors hover:bg-white/20">${ic(c.icon, 'size-4 text-gold')}${c.title}</a>
      <span class="inline-flex h-8 items-center rounded-full bg-gold px-3 text-[12px] font-semibold text-white">${s.sub}</span>
    </div>
    <h1 class="reveal mt-4 max-w-4xl text-[32px] font-bold leading-[1.06] text-white [overflow-wrap:anywhere] sm:text-[48px] xl:text-[60px]" style="--d:80ms">${s.title}</h1>
    <p class="reveal mt-4 max-w-2xl text-[15px] leading-relaxed text-white/80 sm:text-[18px]" style="--d:160ms">${s.lead}</p>
    <div class="reveal mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap" style="--d:240ms">
      <a href="${wa(svcText(s))}" target="_blank" rel="noopener noreferrer" class="${BTN_WHITE}">${brand('wa', 'size-[18px] text-[#1fa855]')}Обсудить задачу</a>
      <a href="${TEL}" class="${BTN_GLASS}">${ic('phone', 'size-[18px]')}${PHONE}</a>
    </div>
  </div>
</section>`;
  }

  const factsStrip = s => `
<section class="reveal relative z-10 mx-3 -mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-2xl bg-slate-200/70 shadow-[0_24px_48px_-28px_rgba(11,31,58,0.45)] ring-1 ring-slate-200/70 sm:mx-6 sm:grid-cols-2 xl:mx-10 xl:grid-cols-4">
  ${s.facts.map(f => `<div class="flex items-start gap-3 bg-white p-4 sm:p-5"><span class="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/[0.08] text-primary">${ic(f.icon, 'size-5')}</span><div class="min-w-0"><p class="text-[15px] font-semibold leading-snug text-slate-900">${f.t}</p><p class="mt-0.5 text-[13px] leading-snug text-slate-500">${f.d}</p></div></div>`).join('')}
</section>`;

  function aboutBlock(s, extra = '') {
    const img = s.aboutImg;
    return section(`
  ${head('Об услуге')}
  <div class="mt-4 grid gap-6 ${img ? 'md:grid-cols-[minmax(0,1fr)_260px] xl:grid-cols-[minmax(0,1fr)_300px]' : ''}">
    <div class="space-y-4 text-[15px] leading-relaxed text-slate-700 sm:text-[16px]">${s.about.map(p => `<p>${p}</p>`).join('')}${extra}</div>
    ${img ? `<figure class="group relative overflow-hidden rounded-2xl bg-slate-100 max-md:aspect-[16/10] md:min-h-[260px]"><img src="${photo(img.id, 700)}" alt="${img.cap}" loading="lazy" class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"><figcaption class="absolute inset-x-3 bottom-3 rounded-xl bg-white/90 px-3 py-2 text-[12px] font-medium text-slate-700 backdrop-blur">${img.cap}</figcaption></figure>` : ''}
  </div>`);
  }

  function includedBlock(s) {
    const items = s.included, n = items.length;
    return section(`
  ${head(s.includedTitle || 'Что входит в услугу', note(`${n} ${plural(n, ['пункт', 'пункта', 'пунктов'])}`))}
  <ul class="mt-5 grid gap-3 sm:grid-cols-2">
    ${items.map((it, i) => `<li class="reveal group flex gap-4 rounded-xl bg-slate-50 p-4 transition-colors hover:bg-primary/[0.04] ${i === n - 1 && n % 2 ? 'sm:col-span-2' : ''}" style="--d:${(i % 2) * 70 + Math.floor(i / 2) * 50}ms">
      <span class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white text-primary ring-1 ring-slate-200/70 transition-colors duration-300 group-hover:bg-primary group-hover:text-white group-hover:ring-primary">${ic(it.icon, 'size-5')}</span>
      <div class="min-w-0"><p class="text-[12px] font-bold tabular-nums text-slate-300">${pad(i + 1)}</p><p class="text-[15px] font-semibold leading-snug text-slate-900">${it.t}</p>${it.d ? `<p class="mt-1 text-[13.5px] leading-relaxed text-slate-500">${it.d}</p>` : ''}</div>
    </li>`).join('')}
  </ul>`);
  }

  const timeline = steps => `
<div class="tl mt-6" data-tl>
  <span class="tl-track" aria-hidden="true"><span class="tl-fill"></span></span>
  <ol class="relative">
    ${steps.map((st, i) => `<li class="tl-step relative flex gap-4 pb-6 last:pb-0">
      <span class="tl-dot relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-slate-200 bg-white text-[13px] font-bold tabular-nums text-slate-500">${pad(i + 1)}</span>
      <div class="min-w-0 pt-1.5"><p class="text-[16px] font-semibold leading-snug text-slate-900">${st.t}</p>${st.d ? `<p class="mt-1 text-[14px] leading-relaxed text-slate-500">${st.d}</p>` : ''}</div>
    </li>`).join('')}
  </ol>
</div>`;

  const timelineBlock = (steps, title) => section(`${head(title, note(`${steps.length} ${plural(steps.length, ['этап', 'этапа', 'этапов'])}`))}${timeline(steps)}`);

  const resultBox = (text, label = 'Результат') => `
<div class="reveal flex gap-4 rounded-2xl bg-gold-soft p-5 ring-1 ring-gold/40 sm:p-6">
  <span class="pulse-gold flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gold text-white">${ic('trophy', 'size-5')}</span>
  <div class="min-w-0"><p class="text-[13px] font-semibold uppercase tracking-[0.08em] text-gold-hover">${label}</p><p class="mt-1 text-[16px] font-medium leading-relaxed text-slate-900 sm:text-[17px]">${text}</p></div>
</div>`;

  function galleryBlock(s) {
    const g = s.gallery;
    return `
<section class="reveal grid gap-3 ${g.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-[1.35fr_1fr]'}">
  ${g.map(p => `<figure class="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-200 ${g.length === 2 ? 'sm:aspect-auto sm:h-[300px]' : ''}"><img src="${photo(p.id, 900)}" alt="${p.cap}" loading="lazy" class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"><figcaption class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/75 to-transparent p-4 pt-12 text-[14px] font-semibold text-white">${p.cap}</figcaption></figure>`).join('')}
</section>`;
  }

  const extraBlock = e => `
<section class="reveal flex flex-col gap-4 rounded-2xl bg-white p-5 ring-1 ring-slate-200/70 sm:flex-row sm:items-center sm:p-6">
  <span class="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gold-soft text-gold-hover">${ic(e.icon, 'size-6')}</span>
  <div class="min-w-0 flex-1"><p class="text-[17px] font-semibold text-slate-900">${e.t}</p><p class="mt-0.5 text-[14px] text-slate-500">${e.d}</p></div>
  <a href="${e.href}" class="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-100 px-5 text-[14px] font-semibold text-slate-900 transition-colors hover:bg-slate-200">${e.cta}${ic('arrow-up-right', 'size-4')}</a>
</section>`;

  /* ── уникальные блоки ── */
  const typesBlock = s => section(`
  ${head('С какими объектами работаем', note('5 типов'))}
  <ul class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
    ${s.types.map((t, i) => `<li class="reveal ${i === 4 ? 'col-span-2 sm:col-span-1' : ''}" style="--d:${i * 70}ms"><div class="group relative isolate flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl bg-slate-900 p-3 sm:p-4 ${i === 4 ? 'max-sm:aspect-[2/1]' : ''}">
      <img src="${photo(t.id, 600)}" alt="" loading="lazy" class="absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110">
      <span aria-hidden="true" class="absolute inset-0 -z-10 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent"></span>
      <span class="flex size-9 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-white/25 backdrop-blur-sm transition-colors group-hover:bg-gold group-hover:ring-gold">${ic(t.icon, 'size-[18px]')}</span>
      <span class="mt-2 text-[14px] font-semibold leading-tight text-white [hyphens:manual] sm:text-[15px]">${t.t}</span>
    </div></li>`).join('')}
  </ul>`);

  function preleasingBlock(s) {
    const p = s.preleasing;
    return `
<section class="reveal overflow-hidden ${CARD}">
  <div class="relative isolate h-[220px] sm:h-[300px]">
    <img src="${photo(p.img, 1400)}" alt="" loading="lazy" class="absolute inset-0 -z-10 h-full w-full object-cover">
    <span aria-hidden="true" class="absolute inset-0 -z-10 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent"></span>
    <div class="absolute inset-x-0 bottom-0 p-5 sm:p-7">
      <span class="inline-flex h-7 items-center gap-1.5 rounded-full bg-gold px-3 text-[12px] font-semibold text-white">${ic('hard-hat', 'size-3.5')}Ещё до ввода в эксплуатацию</span>
      <h2 class="mt-3 text-[22px] font-bold leading-tight text-white sm:text-[30px]">${p.title}</h2>
    </div>
  </div>
  <div class="space-y-6 p-5 sm:p-7">
    <div class="grid gap-4 text-[15px] leading-relaxed text-slate-700 md:grid-cols-2">${p.p.map(x => `<p>${x}</p>`).join('')}</div>
    <div>
      <h3 class="${EYEBROW}">В рамках услуги</h3>
      <ol class="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        ${p.steps.map((st, i) => `<li class="reveal flex items-start gap-3 rounded-xl bg-slate-50 p-3.5" style="--d:${i * 50}ms"><span class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-[12px] font-bold tabular-nums text-white">${pad(i + 1)}</span><span class="pt-1 text-[14px] font-medium leading-snug text-slate-800">${st.t}</span></li>`).join('')}
      </ol>
    </div>
    ${resultBox(p.result, 'Результат для собственника')}
  </div>
</section>`;
  }

  const chainBlock = s => section(`
  ${head('Путь объекта на рынке')}
  <p class="mt-2 text-[15px] leading-relaxed text-slate-500">Одна команда ведёт объект на каждом этапе — от позиционирования до сделки.</p>
  <div class="relative mt-6">
    <span aria-hidden="true" class="absolute left-[10%] right-[10%] top-1/2 hidden h-0.5 -translate-y-1/2 bg-gradient-to-r from-gold via-primary/40 to-gold md:block"></span>
    <ol class="relative grid gap-2 md:grid-cols-5 md:gap-3">
      ${s.chain.map((t, i) => `<li class="chain-step flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 md:min-h-[96px] md:flex-col md:items-start md:justify-between md:px-3.5" style="--d:${i * 1.5}s"><span class="text-[12px] font-bold tabular-nums opacity-60">${pad(i + 1)}</span><span class="text-[14px] font-semibold leading-snug [hyphens:manual] md:text-[13px] xl:text-[14px]">${t}</span></li>`).join('')}
    </ol>
  </div>`);

  const phasesBlock = s => section(`
  ${head('В рамках эксклюзивного брокериджа мы обеспечиваем')}
  <div role="tablist" aria-label="Этапы" class="mt-5 grid grid-cols-3 gap-1 rounded-2xl bg-slate-100 p-1">
    ${s.phases.map((p, i) => `<button type="button" role="tab" id="ph-tab-${i}" aria-controls="ph-${i}" aria-selected="${i === 0}" class="tab-btn flex items-center justify-center gap-2 rounded-xl px-1.5 py-2.5 text-[12px] font-semibold leading-tight text-slate-600 transition-colors [hyphens:manual] hover:text-slate-900 sm:px-2 sm:text-[14px]"><span class="tab-ic hidden size-7 shrink-0 items-center justify-center rounded-lg bg-white text-primary sm:flex">${ic(p.icon, 'size-4')}</span>${p.t}</button>`).join('')}
  </div>
  ${s.phases.map((p, i) => `<div role="tabpanel" id="ph-${i}" aria-labelledby="ph-tab-${i}" class="tab-panel mt-5 grid gap-5 md:grid-cols-[minmax(0,1fr)_240px] xl:grid-cols-[minmax(0,1fr)_280px]"${i ? ' hidden' : ''}>
    <div>
      <p class="text-[15px] text-slate-500">${p.d}</p>
      <ul class="mt-4 space-y-3">${p.items.map(it => `<li class="flex items-start gap-3 text-[15px] leading-relaxed text-slate-800">${check()}${it}</li>`).join('')}</ul>
    </div>
    <figure class="relative overflow-hidden rounded-2xl bg-slate-100 max-md:aspect-[16/9] md:min-h-[220px]"><img src="${photo(p.img, 700)}" alt="" loading="lazy" class="absolute inset-0 h-full w-full object-cover"></figure>
  </div>`).join('')}`, '');

  const needsBlock = s => section(`
  ${head('С чего начинаем: анализ потребностей')}
  <ul class="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
    ${s.needs.map((n, i) => `<li class="reveal flex flex-col items-start gap-2 rounded-xl bg-slate-50 px-3 py-3 min-[480px]:flex-row min-[480px]:items-center min-[480px]:gap-3 sm:px-4" style="--d:${i * 60}ms"><span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary ring-1 ring-slate-200/70">${ic(n.icon, 'size-5')}</span><span class="text-[14px] font-semibold leading-snug text-slate-900">${n.t}</span></li>`).join('')}
  </ul>`);

  function compareBlock(s) {
    const marks = [[2, 3, 2, 1, 3, 2], [3, 1, 2, 3, 2, 1], [3, 3, 3, 2, 3, 3]];
    const dots = n => `<span class="inline-flex gap-1" aria-label="${n} из 3">${[1, 2, 3].map(k => `<span class="size-2 rounded-full ${k <= n ? 'bg-primary' : 'bg-slate-200'}"></span>`).join('')}</span>`;
    return section(`
  ${head('Сравниваем объекты по сути', badge('Пример'))}
  <p class="mt-2 text-[14px] leading-relaxed text-slate-500">Сводим варианты в одну таблицу, чтобы решение принималось по фактам, а не по впечатлениям.</p>
  <div class="no-scrollbar mt-5 overflow-x-auto">
    <table class="w-full min-w-[520px] border-separate border-spacing-0 text-[14px]">
      <thead><tr>
        <th class="py-2 pr-4 text-left text-[12px] font-semibold uppercase tracking-wide text-slate-400">Критерий</th>
        ${['Объект A', 'Объект B', 'Объект C'].map((t, i) => `<th class="px-3 py-2 text-left ${i === 2 ? 'rounded-t-xl bg-gold-soft' : ''}"><span class="text-[13px] font-semibold text-slate-900">${t}</span>${i === 2 ? `<span class="ml-2 inline-flex h-6 items-center rounded-full bg-gold px-2 text-[11px] font-semibold text-white">Лучший</span>` : ''}</th>`).join('')}
      </tr></thead>
      <tbody>
        ${s.compare.map((c, r) => `<tr><td class="border-t border-slate-100 py-3 pr-4 font-medium text-slate-700">${c}</td>${marks.map((m, i) => `<td class="border-t border-slate-100 px-3 py-3 ${i === 2 ? `bg-gold-soft ${r === s.compare.length - 1 ? 'rounded-b-xl' : ''}` : ''}">${dots(m[r])}</td>`).join('')}</tr>`).join('')}
      </tbody>
    </table>
  </div>`);
  }

  const channelsBlock = s => section(`
  ${head('Где находим арендаторов')}
  <div class="mt-5 grid items-center gap-3 md:grid-cols-[1fr_auto_1fr]">
    <ul class="space-y-2">${s.channels.map((ch, i) => `<li class="reveal flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3" style="--d:${i * 90}ms"><span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary ring-1 ring-slate-200/70">${ic(ch.icon, 'size-5')}</span><span class="text-[15px] font-semibold text-slate-900">${ch.t}</span></li>`).join('')}</ul>
    <span class="flex justify-center text-gold">${ic('arrow-right', 'size-7 max-md:rotate-90')}</span>
    <div class="facade-dark relative overflow-hidden rounded-2xl p-5 text-white sm:p-6">
      ${windowsArt('bottom-0 right-0 h-28 w-28 translate-y-4 opacity-[0.16]')}
      <span class="pulse-gold relative flex size-12 items-center justify-center rounded-2xl bg-gold text-white">${ic('key-round', 'size-6')}</span>
      <p class="relative mt-4 text-[18px] font-bold leading-snug">Арендатор для вашего объекта</p>
      <p class="relative mt-1 text-[14px] leading-relaxed text-white/70">Организуем показы, собираем обратную связь и работаем с возражениями</p>
    </div>
  </div>
  <h3 class="mt-8 ${EYEBROW}">Готовим материалы</h3>
  <ul class="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
    ${s.pack.map((p, i) => `<li class="reveal flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 px-3 py-4 text-center ${i === s.pack.length - 1 ? 'max-sm:col-span-2' : ''}" style="--d:${i * 60}ms"><span class="flex size-10 items-center justify-center rounded-xl bg-primary/[0.08] text-primary">${ic(p.icon, 'size-5')}</span><span class="text-[13px] font-semibold leading-snug text-slate-800">${p.t}</span></li>`).join('')}
  </ul>`);

  function confidentialBlock(s) {
    const cf = s.confidential;
    return `
<section class="reveal facade-dark relative overflow-hidden rounded-2xl p-5 sm:p-7">
  ${windowsArt('bottom-0 left-0 h-40 w-40 translate-y-6 opacity-[0.12]')}
  <div class="relative grid gap-6 md:grid-cols-[minmax(0,1fr)_300px] md:items-center">
    <div>
      <span class="inline-flex h-7 items-center gap-1.5 rounded-full bg-white/10 px-3 text-[12px] font-semibold text-gold ring-1 ring-white/15">${ic('lock', 'size-3.5')}Конфиденциально</span>
      <h2 class="mt-3 text-[22px] font-bold leading-tight text-white sm:text-[26px]">${cf.t}</h2>
      <p class="mt-3 text-[15px] leading-relaxed text-white/75">${cf.d}</p>
      <a href="${wa('Здравствуйте! Хочу получить доступ к закрытым инвестиционным предложениям.')}" target="_blank" rel="noopener noreferrer" class="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-[15px] font-semibold text-slate-900 transition-transform hover:-translate-y-0.5">Запросить доступ${ic('arrow-right', 'size-4')}</a>
    </div>
    <div class="rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/10 backdrop-blur" aria-hidden="true">
      <div class="flex items-center justify-between"><p class="text-[12px] font-semibold uppercase tracking-[0.08em] text-white/50">Закрытое предложение</p>${ic('lock', 'size-4 text-gold')}</div>
      <ul class="mt-2 divide-y divide-white/10">${cf.rows.map(r => `<li class="flex items-center justify-between gap-3 py-2.5"><span class="flex items-center gap-2 text-[13px] text-white/75">${ic(r.icon, 'size-4 shrink-0 text-gold')}${r.t}</span><span class="blurred shrink-0 text-[14px] font-bold text-white">▮▮▮ ▮▮</span></li>`).join('')}</ul>
    </div>
  </div>
</section>`;
  }

  function marketAboutExtra(s) {
    return `
<div class="pt-2">
  <p class="${EYEBROW}">Сегменты</p>
  <div class="mt-3 flex flex-wrap gap-2">${s.segments.map(x => `<span class="inline-flex h-9 items-center gap-1.5 rounded-full bg-slate-100 px-3.5 text-[13px] font-semibold text-slate-700">${ic(x.icon, 'size-4 text-primary')}${x.t}</span>`).join('')}</div>
</div>
<div class="grid gap-2 pt-2 sm:grid-cols-3">${s.audience.map((a, i) => `<div class="reveal rounded-xl bg-slate-50 p-4" style="--d:${i * 80}ms"><span class="flex size-10 items-center justify-center rounded-xl bg-white text-primary ring-1 ring-slate-200/70">${ic(a.icon, 'size-5')}</span><p class="mt-3 text-[15px] font-semibold text-slate-900">${a.t}</p><p class="mt-0.5 text-[13px] leading-snug text-slate-500">${a.d}</p></div>`).join('')}</div>`;
  }

  function chartBlock() {
    const series = [
      { id: 'office', t: 'Офисы', c: '#0b1f3a', d: 'M0,190 C60,182 100,152 160,156 S260,122 320,112 S400,96 440,82', f: 'M440,82 C490,70 560,58 640,46' },
      { id: 'warehouse', t: 'Склады', c: '#c9a66b', d: 'M0,214 C70,210 120,200 170,186 S270,166 330,150 S410,130 440,120', f: 'M440,120 C500,108 570,96 640,84' },
      { id: 'retail', t: 'Торговля', c: '#94a3b8', d: 'M0,160 C60,170 110,186 170,178 S260,160 320,166 S400,150 440,146', f: 'M440,146 C500,140 570,132 640,126' }
    ];
    return section(`
  ${head('Видим рынок целиком', `<div class="flex flex-wrap gap-2">${series.map(x => `<button type="button" data-series="${x.id}" aria-pressed="true" class="series-chip inline-flex h-9 items-center gap-2 rounded-full bg-slate-100 px-3.5 text-[13px] font-semibold text-slate-700 transition-opacity"><span class="size-2.5 rounded-full" style="background:${x.c}"></span>${x.t}</button>`).join('')}</div>`)}
  <p class="mt-2 text-[14px] text-slate-500">Динамика и прогноз по сегментам — основа для решений об аренде, продаже и инвестициях</p>
  <div class="relative mt-5">
    <svg viewBox="0 0 640 240" class="block h-auto w-full overflow-visible" aria-hidden="true">
      <defs><linearGradient id="o8-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1f3a" stop-opacity=".16"/><stop offset="1" stop-color="#0b1f3a" stop-opacity="0"/></linearGradient></defs>
      ${[40, 90, 140, 190].map(y => `<line x1="0" x2="640" y1="${y}" y2="${y}" stroke="#e2e8f0" stroke-width="1"/>`).join('')}
      <rect x="440" y="0" width="200" height="240" fill="#f4ecdd" opacity=".55"/>
      <line x1="440" x2="440" y1="0" y2="240" stroke="#c9a66b" stroke-width="1.5" stroke-dasharray="4 4"/>
      <path data-line="office" class="chart-area" d="${series[0].d} L440,240 L0,240 Z" fill="url(#o8-area)"/>
      ${series.map(x => `<path data-line="${x.id}" class="chart-line" pathLength="1" d="${x.d}" fill="none" stroke="${x.c}" stroke-width="3.5" stroke-linecap="round"/><path data-line="${x.id}" class="chart-area" d="${x.f}" fill="none" stroke="${x.c}" stroke-width="3.5" stroke-dasharray="2 8" stroke-linecap="round"/>`).join('')}
    </svg>
    <span class="absolute right-2 top-2">${badge('Иллюстрация')}</span>
    <div class="mt-3 flex justify-between text-[12px] font-medium text-slate-400"><span>Анализ прошлых периодов</span><span class="text-gold-hover">Сегодня → прогноз</span></div>
  </div>`, '');
  }

  function scenarioBlock() {
    return section(`
  ${head('Сценарный анализ', `<div role="tablist" aria-label="Сценарий" class="mt-2 grid w-full grid-cols-3 gap-1 rounded-2xl bg-slate-100 p-1 sm:mt-0 sm:inline-flex sm:w-auto sm:rounded-full">${['Песси&shy;мистичный', 'Базовый', 'Опти&shy;мистичный'].map((t, i) => `<button type="button" role="tab" data-sc="${i}" aria-selected="${i === 1}" class="tab-btn min-h-9 min-w-0 rounded-xl px-1 py-1.5 text-[12px] font-semibold leading-tight text-slate-600 transition-colors [hyphens:manual] sm:h-9 sm:rounded-full sm:px-4 sm:py-0 sm:text-[13px]">${t}</button>`).join('')}</div>`)}
  <p class="mt-2 text-[14px] text-slate-500">Накопленный денежный поток объекта по годам: как меняется срок окупаемости при разных допущениях</p>
  <div class="relative mt-6 h-[230px] sm:h-[260px]" data-fm-chart>
    <span aria-hidden="true" class="fm-zero absolute inset-x-0 border-t border-dashed border-slate-300"></span>
    <div class="absolute inset-0 grid grid-cols-10 gap-1.5 sm:gap-2.5">
      ${Array.from({ length: 10 }, () => `<div class="relative"><span class="fm-bar absolute inset-x-0 rounded-md bg-slate-300" style="top:65%;height:0"></span></div>`).join('')}
    </div>
    <div class="fm-marker pointer-events-none absolute inset-y-0 w-0" style="left:55%">
      <span class="absolute inset-y-0 border-l-2 border-gold"></span>
      <span class="absolute -top-1 left-2 whitespace-nowrap rounded-full bg-gold px-2.5 py-1 text-[11px] font-semibold text-white sm:text-[12px]">Окупаемость</span>
    </div>
  </div>
  <div class="mt-2 grid grid-cols-10 gap-1.5 text-center text-[11px] tabular-nums text-slate-400 sm:gap-2.5">${Array.from({ length: 10 }, (_, i) => `<span>${i + 1}</span>`).join('')}</div>
  <div class="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3">
    <p class="text-[14px] text-slate-600">Окупаемость в этом сценарии — <b class="text-slate-900" data-fm-payback>6-й год</b></p>
    ${badge('Иллюстрация')}
  </div>`);
  }

  const directionsBlock = s => section(`
  ${head('Три направления консалтинга')}
  <div class="mt-5 grid gap-4 md:grid-cols-3">
    ${s.directions.map((d, i) => `<article class="reveal group flex flex-col overflow-hidden rounded-2xl bg-slate-50 ring-1 ring-slate-200/70" style="--d:${i * 90}ms">
      <div class="relative aspect-[16/10] overflow-hidden"><img src="${photo(d.img, 700)}" alt="" loading="lazy" class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"><span class="absolute left-3 top-3 flex size-10 items-center justify-center rounded-xl bg-white/90 text-primary shadow-sm">${ic(d.icon, 'size-5')}</span></div>
      <div class="flex flex-1 flex-col p-4 sm:p-5">
        <p class="text-[12px] font-semibold uppercase tracking-[0.06em] text-gold-hover">${d.sub}</p>
        <h3 class="mt-1 text-[18px] font-semibold leading-snug text-slate-900">${d.t}</h3>
        <p class="mt-2 text-[14px] leading-relaxed text-slate-600">${d.d}</p>
        <div class="mt-auto pt-4">${d.link
          ? `<a href="${svcHref(d.link)}" class="inline-flex items-center gap-1.5 text-[14px] font-semibold text-primary hover:underline">Подробнее об услуге${ic('arrow-right', 'size-4')}</a>`
          : `<a href="${wa(`Здравствуйте! Интересует «${d.t}».`)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-[14px] font-semibold text-primary hover:underline">Обсудить проект${ic('arrow-right', 'size-4')}</a>`}</div>
      </div>
    </article>`).join('')}
  </div>`);

  function funnelBlock(s) {
    const f = s.funnel;
    return section(`
  ${head('Как выбираем наилучший сценарий', `<button type="button" data-funnel-replay class="inline-flex h-9 items-center gap-1.5 rounded-full bg-slate-100 px-3.5 text-[13px] font-semibold text-slate-700 transition-colors hover:bg-slate-200">${ic('rotate-ccw', 'size-4')}Повторить</button>`)}
  <p class="mt-2 text-[14px] text-slate-500">Каждый вариант использования проходит четыре фильтра — остаётся тот, что даёт максимальную ценность</p>
  <div class="mt-5 flex flex-wrap gap-2">${f.options.map(o => `<span data-opt="${o}" class="hbu-chip inline-flex h-9 items-center rounded-full border border-slate-200 bg-white px-3.5 text-[14px] font-semibold text-slate-800">${o}</span>`).join('')}</div>
  <ol class="mt-5 space-y-2">
    ${f.layers.map((l, i) => `<li data-layer="${i}" class="hbu-layer flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl bg-slate-50 px-3 py-3 text-slate-800 sm:flex-nowrap sm:px-4" style="margin-inline:calc(${i} * min(3.5%, 26px))">
      <span class="hbu-ic flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-primary">${ic(l.icon, 'size-[18px]')}</span>
      <span class="min-w-0 flex-1 text-[14px] font-semibold leading-snug sm:text-[15px]">${l.t}</span>
      <span class="hbu-out w-full pl-12 text-[12px] font-medium sm:w-auto sm:shrink-0 sm:pl-0">− ${l.out.join(', ')}</span>
    </li>`).join('')}
  </ol>
  <div data-funnel-result class="hbu-result mt-4 flex flex-wrap items-center justify-center gap-3 rounded-2xl bg-gold-soft p-4 ring-1 ring-gold/40" style="margin-inline:calc(${f.layers.length} * min(3.5%, 26px))">
    <span class="flex size-10 items-center justify-center rounded-xl bg-gold text-white">${ic('trophy', 'size-5')}</span>
    <p class="text-[15px] font-semibold text-slate-900">Оптимальная стратегия: <span class="text-gold-hover">${f.win}</span></p>
    ${badge('Пример')}
  </div>`, 'data-funnel');
  }

  const roadmapBlock = s => section(`
  ${head('Дорожная карта реализации')}
  <div class="relative mt-8">
    <div aria-hidden="true" class="absolute left-[10%] right-[10%] top-6 hidden h-1 overflow-hidden rounded-full bg-slate-200 md:block"><div class="road-fill h-full rounded-full bg-gradient-to-r from-gold to-primary"></div></div>
    <ol class="relative grid gap-3 md:grid-cols-5">
      ${s.roadmap.map((r, i) => `<li class="flex items-center gap-3 md:flex-col md:text-center"><span class="road-node flex size-12 shrink-0 items-center justify-center rounded-2xl border-2 border-slate-200 bg-white text-slate-500" style="--d:${(0.3 + i * 0.35).toFixed(2)}s">${ic(r.icon, 'size-5')}</span><div><p class="text-[12px] font-semibold text-slate-400">Этап ${i + 1}</p><p class="text-[15px] font-semibold leading-snug text-slate-900">${r.t}</p></div></li>`).join('')}
    </ol>
  </div>
  <div class="mt-8 grid gap-6 border-t border-slate-100 pt-6 md:grid-cols-2">
    <div><h3 class="${EYEBROW}">Подбираем формат</h3><div class="mt-3 flex flex-wrap gap-2">${s.formats.map(t => `<span class="inline-flex h-9 items-center rounded-full bg-slate-100 px-3.5 text-[13px] font-semibold text-slate-700">${t}</span>`).join('')}</div></div>
    <div><h3 class="${EYEBROW}">Повышаем стоимость актива</h3><div class="mt-3 flex flex-wrap gap-2">${s.levers.map(t => `<span class="inline-flex h-9 items-center gap-1.5 rounded-full bg-gold-soft px-3.5 text-[13px] font-semibold text-slate-800 ring-1 ring-gold/30">${ic('trending-up', 'size-3.5 text-gold-hover')}${t}</span>`).join('')}</div></div>
  </div>`);

  const areasBlock = s => section(`
  ${head(`${s.areas.length} направлений управления`, note('Выберите направление'))}
  <div class="mt-5 grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
    <div role="tablist" aria-label="Направления" aria-orientation="vertical" class="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0" data-pm-list>
      ${s.areas.map((a, i) => `<button type="button" role="tab" id="pm-tab-${i}" aria-controls="pm-${i}" aria-selected="${i === 0}" class="pm-tab tab-btn relative flex min-w-[230px] items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-left text-[14px] font-semibold text-slate-700 transition-colors hover:bg-slate-100 lg:min-w-0">
        <span class="tab-ic flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/[0.08] text-primary">${ic(a.icon, 'size-[18px]')}</span>
        <span class="min-w-0 flex-1 leading-snug">${a.t}</span>
        <span aria-hidden="true" class="pm-prog absolute inset-x-0 bottom-0 h-0.5 bg-gold"></span>
      </button>`).join('')}
    </div>
    <div>
      ${s.areas.map((a, i) => `<div role="tabpanel" id="pm-${i}" aria-labelledby="pm-tab-${i}" class="tab-panel overflow-hidden rounded-2xl bg-slate-50 ring-1 ring-slate-200/70"${i ? ' hidden' : ''}>
        <div class="relative aspect-[16/8] overflow-hidden bg-slate-200"><img src="${photo(a.img, 1000)}" alt="" loading="lazy" class="h-full w-full object-cover"><span class="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[12px] font-bold tabular-nums text-primary">${pad(i + 1)} / ${pad(s.areas.length)}</span></div>
        <div class="p-5 sm:p-6"><div class="flex items-center gap-3"><span class="flex size-10 items-center justify-center rounded-xl bg-primary text-white">${ic(a.icon, 'size-5')}</span><h3 class="text-[19px] font-bold leading-snug text-slate-900 sm:text-[21px]">${a.t}</h3></div><p class="mt-3 text-[15px] leading-relaxed text-slate-700 sm:text-[16px]">${a.d}</p></div>
      </div>`).join('')}
    </div>
  </div>`, 'data-pm');

  function hubBlock(s) {
    const n = s.hub.length;
    const pos = s.hub.map((_, i) => { const a = (i / n) * Math.PI * 2 - Math.PI / 2; return [50 + 39 * Math.cos(a), 50 + 39 * Math.sin(a)]; });
    return section(`
  ${head('Координируем всех участников проекта')}
  <p class="mt-2 text-[14px] text-slate-500">Мы на стороне заказчика: одна точка контакта вместо десятка подрядчиков</p>
  <div class="relative mx-auto mt-4 hidden aspect-square w-full max-w-[600px] md:block">
    <svg viewBox="0 0 100 100" class="absolute inset-0 h-full w-full" aria-hidden="true">
      <circle cx="50" cy="50" r="39" fill="none" stroke="#e2e8f0" stroke-width="1" vector-effect="non-scaling-stroke"/>
      ${pos.map(([x, y]) => `<line x1="50" y1="50" x2="${x.toFixed(2)}" y2="${y.toFixed(2)}" class="hub-line" stroke="#c9a66b" stroke-width="1.5" vector-effect="non-scaling-stroke"/>`).join('')}
    </svg>
    <div class="absolute left-1/2 top-1/2 flex size-40 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-white text-center shadow-[0_24px_48px_-24px_rgba(11,31,58,0.55)] ring-1 ring-slate-200">
      <span class="pulse-gold absolute inset-0 rounded-full"></span>
      <img src="${BASE}assets/img/logo-8-outline.png" alt="" class="h-12 w-auto">
      <p class="mt-1.5 text-[13px] font-bold text-slate-900">Office8</p>
      <p class="px-4 text-[11px] leading-tight text-slate-500">представитель заказчика</p>
    </div>
    ${s.hub.map((h, i) => `<div class="hub-node absolute flex w-[132px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5 rounded-2xl bg-white px-2 py-3 text-center ring-1 ring-slate-200/80" style="left:${pos[i][0].toFixed(2)}%;top:${pos[i][1].toFixed(2)}%"><span class="flex size-9 items-center justify-center rounded-xl bg-primary/[0.08] text-primary">${ic(h.icon, 'size-[18px]')}</span><span class="text-[12px] font-semibold leading-tight text-slate-800">${h.t}</span></div>`).join('')}
  </div>
  <ul class="mt-5 grid grid-cols-2 gap-2 md:hidden">${s.hub.map(h => `<li class="flex flex-col items-start gap-2 rounded-xl bg-slate-50 px-3 py-3 min-[480px]:flex-row min-[480px]:items-center"><span class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-primary ring-1 ring-slate-200/70">${ic(h.icon, 'size-4')}</span><span class="text-[13px] font-semibold leading-tight text-slate-800">${h.t}</span></li>`).join('')}</ul>`);
  }

  function configBlock(s) {
    const n = s.included.length;
    return section(`
  ${head('Соберите пакет услуг', `<button type="button" data-cfg-all class="text-[13px] font-semibold text-primary hover:underline">Выбрать всё</button>`)}
  <p class="mt-2 text-[14px] text-slate-500">${s.onDemand} Отметьте, что нужно вашему зданию, — отправим запрос одним сообщением.</p>
  <div class="mt-5 grid gap-2 sm:grid-cols-2">
    ${s.included.map(it => `<button type="button" aria-pressed="false" data-cfg-item="${it.t}" class="cfg-chip flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-left text-slate-800 hover:border-slate-300">
      <span class="cfg-ic flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/[0.08] text-primary transition-colors">${ic(it.icon, 'size-5')}</span>
      <span class="min-w-0 flex-1 text-[14px] font-semibold leading-snug">${it.t}</span>
      <span class="cfg-check flex size-6 shrink-0 items-center justify-center rounded-full bg-gold text-white">${ic('check', 'size-3.5')}</span>
    </button>`).join('')}
  </div>
  <div class="mt-5 flex flex-col gap-3 rounded-2xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
    <p class="text-[14px] text-slate-600">Выбрано: <b data-cfg-count class="tabular-nums text-slate-900">0</b> из ${n}</p>
    <a data-cfg-send aria-disabled="true" class="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-[15px] font-semibold text-white transition-[opacity,background-color] hover:bg-primary-hover aria-disabled:pointer-events-none aria-disabled:opacity-40">${brand('wa')}Отправить запрос</a>
  </div>`, 'data-cfg');
  }

  /* порядок блоков на странице каждой услуги */
  function blocks(s) {
    const out = [];
    const add = (...b) => out.push(...b);
    switch (s.slug) {
      case 'brokerage':
        add(aboutBlock(s), typesBlock(s), preleasingBlock(s)); break;
      case 'exclusive-brokerage':
        add(chainBlock(s), phasesBlock(s)); break;
      case 'tenant-representation':
        add(aboutBlock(s), needsBlock(s), timelineBlock(s.steps, 'Как мы работаем'), compareBlock(s)); break;
      case 'landlord-representation':
        add(aboutBlock(s), channelsBlock(s), timelineBlock(s.steps, 'Что входит в услугу'), extraBlock(s.extra)); break;
      case 'investment-brokerage':
        add(aboutBlock(s), timelineBlock(s.steps, 'Как мы работаем'), confidentialBlock(s), resultBox(s.result), extraBlock(s.extra)); break;
      case 'market-research':
        add(aboutBlock(s, marketAboutExtra(s)), chartBlock(), includedBlock(s)); break;
      case 'financial-modeling':
        add(aboutBlock(s), scenarioBlock(), includedBlock(s)); break;
      case 'strategic-consulting':
        add(directionsBlock(s)); break;
      case 'highest-best-use':
        add(funnelBlock(s), includedBlock(s)); break;
      case 'strategic-development':
        add(aboutBlock(s), roadmapBlock(s), includedBlock(s)); break;
      case 'property-management':
        add(areasBlock(s)); break;
      case 'project-management':
        add(aboutBlock(s), hubBlock(s), timelineBlock(s.steps, s.stepsTitle)); break;
      case 'facility-management':
        add(aboutBlock(s), configBlock(s)); break;
    }
    add(galleryBlock(s));
    return out.join('');
  }

  function sidebar(s, c) {
    const list = D.services.filter(x => x.cat === s.cat);
    return `
<div class="${CARD} p-5 max-md:hidden">
  <h2 class="${H2}">Обсудить услугу</h2>
  <p class="mt-1 text-[14px] leading-snug text-slate-500">Расскажите о задаче — подскажем, с чего начать</p>
  <a href="${TEL}" class="mt-3 flex min-h-11 items-center text-[20px] font-bold leading-snug text-slate-900 transition-colors hover:text-primary">${PHONE}</a>
  <div class="mt-2 grid gap-2">
    <a href="${wa(svcText(s))}" target="_blank" rel="noopener noreferrer" class="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary text-[15px] font-semibold text-white transition-colors hover:bg-primary-hover">${brand('wa')}Написать в WhatsApp</a>
    <a href="${TG}" target="_blank" rel="noopener noreferrer" class="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-100 text-[15px] font-semibold text-slate-900 transition-colors hover:bg-slate-200">${brand('tg')}Telegram</a>
  </div>
</div>
<div class="${CARD} p-5">
  <p class="${EYEBROW}">${c.title}</p>
  <ul class="mt-3 space-y-0.5">
    ${list.map(x => {
      const on = x.slug === s.slug;
      return `<li><a href="${svcHref(x.slug)}"${on ? ' aria-current="page"' : ''} class="group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors ${on ? 'bg-primary/[0.06]' : 'hover:bg-slate-50'}">
        <span class="flex size-9 shrink-0 items-center justify-center rounded-xl ${on ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500 group-hover:text-primary'}">${ic(x.icon, 'size-[18px]')}</span>
        <span class="min-w-0 flex-1 text-[14px] leading-snug ${on ? 'font-semibold text-primary' : 'font-medium text-slate-700'}">${nameOf(x)}</span>
        ${on ? '<span class="size-2 rounded-full bg-gold"></span>' : ic('chevron-right', 'size-4 text-slate-300 transition-transform group-hover:translate-x-0.5')}
      </a></li>`;
    }).join('')}
  </ul>
  <a href="${homeHref}" class="mt-3 inline-flex items-center gap-1 px-2 text-[13px] font-semibold text-primary hover:underline">Все услуги${ic('arrow-right', 'size-3.5')}</a>
</div>`;
  }

  function renderService(s) {
    const c = cats[s.cat];
    const related = `
<section class="mt-12 border-t border-slate-200/70 pt-10 sm:mt-14">
  <div class="flex flex-wrap items-end justify-between gap-3">
    <h2 class="${H2}">Связанные услуги</h2>
    <a href="${homeHref}" class="inline-flex h-10 items-center gap-1.5 rounded-full bg-white px-4 text-[13px] font-semibold text-slate-800 ring-1 ring-slate-200/80 transition-colors hover:bg-slate-50">Все услуги${ic('arrow-right', 'size-4')}</a>
  </div>
  <div class="mt-5 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">${s.related.map((r, i) => `<div class="reveal" style="--d:${i * 80}ms">${svcCard(svcs[r])}</div>`).join('')}</div>
</section>`;
    return `
<main class="flex-1">
  <div class="container-page pb-12 pt-4 sm:pt-6">
    ${svcHero(s, c)}
    ${factsStrip(s)}
    <div class="mt-8 grid gap-6 lg:mt-12 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
      <article class="min-w-0 space-y-6 sm:space-y-8">${blocks(s)}</article>
      <aside class="space-y-4 lg:sticky lg:top-6 lg:self-start">${sidebar(s, c)}</aside>
    </div>
    ${related}
    ${ctaBlock('Обсудим вашу задачу?', `Расскажите об объекте и цели — предложим, как услуга «${nameOf(s)}» поможет её достичь.`, svcText(s))}
  </div>
</main>
<div class="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-slate-200 bg-white px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 md:hidden">
  <div class="min-w-0 flex-1"><p class="truncate text-[12px] leading-snug text-slate-500">${nameOf(s)}</p><a href="${TEL}" class="flex min-h-9 items-center truncate text-[15px] font-bold text-slate-900">${PHONE}</a></div>
  <a href="${wa(svcText(s))}" target="_blank" rel="noopener noreferrer" class="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-[15px] font-semibold text-white">${brand('wa')}<span class="max-[339px]:sr-only">Написать</span></a>
</div>`;
  }

  /* ═════════ интерактив ═════════ */
  function initReveal() {
    const els = document.querySelectorAll('.reveal');
    if (REDUCED || !('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('is-in')); return; }
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    }), { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    els.forEach(e => io.observe(e));
  }

  function onVisible(el, cb, threshold = 0.35) {
    if (!('IntersectionObserver' in window)) { cb(); return; }
    const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { io.disconnect(); cb(); } }, { threshold });
    io.observe(el);
  }

  // Вкладки с панелями (role=tab / role=tabpanel) внутри root
  function initTabs(root, onChange) {
    const tabs = [...root.querySelectorAll('[role="tab"]')];
    const panels = [...root.querySelectorAll('[role="tabpanel"]')];
    const select = (i, focus) => {
      tabs.forEach((t, k) => { t.setAttribute('aria-selected', String(k === i)); t.tabIndex = k === i ? 0 : -1; });
      panels.forEach((p, k) => { p.hidden = k !== i; });
      if (focus) tabs[i].focus();
      if (onChange) onChange(i);
    };
    tabs.forEach((t, i) => {
      t.tabIndex = t.getAttribute('aria-selected') === 'true' ? 0 : -1;
      t.addEventListener('click', () => select(i));
      t.addEventListener('keydown', e => {
        const k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (k) { e.preventDefault(); select((i + k + tabs.length) % tabs.length, true); }
      });
    });
    return select;
  }

  function initRoles() {
    const root = document.getElementById('roles');
    if (!root) return;
    const btns = [...root.querySelectorAll('[data-role]')];
    const panels = [...root.querySelectorAll('[data-role-panel]')];
    const items = [...document.querySelectorAll('.svc-item')];
    btns.forEach(b => b.addEventListener('click', () => {
      const id = b.dataset.role;
      const role = D.roles.find(r => r.id === id);
      btns.forEach(x => x.setAttribute('aria-selected', String(x === b)));
      panels.forEach(p => { p.hidden = p.dataset.rolePanel !== id; });
      items.forEach(li => {
        const on = id === 'all' || role.services.includes(li.dataset.slug);
        li.classList.toggle('is-dim', !on);
        li.classList.toggle('is-match', id !== 'all' && on);
      });
    }));
  }

  function initCatTabs() {
    const tabs = [...document.querySelectorAll('.cat-tab')];
    if (!tabs.length) return;
    const secs = tabs.map(t => document.querySelector(t.getAttribute('href')));
    const update = () => {
      let cur = 0;
      secs.forEach((s, i) => { if (s.getBoundingClientRect().top < window.innerHeight * 0.4) cur = i; });
      tabs.forEach((t, i) => t.setAttribute('aria-current', String(i === cur)));
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  function initTimelines() {
    const tls = [...document.querySelectorAll('[data-tl]')];
    if (!tls.length) return;
    const update = () => {
      const mid = window.innerHeight * 0.62;
      tls.forEach(tl => {
        const r = tl.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (mid - r.top) / r.height));
        tl.style.setProperty('--p', (p * 100).toFixed(1) + '%');
        tl.querySelectorAll('.tl-step').forEach(st => {
          const d = st.querySelector('.tl-dot').getBoundingClientRect();
          st.classList.toggle('is-on', d.top + d.height / 2 < mid);
        });
      });
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  function initFunnel() {
    const root = document.querySelector('[data-funnel]');
    if (!root || !current || !current.funnel) return;
    const f = current.funnel;
    const chips = [...root.querySelectorAll('[data-opt]')];
    const layers = [...root.querySelectorAll('[data-layer]')];
    const result = root.querySelector('[data-funnel-result]');
    let timers = [];
    const reset = () => {
      timers.forEach(clearTimeout); timers = [];
      chips.forEach(c => c.classList.remove('is-out', 'is-win'));
      layers.forEach(l => l.classList.remove('is-on'));
      result.classList.remove('is-on');
    };
    const step = i => {
      layers[i].classList.add('is-on');
      chips.forEach(c => { if (f.layers[i].out.includes(c.dataset.opt)) c.classList.add('is-out'); });
    };
    const finish = () => { chips.find(c => c.dataset.opt === f.win).classList.add('is-win'); result.classList.add('is-on'); };
    const play = () => {
      reset();
      if (REDUCED) { f.layers.forEach((_, i) => step(i)); finish(); return; }
      f.layers.forEach((_, i) => timers.push(setTimeout(() => step(i), 500 + i * 1100)));
      timers.push(setTimeout(finish, 500 + f.layers.length * 1100));
    };
    root.querySelector('[data-funnel-replay]').addEventListener('click', play);
    onVisible(root, play, 0.4);
  }

  function initScenarios() {
    const root = document.querySelector('[data-fm-chart]');
    if (!root) return;
    // Иллюстративные значения накопленного денежного потока (условные единицы)
    const SC = [
      [-100, -88, -76, -63, -50, -36, -22, -7, 8, 24],
      [-100, -80, -59, -37, -14, 10, 35, 61, 88, 116],
      [-100, -74, -46, -17, 13, 45, 78, 112, 147, 183]
    ];
    const MAX = 190, RANGE = 290, ZERO = MAX / RANGE * 100;
    const box = root.closest('section');
    const bars = [...root.querySelectorAll('.fm-bar')];
    const marker = root.querySelector('.fm-marker');
    const out = box.querySelector('[data-fm-payback]');
    const btns = [...box.querySelectorAll('[data-sc]')];
    root.querySelector('.fm-zero').style.top = ZERO + '%';
    bars.forEach(b => { b.style.top = ZERO + '%'; });
    const set = k => {
      SC[k].forEach((v, i) => {
        const h = Math.abs(v) / RANGE * 100;
        bars[i].style.top = (v >= 0 ? ZERO - h : ZERO) + '%';
        bars[i].style.height = h + '%';
        bars[i].style.backgroundColor = v >= 0 ? (k === 2 ? '#c9a66b' : '#0b1f3a') : '#cbd5e1';
      });
      const pb = SC[k].findIndex(v => v >= 0);
      marker.style.left = ((pb + 0.5) * 10) + '%';
      out.textContent = `${pb + 1}-й год`;
      btns.forEach((b, i) => b.setAttribute('aria-selected', String(i === k)));
    };
    btns.forEach((b, i) => b.addEventListener('click', () => set(i)));
    onVisible(root, () => set(1), 0.3);
  }

  function initChart() {
    const root = document.querySelector('[data-series]');
    if (!root) return;
    const box = root.closest('section');
    box.querySelectorAll('[data-series]').forEach(btn => btn.addEventListener('click', () => {
      const on = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', String(on));
      box.querySelectorAll(`[data-line="${btn.dataset.series}"]`).forEach(el => el.classList.toggle('is-off', !on));
    }));
  }

  function initPhases() {
    document.querySelectorAll('[aria-label="Этапы"]').forEach(list => initTabs(list.closest('section')));
  }

  function initAreas() {
    const root = document.querySelector('[data-pm]');
    if (!root) return;
    const list = root.querySelector('[data-pm-list]');
    const tabs = [...root.querySelectorAll('[role="tab"]')];
    const DUR = 7000;
    let i = 0, timer = null, auto = !REDUCED, visible = false;
    const centerTab = k => { const t = tabs[k]; list.scrollTo({ left: t.offsetLeft - list.clientWidth / 2 + t.clientWidth / 2, behavior: 'smooth' }); };
    const select = initTabs(root, k => { i = k; if (list.scrollWidth > list.clientWidth) centerTab(k); });
    const stop = () => { clearTimeout(timer); root.classList.remove('pm-running'); };
    const run = () => {
      stop();
      if (!auto || !visible) return;
      root.classList.add('pm-running');
      timer = setTimeout(() => { select((i + 1) % tabs.length); run(); }, DUR);
    };
    tabs.forEach(t => t.addEventListener('click', () => { auto = false; stop(); }));
    root.style.setProperty('--dur', DUR / 1000 + 's');
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(es => { visible = es[0].isIntersecting; visible ? run() : stop(); }, { threshold: 0.35 }).observe(root);
    }
  }

  function initConfigurator() {
    const root = document.querySelector('[data-cfg]');
    if (!root) return;
    const items = [...root.querySelectorAll('[data-cfg-item]')];
    const count = root.querySelector('[data-cfg-count]');
    const send = root.querySelector('[data-cfg-send]');
    const all = root.querySelector('[data-cfg-all]');
    const update = () => {
      const sel = items.filter(b => b.getAttribute('aria-pressed') === 'true').map(b => b.dataset.cfgItem);
      count.textContent = sel.length;
      all.textContent = sel.length === items.length ? 'Снять выбор' : 'Выбрать всё';
      if (sel.length) {
        send.removeAttribute('aria-disabled');
        send.href = wa(`Здравствуйте! Интересует Facility Management. Нужны услуги:\n— ${sel.join('\n— ')}`);
        send.target = '_blank'; send.rel = 'noopener noreferrer';
      } else {
        send.setAttribute('aria-disabled', 'true');
        send.removeAttribute('href');
      }
    };
    items.forEach(b => b.addEventListener('click', () => { b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true')); update(); }));
    all.addEventListener('click', () => {
      const on = items.some(b => b.getAttribute('aria-pressed') !== 'true');
      items.forEach(b => b.setAttribute('aria-pressed', String(on)));
      update();
    });
    update();
  }

  // Как на сайте: если пункты шапки не помещаются в строку, она ужимается full → dense → tight
  function initHeaderFit() {
    const hdr = document.querySelector('header[data-fit]');
    const row = hdr && hdr.querySelector('[data-fit-row]');
    if (!row) return;
    const fit = () => {
      for (const f of ['full', 'dense', 'tight']) {
        hdr.dataset.fit = f;
        if (row.scrollWidth <= row.clientWidth) break;
      }
    };
    let raf = 0;
    const later = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(fit); };
    fit();
    if (window.ResizeObserver) {
      const ro = new ResizeObserver(later);
      [row, ...row.children].forEach(el => ro.observe(el));
    }
    window.addEventListener('resize', later);
    if (document.fonts) document.fonts.ready.then(fit);
  }

  // Выпадающие меню шапки (язык и валюта, уведомления)
  function initMenus() {
    const menus = [...document.querySelectorAll('[data-menu]')];
    const CLOSED = ['pointer-events-none', 'scale-95', 'opacity-0'];
    const OPEN = ['pointer-events-auto', 'scale-100', 'opacity-100'];
    const set = (m, on) => {
      m.querySelector('[aria-haspopup]').setAttribute('aria-expanded', String(on));
      const list = m.querySelector('[role="menu"]').classList;
      list.remove(...(on ? CLOSED : OPEN));
      list.add(...(on ? OPEN : CLOSED));
    };
    menus.forEach(m => {
      const btn = m.querySelector('[aria-haspopup]');
      btn.addEventListener('click', () => {
        const on = btn.getAttribute('aria-expanded') !== 'true';
        menus.forEach(x => set(x, x === m && on));
      });
      m.querySelectorAll('[role="menuitemradio"]').forEach(b => b.addEventListener('click', () => set(m, false)));
    });
    document.addEventListener('click', e => menus.forEach(m => { if (!m.contains(e.target)) set(m, false); }));
    window.addEventListener('keydown', e => { if (e.key === 'Escape') menus.forEach(m => set(m, false)); });
  }

  // Выезжающие панели: меню (справа) и «Связаться с нами» (снизу)
  function initPanel(id, attr) {
    const d = document.getElementById(id);
    const open = document.querySelector(`[data-${attr}-open]`);
    if (!d || !open) return;
    const set = on => {
      d.setAttribute('aria-hidden', String(!on));
      open.setAttribute('aria-expanded', String(on));
      document.documentElement.style.overflow = on ? 'hidden' : '';
    };
    open.addEventListener('click', () => set(true));
    d.querySelectorAll(`[data-${attr}-close], a`).forEach(el => el.addEventListener('click', () => set(false)));
    window.addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
  }

  /* ═════════ сборка страницы ═════════ */
  const main = PAGE === 'service' && current ? renderService(current) : renderOverview();
  body.insertAdjacentHTML('afterbegin', header() + main + footer() + fabs() + (current ? '' : contactSheet()) + drawer());
  if (current) document.title = `${nameOf(current)} — услуги · Office8`;

  if (window.lucide) window.lucide.createIcons({ icons: window.lucide.icons, attrs: { 'stroke-width': 1.75 } });

  initReveal();
  initHeaderFit();
  initMenus();
  initPanel('header-drawer', 'drawer');
  initPanel('contact-sheet', 'sheet');
  initRoles();
  initCatTabs();
  initTimelines();
  initPhases();
  initFunnel();
  initScenarios();
  initChart();
  initAreas();
  initConfigurator();

  // Даём Tailwind собрать стили новой разметки и только потом показываем страницу.
  // Якорь из адреса (#cat-…) отрабатываем вручную: на момент загрузки разметки ещё не было.
  let shown = false;
  const show = () => {
    if (shown) return;
    shown = true;
    document.documentElement.classList.remove('o8-loading');
    const target = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target) target.scrollIntoView({ block: 'start' });
  };
  requestAnimationFrame(() => requestAnimationFrame(show));
  setTimeout(show, 120); // rAF не срабатывает во вкладке в фоне
})();
