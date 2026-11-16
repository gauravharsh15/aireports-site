// Checkout links (Lemon Squeezy) and the public support address; empty values hide the button or link.
const SITE = {
  checkout: {
    opensource: "https://gauravsextensions.lemonsqueezy.com/checkout/buy/0b0accc2-dc47-45f5-9547-edfbd9852154",
    commerce: "https://gauravsextensions.lemonsqueezy.com/checkout/buy/57a766d0-3aa3-4081-8904-89c7f23c67aa",
    agency: "https://gauravsextensions.lemonsqueezy.com/checkout/buy/7e053eb3-623c-4773-9cc4-d9c857ab702b",
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
