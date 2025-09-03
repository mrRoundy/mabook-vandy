document.addEventListener('DOMContentLoaded', () => {
    // --- SCROLL FIX ---
    // The main CSS hides the scrollbar initially for animations. This brings it back.
    setTimeout(() => {
        document.body.style.overflow = 'auto';
    }, 500);

    const sections = document.querySelectorAll('.policy-content section');
    const navLinks = document.querySelectorAll('.policy-sidebar .nav-link');

    if (navLinks.length > 0 && sections.length > 0) {
        // --- SMOOTH SCROLL & BROWSER HISTORY FIX ---
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
        });

        // --- SCROLLSPY TO HIGHLIGHT ACTIVE LINK ---
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const activeId = entry.target.id;
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href').substring(1) === activeId) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, { 
            rootMargin: '-45% 0px -45% 0px' 
        });

        sections.forEach(section => {
            observer.observe(section);
        });
    }

    // --- RANDOMIZED CONTACT US LINK ---
    const contactLink = document.querySelector('.contact-link');
    if (contactLink) {
        let subjects = []; // Empty array to hold the subjects
        const currentPage = window.location.pathname;

        // Check which page is currently open and set the relevant subjects
        if (currentPage.includes('privacy.html')) {
            subjects = [
                "Question About My Data",
                "Inquiry About Information Collection",
                "Concerns Regarding the Privacy Policy",
                "How is My Prompt Used?",
                "Feedback on Data Handling"
            ];
        } else if (currentPage.includes('terms.html')) {
            subjects = [
                "Question Regarding the Terms of Service",
                "Clarification on Service Usage",
                "Inquiry About Prohibited Use",
                "Feedback on the Terms",
                "General Question about Service Rules"
            ];
        } else {
            // Fallback for any other pages
            subjects = ["General Inquiry about MaBook"];
        }

        contactLink.addEventListener('click', function(e) {
            e.preventDefault(); // Stop the link from navigating to "#"

            // 1. Pick a random subject from the correct list
            const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
            
            // 2. Encode the subject for the URL
            const encodedSubject = encodeURIComponent(randomSubject);

            // 3. Build the final Gmail link
            const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=mabook.official@gmail.com&su=${encodedSubject}`;
            
            // 4. Open the link in a new tab
            window.open(gmailLink, '_blank');
        });
    }
});