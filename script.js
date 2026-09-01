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

  const form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const name = data.get("name") || "";
      const email = data.get("email") || "";
      const message = data.get("message") || "";
      const subject = encodeURIComponent(`Portfolio opportunity for Taniya Vishwakarma`);
      const body = encodeURIComponent(
        `Hi Taniya,\n\nName: ${name}\nEmail: ${email}\n\n${message}`
      );
      window.location.href =
        `mailto:taniyavishwakarma8844@mail.com?subject=${subject}&body=${body}`;
    });
  }
});
