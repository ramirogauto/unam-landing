(function () {
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".site-nav");
  var label = document.querySelector(".nav-toggle-label");
  var links = Array.prototype.slice.call(document.querySelectorAll(".site-nav a"));
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var lastFocus = null;

  function focusables() {
    if (!nav || !toggle) return [];
    return [toggle].concat(
      Array.prototype.slice.call(
        nav.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
      )
    );
  }

  function setMenu(open) {
    if (!toggle || !nav) return;
    var isOpen = Boolean(open);
    nav.classList.toggle("is-open", isOpen);
    document.body.classList.toggle("nav-open", isOpen);
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    if (label) label.textContent = isOpen ? "Cerrar" : "Menú";

    if (isOpen) {
      lastFocus = document.activeElement;
      var firstLink = nav.querySelector("a");
      if (firstLink) firstLink.focus();
    } else if (lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus();
      lastFocus = null;
    }
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setMenu(!nav.classList.contains("is-open"));
    });

    links.forEach(function (link) {
      link.addEventListener("click", function () {
        setMenu(false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (!nav.classList.contains("is-open")) return;

      if (event.key === "Escape") {
        setMenu(false);
        return;
      }

      if (event.key !== "Tab") return;

      var items = focusables();
      if (!items.length) return;
      var first = items[0];
      var last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth >= 960) setMenu(false);
    });
  }

  function setActive(id) {
    links.forEach(function (link) {
      var match = link.getAttribute("href") === "#" + id;
      link.classList.toggle("is-active", match);
      if (match) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  }

  links.forEach(function (link) {
    link.addEventListener("click", function () {
      var id = (link.getAttribute("href") || "").slice(1);
      if (id) setActive(id);
    });
  });

  if ("IntersectionObserver" in window) {
    var observed = document.querySelectorAll("[data-nav], section[id]");
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = entry.target.getAttribute("data-nav") || entry.target.id;
          if (id) setActive(id);
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    observed.forEach(function (section) {
      spy.observe(section);
    });
  }

  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-stuck", window.scrollY > 8);
  }

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  var reveals = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) {
      el.classList.add("is-in");
    });
    return;
  }

  var revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -32px 0px" }
  );

  reveals.forEach(function (el) {
    revealObserver.observe(el);
  });
})();
