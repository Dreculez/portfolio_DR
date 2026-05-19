// 1. GESTION DES PARCHEMINS (PROJETS)
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', function () {
        this.classList.toggle('is-open');

        const chevron = this.querySelector('.icon-chevron');
        if (chevron) {
            chevron.textContent = this.classList.contains('is-open') ? '▲' : '▼';
        }
    });
});

// 2. GESTION DU POP-UP IMAGES (LIGHTBOX)
const modal = document.getElementById("image-modal");
const modalImg = document.getElementById("img-in-modal");
const closeModal = document.querySelector(".close-modal");
const prevBtn = document.getElementById("prev-img");
const nextBtn = document.getElementById("next-img");
const counter = document.getElementById("modal-counter");

let currentGallery = [];
let currentIndex = 0;

if (modal && modalImg) {
    // Ouverture au clic sur une miniature
    document.querySelectorAll('.mini-gallery img').forEach(img => {
        img.addEventListener('click', function (e) {
            e.stopPropagation(); // Empêche le clic de fermer le parchemin en dessous

            const gallery = this.closest('.mini-gallery');
            currentGallery = Array.from(gallery.querySelectorAll('img'));
            currentIndex = currentGallery.indexOf(this);

            updateModal();
            modal.classList.add('show');
        });
    });

    // Mise à jour de l'image et du compteur
    function updateModal() {
        modalImg.src = currentGallery[currentIndex].src;
        if (counter) {
            counter.textContent = `${currentIndex + 1} / ${currentGallery.length}`;
        }
    }

    // Navigation (Précédent / Suivant)
    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            currentIndex = (currentIndex > 0) ? currentIndex - 1 : currentGallery.length - 1;
            updateModal();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            currentIndex = (currentIndex < currentGallery.length - 1) ? currentIndex + 1 : 0;
            updateModal();
        });
    }

    // Fermeture via la croix
    if (closeModal) {
        closeModal.addEventListener('click', () => modal.classList.remove('show'));
    }

    // Fermeture en cliquant dans le vide
    window.addEventListener('click', (e) => {
        if (e.target === modal || (e.target.classList && e.target.classList.contains('modal-nav'))) {
            modal.classList.remove('show');
        }
    });
}
