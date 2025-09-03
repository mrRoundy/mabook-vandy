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
                targetSection.scrollIntoView({ behavior: 'smooth' });
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
        // This margin makes the link become active when a section is in the middle of the screen, not just at the very top or bottom.
        rootMargin: '-30% 0px -70% 0px' 
    });

    // Tell the observer to watch every section.
    sections.forEach(section => {
        observer.observe(section);
    });
});