// 아이콘, 메뉴, 예약창을 한 번에 시작한다.
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function drawIcons() {
    if (window.lucide) lucide.createIcons();
}

function showNotice(message) {
    const notice = document.createElement("div");
    notice.className = "fixed bottom-8 right-8 z-50 flex items-center gap-3 rounded-2xl border border-stone-700 bg-stone-900 px-6 py-4 text-white shadow-2xl";
    notice.innerHTML = '<i data-lucide="check-circle" class="h-5 w-5 text-emerald-400"></i><span></span>';
    notice.querySelector("span").textContent = message;
    document.body.appendChild(notice);
    drawIcons();
    setTimeout(() => {
        notice.style.opacity = "0";
        notice.style.transition = "opacity 0.4s ease";
        setTimeout(() => notice.remove(), 400);
    }, 3600);
}

function openBookingModal() {
    const bookingModal = document.getElementById("booking-modal");
    const modalCard = document.getElementById("modal-card");
    bookingModal.hidden = false;
    requestAnimationFrame(() => {
        bookingModal.classList.remove("pointer-events-none", "opacity-0");
        modalCard.classList.remove("scale-95");
        modalCard.classList.add("scale-100");
    });
    document.getElementById("guest-name").focus();
}

function closeBookingModal() {
    const bookingModal = document.getElementById("booking-modal");
    const modalCard = document.getElementById("modal-card");
    bookingModal.classList.add("pointer-events-none", "opacity-0");
    modalCard.classList.add("scale-95");
    modalCard.classList.remove("scale-100");
    setTimeout(() => {
        bookingModal.hidden = true;
    }, 300);
}

function preparePage() {
    drawIcons();

    document.querySelectorAll("[data-open-booking]").forEach((button) => {
        button.addEventListener("click", openBookingModal);
    });
    document.getElementById("close-booking").addEventListener("click", closeBookingModal);
    document.getElementById("booking-modal").addEventListener("click", (event) => {
        if (event.target.id === "booking-modal") closeBookingModal();
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeBookingModal();
    });

    document.getElementById("booking-form").addEventListener("submit", (event) => {
        event.preventDefault();
        closeBookingModal();
        event.currentTarget.reset();
        showNotice("체험 예약 신청을 받았습니다. 확인 후 연락드리겠습니다.");
    });

    document.getElementById("newsletter-form").addEventListener("submit", (event) => {
        event.preventDefault();
        event.currentTarget.reset();
        showNotice("소식 구독 신청을 받았습니다.");
    });

    const mobileMenuButton = document.getElementById("mobile-menu-btn");
    const mobileMenu = document.getElementById("mobile-menu");
    mobileMenuButton.addEventListener("click", () => {
        const isOpen = mobileMenu.classList.toggle("hidden") === false;
        mobileMenuButton.setAttribute("aria-expanded", String(isOpen));
    });
    mobileMenu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            mobileMenu.classList.add("hidden");
            mobileMenuButton.setAttribute("aria-expanded", "false");
        });
    });

    const siteHeader = document.getElementById("main-header");
    window.addEventListener("scroll", () => {
        siteHeader.classList.toggle("shadow-md", window.scrollY > 8);
    }, { passive: true });

    playScrollReveal();
}

function playScrollReveal() {
    if (prefersReducedMotion || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray(".reveal").forEach((element) => {
        gsap.from(element, {
            y: 28,
            opacity: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: { trigger: element, start: "top 88%" }
        });
    });
}

window.addEventListener("DOMContentLoaded", preparePage);
