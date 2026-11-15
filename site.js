// Fill these in once Lemon Squeezy is set up; empty values show "Coming soon".
const SITE = {
  checkout: {
    opensource: "",
    commerce: "",
    agency: "",
  },
  contactEmail: "",
};

document.querySelectorAll("[data-checkout]").forEach((el) => {
  const url = SITE.checkout[el.dataset.checkout];
  if (url) {
    el.href = url;
  } else {
    el.textContent = "Coming soon";
    el.setAttribute("aria-disabled", "true");
    el.removeAttribute("href");
  }
});

document.querySelectorAll("[data-contact]").forEach((el) => {
  if (SITE.contactEmail) {
    el.href = "mailto:" + SITE.contactEmail;
    if (!el.textContent.trim()) el.textContent = SITE.contactEmail;
  } else {
    el.remove();
  }
});

const year = document.getElementById("year");
if (year) year.textContent = String(new Date().getFullYear());
