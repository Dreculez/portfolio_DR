exports.handler = async function (event, context) {
    // 1. Gestion du protocole CORS (sécurité des navigateurs)
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
        // Prompt ultra-simplifié pour éviter que l'IA ne génère du texte parasite
        const prompt = `Donne l'alignement D&D de "${characterName}" et explique pourquoi en 2 phrases. 
        Tu dois UNIQUEMENT répondre avec ce format JSON strict, rien d'autre :
        {"alignment": "Nom de l'alignement", "analysis": "Ton explication ici"}`;

        // Utilisation du endpoint stable text-only de Gemini
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        if (!response.ok) {
            const errData = await response.text();
            console.error("Erreur API Google:", errData);
            throw new Error(`Google API a répondu avec un statut ${response.status}`);
        }

        const data = await response.json();

        // Extraction native du texte brut
        let aiText = data.candidates[0].content.parts[0].text.trim();

        // Nettoyage des backticks Markdown (```json ... ```) si l'IA en a mis
        if (aiText.startsWith("```")) {
            aiText = aiText.replace(/```json|```/g, "").trim();
        }

        // Validation que la chaîne est bien du JSON valide avant envoi
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
        console.error("Erreur complète sur la fonction :", error);
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