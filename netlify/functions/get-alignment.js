// 1. Base de données de secours (Garantie 100% fonctionnelle pour la démo)
const LOCAL_HEROES = {
    "superman": {
        alignment: "Légal Bon (Lawful Good)",
        analysis: "Le Journal s'illumine d'une aura d'or pur. Superman incarne la justice absolue, protégeant les faibles et respectant un code moral indéfectible pour guider l'humanité."
    },
    "jinx": {
        alignment: "Chaotique Mauvais (Chaotic Evil)",
        analysis: "Des éclats de rire déments semblent s'échapper des pages. Jinx ne cherche ni le pouvoir ni l'argent, seulement le chaos pur, la destruction et le plaisir de voir tout exploser."
    },
    "gandalf": {
        alignment: "Neutre Bon (Neutral Good)",
        analysis: "Une douce lueur argentée traverse l'encre. Le Magicien Gris agit pour le bien de tous, se souciant peu des lois des hommes tant que la tyrannie de l'Ombre est repoussée."
    },
    "batman": {
        alignment: "Légal Neutre / Chaotique Bon",
        analysis: "L'encre devient noire comme la nuit. Travaillant dans l'ombre, il suit sa propre règle absolue (ne pas tuer) pour imposer sa justice dans une cité corrompue."
    },
    "shyvana": {
        alignment: "Chaotique Neutre (Chaotic Neutral)",
        analysis: "Une chaleur ardente émane du parchemin. Guidée par son sang de dragon et sa fureur intérieure, Shyvana cherche sa place dans ce monde, oscillant entre la destruction sauvage et la loyauté envers ses rares alliés."
    },
    "miss fortune": {
        alignment: "Chaotique Neutre (Chaotic Neutral)",
        analysis: "Une odeur de poudre et d'océan envahit la pièce. Chasseuse de primes impitoyable, Sarah Fortune dicte ses propres lois à Bilgewater pour assouvir sa vengeance et maintenir son pouvoir."
    }
};

// 2. Logique du Journal
const JOURNAL_BTN = document.getElementById('ask-journal-btn');

if (JOURNAL_BTN) {
    JOURNAL_BTN.addEventListener('click', async () => {
        const inputElement = document.querySelector('.journal-input');
        const characterName = inputElement ? inputElement.value.trim() : '';
        const responseArea = document.querySelector('.response-area');

        if (!characterName) return;

        // Affichage du chargement
        if (responseArea) {
            responseArea.innerHTML = "<p class='magic-text'>L'Oracle consulte les astres...</p>";
            responseArea.classList.add('show');
        }

        const cleanName = characterName.toLowerCase();

        // TEST DU PLAN DE SECOURS LOCAL
        if (LOCAL_HEROES[cleanName]) {
            setTimeout(() => {
                responseArea.innerHTML = `
                    <h3 class="alignment-title" style="color: #f3f0df; font-family: 'Cinzel', serif; margin-bottom: 15px;">${LOCAL_HEROES[cleanName].alignment}</h3>
                    <p class="alignment-desc" style="font-style: italic; color: rgba(243, 240, 223, 0.8);">${LOCAL_HEROES[cleanName].analysis}</p>
                `;
            }, 800); // Petit délai pour simuler une réflexion magique
            return;
        }

        // FALLBACK : APPEL IA DIRECT (Si le personnage n'est pas dans la liste)
        // INSÈRE TA CLÉ GOOGLE AI STUDIO ENTRE LES GUILLEMETS CI-DESSOUS
        const API_KEY = "AIzaSyCp4cRmL5oyYIHTdpXMFm1rZO5BJTS5Axc";
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

        try {
            const prompt = `Analyse le personnage : "${characterName}". Donne son alignement officiel D&D et une courte explication de 2 sentences, style mystérieux. Réponds UNIQUEMENT en JSON valide : {"alignment": "L'alignement", "analysis": "L'explication"}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });

            if (!response.ok) throw new Error("Erreur API");

            const data = await response.json();
            let aiText = data.candidates[0].content.parts[0].text.trim();
            if (aiText.includes("```")) aiText = aiText.replace(/```json|```/g, "").trim();

            const result = JSON.parse(aiText);

            if (responseArea) {
                responseArea.innerHTML = `
                    <h3 class="alignment-title" style="color: #f3f0df; font-family: 'Cinzel', serif; margin-bottom: 15px;">${result.alignment}</h3>
                    <p class="alignment-desc" style="font-style: italic; color: rgba(243, 240, 223, 0.8);">${result.analysis}</p>
                `;
            }
        } catch (error) {
            console.error(error);
            if (responseArea) {
                responseArea.innerHTML = "<p class='error-text'>L'encre a bavé... Réessaie, voyageur.</p>";
            }
        }
    });
}