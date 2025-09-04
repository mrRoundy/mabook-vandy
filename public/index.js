document.addEventListener('DOMContentLoaded', () => {
    // Force the body to hide overflow for the animation on the landing page
    document.body.style.overflow = 'hidden';

    // Timer to enable the "Try Now" button
    setTimeout(() => {
        const tryNowLink = document.querySelector('.cta-button-inactive');
        if (tryNowLink) {
            tryNowLink.classList.remove('cta-button-inactive');
        }
    }, 3000);

    // Timer to re-enable scrolling after the animation
    setTimeout(() => {
        document.body.style.overflow = 'auto';
        const header = document.querySelector('.site-header');
        if (header) {
            header.style.pointerEvents = 'auto';
        }
    }, 3000);

    // --- Component Loading Logic ---
    loadComponent('navbar.html', 'navbar-container', initializeNavbar);
    loadComponent('hero.html', 'hero-container');
    loadComponent('library.html', 'library-container');
    loadComponent('footer.html', 'footer-container', () => {
        const yearSpan = document.getElementById('footer-year');
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
        }
    });
});

function loadComponent(url, elementId, callback) {
    fetch(url)
        .then(response => response.text())
        .then(data => {
            document.getElementById(elementId).innerHTML = data;
            if (callback) callback();
        })
        .catch(error => console.error('Error loading component:', error));
}

function initializeNavbar() {
    const navLinks = document.querySelectorAll('.nav-links a');
    const capsule = document.querySelector('.nav-links .nav-capsule');
    let isClickScrolling = false;
    let scrollTimeout;

    function moveCapsule(target) {
        if (!target) return;
        capsule.style.width = `${target.offsetWidth}px`;
        capsule.style.left = `${target.offsetLeft}px`;
        navLinks.forEach(link => link.classList.remove('active'));
        target.classList.add('active');
    }

    setTimeout(() => {
        const initialActiveLink = document.querySelector('.nav-links a.active') || navLinks[0];
        moveCapsule(initialActiveLink);
    }, 100);

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            moveCapsule(e.target);
            isClickScrolling = true;
            const targetSection = document.querySelector(e.target.getAttribute('href'));
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => { isClickScrolling = false; }, 1000);
        });
    });

    window.addEventListener('scroll', () => {
        if (isClickScrolling) return;
        const sections = Array.from(navLinks).map(link => {
            const href = link.getAttribute('href');
            return href.startsWith('#') ? document.querySelector(href) : null;
        }).filter(Boolean);

        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= sectionTop - (window.innerHeight / 3)) {
                currentSectionId = section.getAttribute('id');
            }
        });

        const activeLink = document.querySelector(`.nav-links a[href="#${currentSectionId}"]`);
        if (activeLink && !activeLink.classList.contains('active')) {
            moveCapsule(activeLink);
        }
    });
}