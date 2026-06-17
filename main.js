/* =========================================================
   Heavena's Homestay — interactions & animation
   =========================================================

   ✏️  EDIT YOUR DETAILS HERE  ───────────────────────────────
   Fill in the values below. Everything on the page that depends
   on them (booking buttons, phone, email, address, distances,
   price) updates automatically. Leave a field as "" to hide it.
*/
const CONFIG = {
  // The page guests open to book. Use your Airbnb / Booking.com /
  // MakeMyTrip listing URL. (Until set, "Check availability" buttons
  // gently scroll to the contact section.)
  listingUrl: "",                       // e.g. "https://www.airbnb.co.in/rooms/XXXXXXXX"

  // Contact
  phone:   "+91 00000 00000",           // shown + used for tap-to-call
  email:   "hello@example.com",
  address: "Near Kanakkary Temple Junction, Kerala 686632",

  // Google Maps link (Share → copy link), or leave "" to auto-search the address
  mapUrl:  "",

  // Distances / travel times (shown in the Location section)
  distances: {
    road:   "2 min walk",
    bus:    "3 min walk",
    train:  "8 min drive",              // railway station
    temple: "1 min walk",               // Kanakkary Temple
  },

  // Optional price line under the booking buttons ("" hides it)
  price: "",                            // e.g. "From ₹2,500 / night"
};
/* ────────────────────────────────────────────────────────── */


