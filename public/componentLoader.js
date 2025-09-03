function loadComponent(url, elementId, callback) {
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok for ' + url);
            }
            return response.text();
        })
        .then(data => {
            const element = document.getElementById(elementId);
            if (element) {
                element.innerHTML = data;
            } else {
                console.error('Element with ID "' + elementId + '" not found.');
                return;
            }
            if (callback) {
                callback();
            }
        })
        .catch(error => console.error('Error loading component:', error));
}


document.addEventListener('DOMContentLoaded', () => {
    // Load Navbar
    loadComponent('navbar.html', 'navbar-container');

    // Load Footer and set the year
    loadComponent('footer.html', 'footer-container', () => {
        const yearSpan = document.getElementById('footer-year');
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
        }
    });
});