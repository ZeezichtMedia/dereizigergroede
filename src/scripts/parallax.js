/**
 * Simple Parallax Script
 * Applies a subtle scroll-based transform to elements with class 'parallax-img'.
 */

export function initParallax() {
    const images = document.querySelectorAll('.parallax-img');
    if (!images.length) return;

    function update() {
        const scrollY = window.scrollY;

        images.forEach(img => {
            const speed = img.getAttribute('data-speed') || 0.05;
            // Only animate if in view could be optimized here, but for hero images it's fine.
            const yPos = -(scrollY * speed);
            img.style.transform = `translateY(${yPos}px)`;
        });

        requestAnimationFrame(update);
    }

    // Start loop
    requestAnimationFrame(update);
}
