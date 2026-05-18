exports.handler = async function (event, context) {
    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
            },
            body: ""
        };
    }

    const characterName = event.queryStringParameters.name;
    if (!characterName) {
        return {
            statusCode: 400,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: "Le nom du personnage est requis." })
        };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: "La clé de l'Oracle n'est pas configurée." })
        };
    }

    try {
        const prompt = `Analyse le personnage : "${characterName}". Donne son alignement officiel D&D et une courte explication de 2 phrases maximum, écrite avec un style mystérieux et magique. Tu DOIS répondre UNIQUEMENT sous la forme d'un objet JSON valide, sans aucun texte avant ou après, et sans aucun bloc de code markdown. Format exact attendu : {"alignment": "L'alignement ici", "analysis": "Ton explication ici"}`;

        // CORRECTION : Passage au modèle actif gemini-2.0-flash
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        if (!response.ok) {
            throw new Error(`Erreur API Google: ${response.status}`);
        }

        const data = await response.json();
        let aiText = data.candidates[0].content.parts[0].text.trim();

        if (aiText.includes("```")) {
            aiText = aiText.replace(/```json|```/g, "").trim();
        }

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
        console.error(error);
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({
                error: "L'encre a bavé...",
                details: error.message
            })
        };
    }
};