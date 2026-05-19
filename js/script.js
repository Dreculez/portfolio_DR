// ==========================================================================
// 1. GESTION DES ACCORDÉONS (PARCHEMINS)
// ==========================================================================
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', function () {
        this.classList.toggle('is-open');

        // Correction BEM du sélecteur du chevron
        const chevron = this.querySelector('.project-card__chevron');
        if (chevron) {
            chevron.textContent = this.classList.contains('is-open') ? '▲' : '▼';
        }
    });
});

// ==========================================================================
// 2. GESTION DE LA VISIONNEUSE INTERACTIVE (LIGHTBOX MODALE)
// ==========================================================================
const modal = document.getElementById("image-modal");
const modalImg = document.getElementById("img-in-modal");
const counter = document.getElementById("modal-counter");

// Correction BEM du sélecteur pour la croix de fermeture
const closeModal = document.querySelector(".modal__close");
const prevBtn = document.getElementById("prev-img");
const nextBtn = document.getElementById("next-img");

let currentGallery = [];
let currentIndex = 0;

if (modal && modalImg) {
    // Ouverture au clic sur une miniature (Correction BEM du sélecteur d'image)
    document.querySelectorAll('.mini-gallery__img').forEach(img => {
        img.addEventListener('click', function (e) {
            e.stopPropagation(); // Empêche le clic de fermer le parchemin en dessous

            const gallery = this.closest('.mini-gallery');
            currentGallery = Array.from(gallery.querySelectorAll('.mini-gallery__img'));
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

    // Navigation (Précédent)
    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            currentIndex = (currentIndex > 0) ? currentIndex - 1 : currentGallery.length - 1;
            updateModal();
        });
    }

    // Navigation (Suivant)
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

    // Fermeture en cliquant dans le vide (Correction BEM pour l'arrière-plan)
    window.addEventListener('click', (e) => {
        if (e.target === modal || (e.target.classList && e.target.classList.contains('modal__nav'))) {
            modal.classList.remove('show');
        }
    });
}