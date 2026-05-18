const JORNAL_BTN = document.getElementById('ask-journal-btn');

if (JORNAL_BTN) {
    JORNAL_BTN.addEventListener('click', async () => {
        const inputElement = document.querySelector('.journal-input');
        const characterName = inputElement ? inputElement.value.trim() : '';
        const responseArea = document.querySelector('.response-area');

        if (!characterName) return;

        // On affiche un message d'attente magique
        if (responseArea) {
            responseArea.innerHTML = "<p class='magic-text'>L'Oracle consulte les astres...</p>";
            responseArea.classList.add('show');
        }

        // TA CLÉ GOOGLE EN DIRECT (Bypass de sécurité pour l'urgence)
        // Remplace par ta vraie clé récupérée sur Google AI Studio
        const API_KEY = "AIzaSyCp4cRmL5oyYIHTdpXMFm1rZO5BJTS5Axc";

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

        try {
            const prompt = `Analyse le personnage : "${characterName}". Donne son alignement officiel D&D et une courte explication de 2 phrases maximum, écrite avec un style mystérieux et magique. Tu DOIS répondre UNIQUEMENT sous la forme d'un objet JSON valide, sans aucun texte avant ou après, et sans aucun bloc de code markdown. Format exact attendu : {"alignment": "L'alignement ici", "analysis": "Ton explication ici"}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            const data = await response.json();
            let aiText = data.candidates[0].content.parts[0].text.trim();

            if (aiText.includes("```")) {
                aiText = aiText.replace(/```json|```/g, "").trim();
            }

            const result = JSON.parse(aiText);

            // On affiche le résultat de l'IA dans ton beau design
            if (responseArea) {
                responseArea.innerHTML = `
                    <h3 class="alignment-title">${result.alignment}</h3>
                    <p class="alignment-desc">${result.analysis}</p>
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