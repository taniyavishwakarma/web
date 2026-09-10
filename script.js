document.addEventListener("DOMContentLoaded", () => {
  const menu = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav-links");
  const year = document.getElementById("year");

  if (year) year.textContent = new Date().getFullYear();

  if (menu && nav) {
    menu.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      menu.setAttribute("aria-expanded", String(open));
    });

    nav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        menu.setAttribute("aria-expanded", "false");
      });
    });
  }

  /*
   * FormSubmit requires the portfolio to be served over HTTP/HTTPS.
   * When someone opens index.html directly with file://, use a mailto
   * fallback instead of sending them to FormSubmit's "Unable to submit"
   * page. Once hosted on GitHub Pages/Netlify/etc., the normal form POST
   * is used and the visitor stays out of the mail client.
   */
  const form = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const submitButton = form.querySelector('button[type="submit"]');
      const originalText = submitButton ? submitButton.innerHTML : "Send message →";

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = "Sending…";
      }

      if (formStatus) {
        formStatus.className = "form-status";
        formStatus.textContent = "Sending your message…";
      }

      const formData = new FormData(form);

      try {
        /*
         * FormSubmit's AJAX endpoint works cross-origin and returns JSON,
         * so the visitor stays on taniyav.in instead of being redirected.
         */
        const response = await fetch(
          "https://formsubmit.co/ajax/taniyavishwakarma8844@mail.com",
          {
            method: "POST",
            headers: {
              "Accept": "application/json"
            },
            body: formData
          }
        );

        const result = await response.json().catch(() => ({}));

        if (!response.ok || result.success === false) {
          throw new Error(result.message || "Unable to send the message.");
        }

        form.reset();

        if (formStatus) {
          formStatus.className = "form-status success";
          formStatus.textContent =
            "✓ Message sent successfully. Thank you — I’ll get back to you by email.";
        }
      } catch (error) {
        if (formStatus) {
          formStatus.className = "form-status error";
          formStatus.textContent =
            "We couldn't send the message right now. Please try again or use the LinkedIn link.";
        }
        console.error("Portfolio contact form error:", error);
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.innerHTML = originalText;
        }
      }
    });
  }
});
