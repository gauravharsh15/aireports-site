// Checkout links (Polar) and the public support address; empty values hide the button or link.
const SITE = {
  checkout: {
    opensource: "",
    commerce: "",
    agency: "",
  },
  contactEmail: "gaurav.extensions.support@gmail.com",
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
