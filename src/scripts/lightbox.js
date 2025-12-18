/**
 * Initializes the Lightbox functionality.
 * @param {string} selector - CSS selector to find triggers (elements that open the lightbox).
 *                            Should ideally be the <img> itself or have an <img> inside, 
 *                            or have 'href' if it's a link.
 */
export function initLightbox(selector) {
    const items = document.querySelectorAll(selector);
    if (items.length === 0) return;

    // Build images array
    // We try to find the actual image URL.
    // 1. If element has 'href', use that (link).
    // 2. If element is <img>, use 'src'.
    // 3. If element contains <img>, use that 'src'.
    const images = Array.from(items).map(item => {
        if (item.hasAttribute('href')) return item.getAttribute('href');
        if (item.tagName === 'IMG') return item.src;
        const img = item.querySelector('img');
        if (img) return img.src;
        return '';
    }).filter(src => src !== '');

    if (images.length === 0) return;

    let currentIndex = 0;

    // UI Elements
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const closeBtn = document.querySelector('button[aria-label="Close"]');
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");
    const backdrop = document.querySelector("#lightbox > div:first-child");

    if (!lightbox || !lightboxImg) return;

    function openLightbox(index) {
        currentIndex = parseInt(index);
        updateLightboxImage();

        lightbox.classList.remove("invisible", "opacity-0");
        // Tiny timeout to trigger CSS transition for scale
        setTimeout(() => {
            lightboxImg.classList.remove("scale-95");
            lightboxImg.classList.add("scale-100");
        }, 10);
        document.body.classList.add("lightbox-open");
    }

    function closeLightbox() {
        lightbox.classList.add("opacity-0");
        lightboxImg.classList.remove("scale-100");
        lightboxImg.classList.add("scale-95");

        setTimeout(() => {
            lightbox.classList.add("invisible");
            document.body.classList.remove("lightbox-open");
        }, 300);
    }

    function changeImage(direction) {
        currentIndex = (currentIndex + direction + images.length) % images.length;
        updateLightboxImage();
    }

    function updateLightboxImage() {
        lightboxImg.src = images[currentIndex];
    }

    function handleKeydown(e) {
        if (!lightbox.classList.contains("invisible")) {
            if (e.key === "Escape") closeLightbox();
            if (e.key === "ArrowLeft") changeImage(-1);
            if (e.key === "ArrowRight") changeImage(1);
        }
    }

    // Attach Click Listeners to items
    items.forEach((item, idx) => {
        // Prevent default if it's a link
        if (item.tagName === 'A') {
            item.addEventListener('click', (e) => e.preventDefault());
        }

        item.style.cursor = 'zoom-in';
        item.addEventListener('click', (e) => {
            // If the item itself acts as the trigger which we clicked
            openLightbox(idx);
        });
    });

    // Attach Control Listeners (only once per page load ideally, but robust enough here)
    // To avoid accumulating listeners if init is called multiple times (e.g. Astro View Transitions),
    // we should ideally clean up. But standard Astro page-load usage is generally safe if we don't double-init.

    // Check if listener is already attached? 
    // We'll just clone/replace logic or trust the DOM reset if elements are re-rendered.
    // If elements are static (Layout), listeners persist.
    // If we re-run initLightbox, we add more listeners to the Layout buttons.
    // SOLUTION: We should check if we already added listeners to the buttons.
    // OR we assume/ensure initLightbox is called once or the buttons are re-cloned.

    // For now, let's use a simple flag on the lightbox element
    if (lightbox.dataset.initialized === "true") {
        // We still need to update the 'images' and 'items' scope for the closure?
        // Yes, handleKeydown and changeImage close over 'images'.
        // So we strictly need to replace the logic.

        // This is complex with View Transitions and Persistent Layouts.
        // If Lightbox is in Layout (persistent), it stays in DOM.
        // If we navigation, initLightbox is called again.
        // We get a NEW set of images.
        // We need to update the behavior of the buttons to use the NEW 'images'.

        // Use a mutable state object if possible or just clear handlers.
        // Simplest hack: Remove and re-add listeners?
        // Let's rely on the fact that we can just assign onclick properties which overrides old ones.
        // But for addEventListener it adds up.

        // Let's use onclick for the singleton buttons to prevent stacking.
    }

    // Assign via onclick to prevent stacking on persistent elements
    if (closeBtn) closeBtn.onclick = closeLightbox;
    if (backdrop) backdrop.onclick = closeLightbox;

    if (prevBtn) {
        prevBtn.onclick = (e) => {
            e.stopPropagation();
            changeImage(-1);
        };
    }

    if (nextBtn) {
        nextBtn.onclick = (e) => {
            e.stopPropagation();
            changeImage(1);
        };
    }

    // Keydown is global.
    document.removeEventListener("keydown", window.lightboxKeydownHandler);
    window.lightboxKeydownHandler = handleKeydown;
    document.addEventListener("keydown", window.lightboxKeydownHandler);

    lightbox.dataset.initialized = "true";
}
