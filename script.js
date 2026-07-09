const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const navLinks = [...document.querySelectorAll(".site-nav a")];
const revealItems = [...document.querySelectorAll(".reveal")];
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const syncHeader = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 18);
};

const closeNav = () => {
  document.body.classList.remove("nav-open");
  navToggle.setAttribute("aria-expanded", "false");
};

navToggle.addEventListener("click", () => {
  const isOpen = document.body.classList.toggle("nav-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

nav.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    closeNav();
  }
});

window.addEventListener("scroll", syncHeader, { passive: true });
syncHeader();

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

revealItems.forEach((item) => revealObserver.observe(item));

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      navLinks.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  },
  { rootMargin: "-35% 0px -55% 0px" }
);

sections.forEach((section) => navObserver.observe(section));

const lightbox = document.createElement("div");
lightbox.className = "image-lightbox";
lightbox.setAttribute("aria-hidden", "true");
lightbox.innerHTML = `
  <button class="lightbox-close" type="button" aria-label="Close enlarged image">Close</button>
  <img class="lightbox-image" alt="">
`;
document.body.append(lightbox);

const lightboxImage = lightbox.querySelector(".lightbox-image");
const lightboxClose = lightbox.querySelector(".lightbox-close");

const openLightbox = (image) => {
  lightboxImage.src = image.dataset.full || image.currentSrc || image.src;
  lightboxImage.alt = image.alt || "Enlarged image";
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("lightbox-open");
  lightboxClose.focus();
};

const closeLightbox = () => {
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("lightbox-open");
  lightboxImage.removeAttribute("src");
};

document.querySelectorAll("img").forEach((image) => {
  image.classList.add("zoomable-image");
  image.setAttribute("tabindex", "0");
  image.addEventListener("click", () => openLightbox(image));
  image.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openLightbox(image);
    }
  });
});

lightboxClose.addEventListener("click", closeLightbox);

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && lightbox.classList.contains("is-open")) {
    closeLightbox();
  }
});

const contactForm = document.querySelector("[data-contact-form]");
const formStatus = document.querySelector("[data-form-status]");

if (contactForm && formStatus) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = contactForm.querySelector("button[type='submit']");
    const formData = new FormData(contactForm);
    const payload = Object.fromEntries(formData.entries());

    formStatus.textContent = "Sending...";
    formStatus.classList.remove("is-success", "is-error");
    submitButton.disabled = true;

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Message could not be sent.");
      }

      contactForm.reset();
      formStatus.textContent = "Thanks. Your message was sent.";
      formStatus.classList.add("is-success");
    } catch (error) {
      formStatus.textContent = "Sorry, the message could not be sent right now.";
      formStatus.classList.add("is-error");
    } finally {
      submitButton.disabled = false;
    }
  });
}
