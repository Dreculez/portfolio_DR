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

    // Liste des modèles stables et actifs à tester l'un après l'autre
    const modelsToTry = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-3-flash"];
    let lastError = null;

    for (const model of modelsToTry) {
        try {
            const prompt = `Analyse le personnage : "${characterName}". Donne son alignement officiel D&D et une courte explication de 2 phrases maximum, écrite avec un style mystérieux et magique. Tu DOIS répondre UNIQUEMENT sous la forme d'un objet JSON valide, sans aucun texte avant ou après, et sans aucun bloc de code markdown. Format exact attendu : {"alignment": "L'alignement ici", "analysis": "Ton explication ici"}`;

            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            if (response.ok) {
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
            } else {
                const errText = await response.text();
                console.warn(`Le modèle ${model} a échoué, essai du suivant...`);
                lastError = `Google API (${model}): ${response.status} - ${errText}`;
            }
        } catch (err) {
            lastError = err.message;
        }
    }

    return {
        statusCode: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({
            error: "L'encre a bavé... Aucun modèle disponible.",
            details: lastError
        })
    };
};