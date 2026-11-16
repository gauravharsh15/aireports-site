// Checkout links (Polar) and the public support address; empty values hide the button or link.
const SITE = {
  checkout: {
    opensource: "https://buy.polar.sh/polar_cl_fAu6FjwBrKgDKofeiYST9FgZBWVVcHNnGiNK30Fj1Ey",
    commerce: "https://buy.polar.sh/polar_cl_sOH7dJsUjB96p6Kwa4ffeCfjXI7Y2Jzy2dLTY2cTKK3",
    agency: "https://buy.polar.sh/polar_cl_AoxDXaMSFRh8NBrCqycuHtQYougrxFphgaHL44ExxED",
  },
  contactEmail: "gaurav@gauravextensions.com",
};

// Launch offer: 50% off the first year until 31 Dec 2026, 11:59 PM India time.
// The discount lives in Polar (code LAUNCH50, first payment only, same end date). The Buy links
// carry the code until the deadline; after it, the page drops the offer by itself.
const OFFER_ENDS = Date.parse("2026-12-31T23:59:59+05:30");
const OFFER_CODE = "LAUNCH50";
const offerOn = Date.now() < OFFER_ENDS;
if (offerOn) {
  document.querySelectorAll("[data-offer]").forEach((el) => (el.hidden = false));
  document.querySelectorAll("[data-no-offer]").forEach((el) => (el.hidden = true));
}

document.querySelectorAll("[data-checkout]").forEach((el) => {
  const url = SITE.checkout[el.dataset.checkout];
  if (url) {
    // Light checkout to match the site; while the offer runs, the code comes pre-applied.
    const params = new URLSearchParams({ theme: "light" });
    if (offerOn) params.set("discount_code", OFFER_CODE);
    el.href = url + (url.includes("?") ? "&" : "?") + params.toString();
  } else {
    el.textContent = "Coming soon";
    el.setAttribute("aria-disabled", "true");
    el.removeAttribute("href");
  }
});

document.querySelectorAll("[data-contact]").forEach((el) => {
  if (SITE.contactEmail) {
    // data-subject / data-body pre-fill the e-mail (body uses %0A for new lines).
    const parts = [];
    if (el.dataset.subject) parts.push("subject=" + encodeURIComponent(el.dataset.subject));
    if (el.dataset.body) parts.push("body=" + el.dataset.body.split("%0A").map(encodeURIComponent).join("%0A"));
    // data-to sends to another address on the domain (the founder's own inbox).
    el.href = "mailto:" + (el.dataset.to || SITE.contactEmail) + (parts.length ? "?" + parts.join("&") : "");
    if (!el.textContent.trim()) el.textContent = SITE.contactEmail;
  } else {
    el.remove();
  }
});

const year = document.getElementById("year");
if (year) year.textContent = String(new Date().getFullYear());

// After checkout Polar sends buyers here with ?customer_session_token=...: thank them and link
// straight to their account (where the licence key is), then drop the token from the address bar.
(() => {
  let token = null;
  try {
    token = new URLSearchParams(location.search).get("customer_session_token");
  } catch {
    return;
  }
  if (!token) return;
  const portal = "https://polar.sh/gaurav-extensions/portal?customer_session_token=" + encodeURIComponent(token);
  document.querySelectorAll("[data-portal]").forEach((el) => (el.href = portal));
  document.querySelectorAll("[data-thanks]").forEach((el) => (el.hidden = false));
  try {
    history.replaceState(null, "", location.pathname + location.hash);
  } catch {
    // keep the URL as it is
  }
})();

// ---- motion -----------------------------------------------------------------
// Everything below is decoration: the page reads fine without it, and anyone
// who asks their system for reduced motion gets the still version.
const reduceMotion = (() => {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
})();

// Header gets a hairline once the page scrolls.
(() => {
  const head = document.querySelector(".site-head");
  if (!head) return;
  const onScroll = () => head.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
})();

// Sections fade up as they come into view.
(() => {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;
  if (reduceMotion || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  items.forEach((el) => io.observe(el));
})();

// Numbers count up once when they appear.
(() => {
  const nums = document.querySelectorAll("[data-count]");
  if (!nums.length || reduceMotion || !("IntersectionObserver" in window)) return;
  const show = (el, v) => {
    const d = Number(el.dataset.decimals || 0);
    el.textContent = (el.dataset.prefix || "") + v.toFixed(d) + (el.dataset.suffix || "");
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const el = e.target, to = Number(el.dataset.count), start = performance.now(), ms = 1400;
      const tick = (now) => {
        const t = Math.min(1, (now - start) / ms);
        show(el, to * (1 - Math.pow(1 - t, 3)));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.4 });
  nums.forEach((el) => { show(el, 0); io.observe(el); });
})();

// Hero window: types a question, "thinks", shows the answer; cycles through the examples.
(() => {
  const root = document.querySelector("[data-demo]");
  if (!root || reduceMotion) return;
  const examples = [...root.querySelectorAll("template[data-ex]")];
  const q = root.querySelector("[data-demo-q]");
  const out = root.querySelector("[data-demo-out]");
  const wait = root.querySelector("[data-demo-wait]");
  const step = root.querySelector("[data-demo-step]");
  const ask = root.querySelector("[data-demo-ask]");
  if (examples.length < 2 || !q || !out || !wait || !step || !ask) return;
  // Reserve room for the tallest example, so the page below never jumps while it plays.
  const stage = root.querySelector(".m-stage");
  const fit = () => {
    if (!stage) return;
    const current = [...out.childNodes];
    let tallest = 0;
    out.style.visibility = "hidden";
    for (const t of examples) {
      out.replaceChildren(t.content.cloneNode(true));
      tallest = Math.max(tallest, out.offsetHeight);
    }
    out.replaceChildren(...current);
    out.style.visibility = "";
    stage.style.minHeight = tallest + "px";
  };
  fit();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  let resizeTimer;
  window.addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(fit, 200); });
  const modes = root.querySelectorAll("[data-demo-mode]");
  const presets = root.querySelectorAll("[data-demo-preset]");
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  let onScreen = true;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; }).observe(root);
  }
  const ready = async () => { while (!onScreen || document.hidden) await sleep(500); };
  const pick = (list, attr, value) => list.forEach((el) => el.classList.toggle("on", el.getAttribute(attr) === value));

  (async () => {
    let i = 0;
    await sleep(5000); // the first answer is already on screen: give people time to read it
    for (;;) {
      i = (i + 1) % examples.length;
      const ex = examples[i].dataset;
      await ready();
      out.classList.add("is-hidden");
      await sleep(450);
      out.replaceChildren();
      q.textContent = "";
      pick(modes, "data-demo-mode", ex.mode);
      pick(presets, "data-demo-preset", ex.preset);
      for (const ch of ex.q) {
        q.textContent += ch;
        await sleep(26 + Math.random() * 38);
      }
      await sleep(380);
      ask.classList.add("is-press");
      await sleep(170);
      ask.classList.remove("is-press");
      wait.hidden = false;
      for (const s of ex.steps.split("|")) {
        step.textContent = s;
        await sleep(780);
      }
      wait.hidden = true;
      out.replaceChildren(examples[i].content.cloneNode(true));
      void out.offsetWidth;
      out.classList.remove("is-hidden");
      await sleep(6500);
    }
  })();
})();
