/* ==========================================================================
   VANTERA MOTORS — tiny form-validation helper shared by the contact form
   and the test-ride form. Nothing is sent anywhere: on success we show a
   confirmation message only.
   ========================================================================== */

(function () {
  "use strict";

  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const rules = {
    required: function (label) {
      return function (v) { return v.trim() ? "" : label + " is required."; };
    },
    email: function (v) {
      if (!v.trim()) return "Email is required.";
      return EMAIL.test(v.trim()) ? "" : "Enter a valid email address, e.g. name@example.com.";
    },
    phone: function (v) {
      if (!v.trim()) return "Phone number is required.";
      const digits = v.replace(/\D/g, "");
      return /^[\d\s()+.-]+$/.test(v) && digits.length >= 7 && digits.length <= 15
        ? "" : "Enter a valid phone number (7–15 digits).";
    },
    minLength: function (label, min) {
      return function (v) {
        const t = v.trim();
        if (!t) return label + " is required.";
        return t.length >= min ? "" : label + " must be at least " + min + " characters (" + t.length + " so far).";
      };
    },
    futureDate: function (v) {
      if (!v) return "Choose a preferred date.";
      const picked = new Date(v + "T00:00:00");
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return picked >= today ? "" : "Pick today or a future date.";
    }
  };

  function fieldOf(input) { return input.closest(".field"); }

  function setError(input, message) {
    const field = fieldOf(input);
    const out = field && field.querySelector(".field-error");
    if (field) field.classList.toggle("has-error", !!message);
    if (out) out.textContent = message;
    if (message) input.setAttribute("aria-invalid", "true");
    else input.removeAttribute("aria-invalid");
  }

  function validateField(form, name, schema) {
    const input = form.elements[name];
    if (!input) return true;
    const message = schema[name](input.value, form) || "";
    setError(input, message);
    return !message;
  }

  // schema: { fieldName: function(value) -> errorMessage | "" }
  function attach(form, schema, onSuccess) {
    const names = Object.keys(schema);

    names.forEach(function (name) {
      const input = form.elements[name];
      if (!input) return;
      input.addEventListener("blur", function () { validateField(form, name, schema); });
      input.addEventListener("input", function () {
        if (fieldOf(input).classList.contains("has-error")) validateField(form, name, schema);
      });
      input.addEventListener("change", function () { validateField(form, name, schema); });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      let firstBad = null;
      names.forEach(function (name) {
        if (!validateField(form, name, schema) && !firstBad) firstBad = form.elements[name];
      });
      if (firstBad) { firstBad.focus(); return; }

      const data = {};
      names.forEach(function (name) { data[name] = form.elements[name].value.trim(); });
      onSuccess(data);
    });
  }

  // Swap the form for its success panel and move focus there for screen readers.
  function showSuccess(form, panel) {
    form.classList.add("is-sent");
    panel.classList.add("is-shown");
    panel.setAttribute("tabindex", "-1");
    panel.focus({ preventScroll: true });
    panel.scrollIntoView({ behavior: VanteraUI.reduceMotion ? "auto" : "smooth", block: "center" });
  }

  function reset(form, panel) {
    form.reset();
    form.querySelectorAll(".field").forEach(function (f) { f.classList.remove("has-error"); });
    form.querySelectorAll(".field-error").forEach(function (e) { e.textContent = ""; });
    form.classList.remove("is-sent");
    panel.classList.remove("is-shown");
    const first = form.querySelector("input, select, textarea");
    if (first) first.focus();
  }

  window.VanteraForms = { rules: rules, attach: attach, showSuccess: showSuccess, reset: reset };
})();
