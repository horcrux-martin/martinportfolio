/* ==========================================================
   Huwaidah Martina - Portfolio scripts (vanilla JS, no libraries)
   ========================================================== */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Header: shadow on scroll ---------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("nav-menu");
  if (toggle && menu) {
    var setMenu = function (open) {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      menu.classList.toggle("is-open", open);
    };
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setMenu(false);
    });
  }

  /* ---------- Portrait fallback (shows initials if the photo is missing) ---------- */
  document.querySelectorAll(".portrait img").forEach(function (img) {
    var hide = function () { img.style.display = "none"; };
    img.addEventListener("error", hide);
    if (img.complete && img.naturalWidth === 0) hide();
  });

  /* ---------- Count-up numbers in the hero chips (runs once) ---------- */
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length) {
    var run = function (el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
      var prefix = el.getAttribute("data-prefix") || "";
      var suffix = el.getAttribute("data-suffix") || "";
      var format = function (v) {
        return prefix + v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
      };
      if (prefersReduced) { el.textContent = format(target); return; }
      var duration = 1400;
      var start = null;
      var step = function (ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = format(target * eased);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { run(entry.target); io.unobserve(entry.target); }
        });
      }, { threshold: 0.6 });
      counters.forEach(function (el) { io.observe(el); });
    } else {
      counters.forEach(run);
    }
  }

  /* ---------- Projects: filter by industry ---------- */
  var filterButtons = document.querySelectorAll(".filter");
  var cases = document.querySelectorAll(".case");
  if (filterButtons.length && cases.length) {
    var applyFilter = function (value) {
      filterButtons.forEach(function (b) {
        b.setAttribute("aria-pressed", String(b.getAttribute("data-filter") === value));
      });
      cases.forEach(function (c) {
        var show = value === "all" || c.getAttribute("data-cat") === value;
        c.hidden = !show;
      });
    };
    filterButtons.forEach(function (b) {
      b.addEventListener("click", function () { applyFilter(b.getAttribute("data-filter")); });
    });
  }

  /* ---------- Contact: copy email ---------- */
  var copyBtn = document.querySelector("[data-copy]");
  if (copyBtn) {
    copyBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      var text = copyBtn.getAttribute("data-copy");
      var done = function () {
        var old = copyBtn.textContent;
        copyBtn.textContent = "Copied";
        setTimeout(function () { copyBtn.textContent = old; }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(function () {});
      }
    });
  }

  /* ---------- Contact form: builds a ready-to-send email (no backend needed) ---------- */
  var form = document.getElementById("contact-form");
  if (form) {
    var EMAIL = "huwaidahmr@gmail.com";
    var statusEl = document.getElementById("form-status");

    var buildMessage = function () {
      var name = form.elements["name"].value.trim();
      var org = form.elements["org"].value.trim();
      var msg = form.elements["message"].value.trim().replace(/[.\s]+$/, "");
      return "Hi Huwaidah, I'm " + name + " from " + org + ". I would like to " + msg + ".";
    };
    var buildSubject = function () {
      return "Hello from " + form.elements["name"].value.trim() + " (" + form.elements["org"].value.trim() + ")";
    };
    var valid = function () {
      if (form.checkValidity()) { statusEl.className = "form-status"; statusEl.textContent = ""; return true; }
      statusEl.className = "form-status is-error";
      statusEl.textContent = "Please fill in all three fields first.";
      form.reportValidity();
      return false;
    };

    // Default email app
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!valid()) return;
      window.location.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent(buildSubject()) + "&body=" + encodeURIComponent(buildMessage());
      statusEl.className = "form-status is-ok";
      statusEl.textContent = "Opening your email app. If nothing opens, use the Gmail button below.";
    });

    // Gmail in the browser (works even without a desktop email app)
    var gmailBtn = document.getElementById("send-gmail");
    if (gmailBtn) {
      gmailBtn.addEventListener("click", function () {
        if (!valid()) return;
        var url = "https://mail.google.com/mail/?view=cm&fs=1&to=" + encodeURIComponent(EMAIL) +
                  "&su=" + encodeURIComponent(buildSubject()) + "&body=" + encodeURIComponent(buildMessage());
        window.open(url, "_blank", "noopener");
      });
    }
  }
})();
