/* Contact page: validation + confirmation (nothing is sent anywhere) */
(function () {
  "use strict";

  const form = document.getElementById("contact-form");
  const success = document.getElementById("contact-success");
  const R = VanteraForms.rules;

  VanteraForms.attach(form, {
    name: R.minLength("Full name", 2),
    email: R.email,
    phone: R.phone,
    subject: R.minLength("Subject", 3),
    message: R.minLength("Message", 20)
  }, function () {
    VanteraForms.showSuccess(form, success);
  });

  document.getElementById("contact-again").addEventListener("click", function () {
    VanteraForms.reset(form, success);
  });
})();
