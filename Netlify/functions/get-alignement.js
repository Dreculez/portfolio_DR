// Fonction serveur exécutée en tâche de fond par Netlify
exports.handler = async function (event, context) {
    // 1. Récupérer le nom du personnage envoyé par le site
    const characterName = event.queryStringParameters.name;

    if (!characterName) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Le nom du personnage est requis." })
        };
    }

    // 2. Récupérer la clé API cachée dans l'environnement Netlify
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "La clé de l'Oracle n'est pas configurée du côté serveur." })
        };
    }

    try {
        // 3. Envoyer la requête à l'IA avec un prompt précis de "Maître du Jeu"
        const prompt = `Tu es le Journal Magique de Tom Jedusor combiné à un Maître du Jeu D&D expert. 
        Analyse le personnage suivant : "${characterName}".
        Donne uniquement son alignement officiel D&D (ex: "Légal Bon", "Chaotique Mauvais", "Neutre Strict", etc.) et une courte explication de 2-3 phrases maximum, écrite avec un style mystérieux et magique (comme si l'encre apparaissait sur du vieux papier).
        Format de réponse obligatoire en JSON pur :
        {
            "alignment": "L'alignement textuel ici",
            "analysis": "Ton explication de 2-3 phrases ici"
        }`;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();

        // Extraire le texte brut renvoyé par l'IA
        const aiText = data.candidates[0].content.parts[0].text;

        // Nettoyer les éventuels backticks "```json" si l'IA en ajoute par réflexe
        const cleanJson = aiText.replace(/```json|```/g, '').trim();
        const result = JSON.parse(cleanJson);

        // 4. Renvoyer la réponse propre à ton script.js
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(result)
        };

    } catch (error) {
        console.error("Erreur serveur :", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "L'encre a bavé... Impossible de lire la réponse de l'IA." })
        };
    }
};