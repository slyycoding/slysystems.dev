const menuToggle = document.getElementById("menuToggle");
const mobileNav = document.getElementById("mobileNav");
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

if (menuToggle && mobileNav) {
  menuToggle.addEventListener("click", () => {
    mobileNav.classList.toggle("active");
  });

  mobileNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileNav.classList.remove("active");
    });
  });
}

if (contactForm) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;

    submitButton.disabled = true;
    submitButton.textContent = "Sending...";
    formStatus.textContent = "";

    try {
      const response = await fetch(contactForm.action, {
        method: "POST",
        body: new FormData(contactForm),
        headers: {
          Accept: "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Failed to send form");
      }

      contactForm.reset();
      formStatus.textContent = "Message sent successfully.";
    } catch (error) {
      formStatus.textContent = "Message failed to send. Please try again.";
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  });
}





