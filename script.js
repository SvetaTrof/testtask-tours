var bookingForm = document.querySelector("#booking-form");
var bookingModal = document.querySelector("#booking-modal");
var modalCloseButton = bookingModal ? bookingModal.querySelector('[data-modal-close="button"]') : null;
var modalBackdrop = bookingModal ? bookingModal.querySelector('[data-modal-close="backdrop"]') : null;
var page = document.querySelector(".page");
var bookingStorageKey = "booking-form-data";
var dateInput = document.getElementById("tour-date");
var dateWrap = document.getElementById("tour-date-wrap");
var dateTrigger = document.querySelector(".search-field__date-trigger");

function syncDateFilledClass() {
  if (!dateWrap || !dateInput) return;
  const hasValue = Boolean(dateInput.value);
  dateWrap.classList.toggle("search-field__date-wrap--filled", hasValue);
}

function setFieldError(fieldId, message) {
  var control = document.getElementById(fieldId);
  if (!control) return false;
  var fieldWrap = control.closest(".booking-form__field");
  var error = fieldWrap ? fieldWrap.querySelector(".search-field__error") : null;
  if (fieldWrap) fieldWrap.classList.toggle("search-field--invalid", Boolean(message));
  if (error) error.textContent = message || "";
  return Boolean(message);
}

function openModal() {
  if (!bookingModal || !page) return;
  bookingModal.classList.add("modal--open");
  bookingModal.setAttribute("aria-hidden", "false");
  page.classList.add("page--lock");
}

function closeModal() {
  if (!bookingModal || !page) return;
  bookingModal.classList.remove("modal--open");
  bookingModal.setAttribute("aria-hidden", "true");
  page.classList.remove("page--lock");
}

function getFormData() {
  if (!bookingForm) return {};
  var formData = new FormData(bookingForm);
  return {
    location: String(formData.get("location") || ""),
    tourDate: String(formData.get("tourDate") || ""),
    participants: String(formData.get("participants") || ""),
  };
}

function saveFormData() {
  try {
    localStorage.setItem(bookingStorageKey, JSON.stringify(getFormData()));
  } catch (error) {}
}



if (bookingForm) {
  try { localStorage.removeItem(bookingStorageKey); } catch (e) {}
  bookingForm.reset();
  syncDateFilledClass();

  bookingForm.addEventListener("input", saveFormData);
  bookingForm.addEventListener("change", saveFormData);

  bookingForm.addEventListener("input", function (e) {
    if (e.target.id === "location" || e.target.id === "tour-date" || e.target.id === "participants") {
      setFieldError(e.target.id, "");
    }
  });

  bookingForm.addEventListener("change", function (e) {
    if (e.target.id === "location" || e.target.id === "tour-date" || e.target.id === "participants") {
      setFieldError(e.target.id, "");
    }
  });

  bookingForm.addEventListener("submit", function (event) {
    event.preventDefault();

    var location = document.getElementById("location");
    var tourDate = document.getElementById("tour-date");
    var participants = document.getElementById("participants");
    var hasErrors = false;
    var today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!location || !location.value) {
      hasErrors = setFieldError("location", "Выберите локацию для тура") || hasErrors;
    } else {
      setFieldError("location", "");
    }

    if (!tourDate || !tourDate.value) {
      hasErrors = setFieldError("tour-date", "Укажите дату похода") || hasErrors;
    } else if (new Date(tourDate.value) < today) {
      hasErrors = setFieldError("tour-date", "Дата не может быть в прошлом") || hasErrors;
    } else {
      setFieldError("tour-date", "");
    }

    var peopleCount = participants ? Number(participants.value) : 0;
    if (!participants || !participants.value) {
      hasErrors = setFieldError("participants", "Укажите количество участников") || hasErrors;
    } else if (!Number.isInteger(peopleCount) || peopleCount < 4) {
      hasErrors = setFieldError("participants", "Минимум 4 участника") || hasErrors;
    } else {
      setFieldError("participants", "");
    }

    if (hasErrors) {
      return;
    }

    bookingForm.reset();
    syncDateFilledClass();
    localStorage.removeItem(bookingStorageKey);
    openModal();
  });
}

if (dateInput) {
  dateInput.addEventListener("input", syncDateFilledClass);
  dateInput.addEventListener("change", syncDateFilledClass);
}

if (dateTrigger && dateInput) {
  dateTrigger.addEventListener("click", function () {
    dateInput.focus();
    if (typeof dateInput.showPicker === "function") {
      dateInput.showPicker();
    }
  });
}

if (modalCloseButton) {
  modalCloseButton.addEventListener("click", closeModal);
}

