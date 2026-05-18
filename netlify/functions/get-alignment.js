exports.handler = async function (event, context) {
    const characterName = event.queryStringParameters.name;

    if (!characterName) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Le nom du personnage est requis." })
        };
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "La clé de l'Oracle n'est pas configurée." })
        };
    }

    try {
        const prompt = `Analyse le personnage suivant : "${characterName}".
        Donne son alignement officiel D&D (ex: "Légal Bon", "Chaotique Mauvais", etc.) et une courte explication de 2 phrases maximum, écrite avec un style mystérieux et magique.
        Tu DOIS répondre UNIQUEMENT sous la forme d'un objet JSON valide, sans aucun texte avant ou après, et sans blocs de code markdown (pas de backticks \`\`\`).
        Format exact attendu :
        {"alignment": "L'alignement ici", "analysis": "Ton explication ici"}`;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();

        // Récupération sécurisée du texte de l'IA
        let aiText = data.candidates[0].content.parts[0].text.trim();

        // Nettoyage de sécurité au cas où l'IA met du markdown malgré tout
        if (aiText.includes("```")) {
            aiText = aiText.replace(/```json|```/g, "").trim();
        }

        // On vérifie si c'est bien du JSON avant de l'envoyer au site
        const result = JSON.parse(aiText);

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify(result)
        };

    } catch (error) {
        console.error("Erreur serveur :", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "L'encre a bavé... Impossible de décoder la prophétie." })
        };
    }
};