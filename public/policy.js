document.addEventListener('DOMContentLoaded', () => {
    // --- SCROLL FIX ---
    // The main CSS hides the scrollbar initially for animations. This brings it back.
    setTimeout(() => {
        document.body.style.overflow = 'auto';
    }, 500);

    const sections = document.querySelectorAll('.policy-content section');
    const navLinks = document.querySelectorAll('.policy-sidebar .nav-link');

    if (navLinks.length === 0 || sections.length === 0) {
        // Do nothing if the required elements aren't on the page.
        return;
    }

    // --- SMOOTH SCROLL & BROWSER HISTORY FIX ---
    // This makes the page scroll smoothly when a link is clicked, without adding to the browser's back-button history.
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // 1. Prevent the default link behavior (stops the URL from changing instantly).
            e.preventDefault();

            // 2. Find the target section using the link's href.
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            // 3. Scroll to the section smoothly.
            if (targetSection) {
                // By adding "block: 'center'", the section will be scrolled to the middle of the screen.
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    });

    // --- SCROLLSPY TO HIGHLIGHT ACTIVE LINK ---
    // This watches which section is visible on the screen and applies an 'active' class to the corresponding sidebar link.
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const activeId = entry.target.id;
                
                navLinks.forEach(link => {
                    // Remove 'active' class from all links.
                    link.classList.remove('active');

                    // Add 'active' class to the link that matches the visible section.
                    // The substring(1) removes the '#' from the href attribute.
                    if (link.getAttribute('href').substring(1) === activeId) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, { 
        // ===== START: THIS IS THE UPDATED LINE =====
        // This new rootMargin creates a horizontal detection zone in the middle of the screen.
        rootMargin: '-45% 0px -45% 0px' 
        // ===== END: THIS IS THE UPDATED LINE =====
    });

    // Tell the observer to watch every section.
    sections.forEach(section => {
        observer.observe(section);
    });
});