(function () {
  "use strict";

  const html = document.documentElement;
  html.classList.remove("no-js");

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- Apply CONFIG to the page ---------- */
  function applyConfig() {
    const cleanPhone = CONFIG.phone.replace(/[^\d+]/g, "");
    const mapHref = CONFIG.mapUrl
      || "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(CONFIG.address);

    // Booking buttons
    $$("[data-book]").forEach((el) => {
      if (CONFIG.listingUrl) {
        el.setAttribute("href", CONFIG.listingUrl);
        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noopener");
      } else {
        el.setAttribute("href", "#book"); // fall back to the on-page booking section
      }
    });

    // Call buttons / phone
    $$("[data-call]").forEach((el) => el.setAttribute("href", "tel:" + cleanPhone));
    $$("[data-phone]").forEach((el) => (el.textContent = CONFIG.phone));

    // Email
    $$("[data-email]").forEach((el) => el.setAttribute("href", "mailto:" + CONFIG.email));
    $$("[data-email-text]").forEach((el) => (el.textContent = CONFIG.email));

    // Address
    $$("[data-address]").forEach((el) => (el.textContent = CONFIG.address));

    // Map
    $$("[data-map]").forEach((el) => el.setAttribute("href", mapHref));

    // Distances
    Object.entries(CONFIG.distances).forEach(([key, val]) => {
      const node = $(`[data-dist="${key}"]`);
      if (node && val) node.textContent = val;
    });

    // Price
    if (CONFIG.price) $$("[data-price]").forEach((el) => (el.textContent = CONFIG.price));

    // Year
    const yr = $("#year");
    if (yr) yr.textContent = new Date().getFullYear();
  }

  /* ---------- Star ratings (review cards) ---------- */
  function initStars() {
    const STAR =
      '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" stroke="none" aria-hidden="true"><path d="m12 2 3 6.5 7 .7-5.2 4.6 1.5 6.9L12 17.8 5.7 20.7l1.5-6.9L2 9.2l7-.7z"/></svg>';
    $$("[data-stars]").forEach((el) => {
      const n = parseInt(el.dataset.stars, 10) || 0;
      el.innerHTML = STAR.repeat(n);
    });
  }

  /* ---------- Sticky header state ---------- */
  function initHeader() {
    const header = $("#siteHeader");
    const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Mobile nav ---------- */
  function initNav() {
    const toggle = $("#navToggle");
    const list = $("#navList");
    if (!toggle || !list) return;

    const close = () => {
      list.classList.remove("is-open");
      document.body.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
    };
    const open = () => {
      list.classList.add("is-open");
      document.body.classList.add("nav-open");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close menu");
    };

    toggle.addEventListener("click", () => {
      list.classList.contains("is-open") ? close() : open();
    });
    list.addEventListener("click", (e) => {
      if (e.target.closest("a")) close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
  }

  /* ---------- Gallery filter ---------- */
  function initGalleryFilter() {
    const chips = $$(".chip");
    const items = $$(".g-item");
    if (!chips.length) return;

    const apply = (filter) => {
      items.forEach((item) => {
        const show = filter === "all" || item.dataset.cat === filter;
        item.classList.toggle("is-hidden", !show);
      });
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    };

    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        chips.forEach((c) => {
          c.classList.remove("is-active");
          c.setAttribute("aria-selected", "false");
        });
        chip.classList.add("is-active");
        chip.setAttribute("aria-selected", "true");
        apply(chip.dataset.filter);
      });
    });

    // Show the initially-active category (Living) on load
    const active = $(".chip.is-active") || chips[0];
    apply(active.dataset.filter);
  }

  /* ---------- Lightbox ---------- */
  function initLightbox() {
    const lb = $("#lightbox");
    const lbImg = $("#lbImg");
    const lbCap = $("#lbCaption");
    const figures = $$(".g-item");
    if (!lb || !figures.length) return;

    let index = 0;
    let lastFocused = null;

    const visibleFigures = () => figures.filter((f) => !f.classList.contains("is-hidden"));

    const render = () => {
      const list = visibleFigures();
      const fig = list[index];
      if (!fig) return;
      const img = $("img", fig);
      lbImg.setAttribute("src", img.getAttribute("src"));
      lbImg.setAttribute("alt", img.getAttribute("alt") || "");
      const cap = $("figcaption", fig);
      lbCap.textContent = cap ? cap.textContent : "";
    };

    const openAt = (fig) => {
      const list = visibleFigures();
      index = Math.max(0, list.indexOf(fig));
      lastFocused = document.activeElement;
      render();
      lb.classList.add("is-open");
      lb.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      $("#lbClose").focus();
    };
    const close = () => {
      lb.classList.remove("is-open");
      lb.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (lastFocused) lastFocused.focus();
    };
    const step = (dir) => {
      const list = visibleFigures();
      index = (index + dir + list.length) % list.length;
      render();
    };

    figures.forEach((fig) => {
      fig.setAttribute("tabindex", "0");
      fig.setAttribute("role", "button");
      fig.addEventListener("click", () => openAt(fig));
      fig.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openAt(fig);
        }
      });
    });

    $("#lbClose").addEventListener("click", close);
    $("#lbPrev").addEventListener("click", () => step(-1));
    $("#lbNext").addEventListener("click", () => step(1));
    lb.addEventListener("click", (e) => {
      if (e.target === lb || e.target.classList.contains("lightbox__stage")) close();
    });
    document.addEventListener("keydown", (e) => {
      if (!lb.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
    });
  }

  /* ---------- Animations (GSAP) ---------- */
  function initAnimations() {
    if (prefersReduced || typeof gsap === "undefined") return;
    html.classList.add("anim");

    if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
    const ease = "power3.out";

    // Hero intro timeline
    const heroItems = $$("[data-hero]");
    gsap.set(heroItems, { y: 28, opacity: 0 });
    gsap.timeline({ defaults: { ease, duration: 0.9 } })
      .to(heroItems, { y: 0, opacity: 1, stagger: 0.12, delay: 0.15 });

    // Hero parallax — exterior image drifts upward as you scroll past the hero
    if (window.ScrollTrigger) {
      gsap.fromTo(
        ".hero__img",
        { xPercent: -50, yPercent: -50 },
        {
          xPercent: -50,
          yPercent: -61,
          ease: "none",
          scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
        }
      );
    }

    // Section reveals
    $$("[data-reveal]").forEach((el) => {
      const targets = el.hasAttribute("data-stagger")
        ? Array.from(el.children)
        : [el];
      gsap.set(targets, { y: 34, opacity: 0 });
      gsap.to(targets, {
        y: 0,
        opacity: 1,
        duration: 0.85,
        ease,
        stagger: el.hasAttribute("data-stagger") ? 0.09 : 0,
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
      });
    });
  }

  /* ---------- Init ---------- */
  applyConfig();
  initStars();
  initHeader();
  initNav();
  initGalleryFilter();
  initLightbox();

  // Run animations after load so layout/images are settled
  if (document.readyState === "complete") initAnimations();
  else window.addEventListener("load", initAnimations);
})();