if (modalBackdrop) {
  modalBackdrop.addEventListener("click", closeModal);
}

var galleryItems = Array.prototype.slice.call(document.querySelectorAll(".gallery__item"));
var galleryLightbox = document.getElementById("gallery-lightbox");
var galleryLightboxImage = galleryLightbox ? galleryLightbox.querySelector(".lightbox__image") : null;
var galleryLightboxBackdrop = galleryLightbox ? galleryLightbox.querySelector(".lightbox__backdrop") : null;
var galleryLightboxClose = galleryLightbox ? galleryLightbox.querySelector(".lightbox__close") : null;
var galleryLightboxPrev = galleryLightbox ? galleryLightbox.querySelector(".lightbox__arrow--prev") : null;
var galleryLightboxNext = galleryLightbox ? galleryLightbox.querySelector(".lightbox__arrow--next") : null;
var galleryLightboxIndex = 0;

function getGallerySrcs() {
  return galleryItems.map(function (item) {
    var img = item.querySelector(".gallery__img");
    return img && img.src ? img.src : "";
  }).filter(Boolean);
}

function showLightboxSlide(index) {
  if (!galleryLightboxImage) return;
  var srcs = getGallerySrcs();
  if (!srcs.length) return;
  var len = srcs.length;
  galleryLightboxIndex = ((index % len) + len) % len;
  galleryLightboxImage.src = srcs[galleryLightboxIndex];
  galleryLightboxImage.alt = "";
}

function openGalleryLightbox(index) {
  if (!galleryLightbox || !page) return;
  showLightboxSlide(index);
  galleryLightbox.classList.add("lightbox--open");
  galleryLightbox.setAttribute("aria-hidden", "false");
  page.classList.add("page--lock");
}

function closeGalleryLightbox() {
  if (!galleryLightbox || !page) return;
  galleryLightbox.classList.remove("lightbox--open");
  galleryLightbox.setAttribute("aria-hidden", "true");
  if (galleryLightboxImage) {
    galleryLightboxImage.removeAttribute("src");
  }
  page.classList.remove("page--lock");
}

function stepLightbox(delta) {
  showLightboxSlide(galleryLightboxIndex + delta);
}

galleryItems.forEach(function (item, index) {
  item.addEventListener("click", function () {
    openGalleryLightbox(index);
  });
});

if (galleryLightboxBackdrop) {
  galleryLightboxBackdrop.addEventListener("click", closeGalleryLightbox);
}

if (galleryLightboxClose) {
  galleryLightboxClose.addEventListener("click", closeGalleryLightbox);
}

if (galleryLightboxPrev) {
  galleryLightboxPrev.addEventListener("click", function (event) {
    event.stopPropagation();
    stepLightbox(-1);
  });
}

if (galleryLightboxNext) {
  galleryLightboxNext.addEventListener("click", function (event) {
    event.stopPropagation();
    stepLightbox(1);
  });
}

document.addEventListener("keydown", function (event) {
  if (galleryLightbox && galleryLightbox.classList.contains("lightbox--open")) {
    if (event.key === "Escape") {
      closeGalleryLightbox();
      event.preventDefault();
      return;
    }
    if (event.key === "ArrowLeft") {
      stepLightbox(-1);
      event.preventDefault();
      return;
    }
    if (event.key === "ArrowRight") {
      stepLightbox(1);
      event.preventDefault();
      return;
    }
    return;
  }
  if (event.key === "Escape" && bookingModal && bookingModal.classList.contains("modal--open")) {
    closeModal();
  }
});

var menuToggle = document.querySelector(".hero__menu-toggle");
var menu = document.querySelector(".menu");
var menuClose = menu ? menu.querySelector(".menu__close") : null;

if (menuToggle && menu) {
  function toggleMenu(isOpen) {
    if (isOpen) {
      menu.classList.add("menu--open");
      document.body.style.overflow = "hidden";
    } else {
      menu.classList.remove("menu--open");
      document.body.style.overflow = "";   
    }
  }

  menuToggle.addEventListener("click", function () {
    var isOpen = !menu.classList.contains("menu--open");
    toggleMenu(isOpen);
  });

  if (menuClose) {
    menuClose.addEventListener("click", function () {
      toggleMenu(false);
    });
  }

  menu.querySelectorAll(".menu__link").forEach(function(link) {
    link.addEventListener("click", function() {
      toggleMenu(false);
    });
  });
}

document.querySelectorAll(".button").forEach(function (button) {
  button.addEventListener("click", function () {
    button.classList.add("button--clicked");
    setTimeout(function () {
      button.classList.remove("button--clicked");
    }, 180);
  });
});
