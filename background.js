console.log("Background Started");

const API_KEY = "YOUR_API_KEY";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    if (request.type !== "GET_SUGGESTION") return;

    fetch("https://api.groq.com/openai/v1/chat/completions", {

        method: "POST",

        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            model: "llama-3.3-70b-versatile",

            messages: [
                {
                    role: "system",
                    content:
                        "You are an autocomplete engine. Continue the user's text naturally. Return ONLY the continuation."
                },
                {
                    role: "user",
                    content: request.text
                }
            ],

            temperature: 0.5,
            max_tokens: 40

        })

    })

    .then(res => res.json())

.then(data => {
    console.log(data);

    let suggestion = data.choices?.[0]?.message?.content || "";

    suggestion = suggestion.replace(/^\s+/, "");

    sendResponse({ suggestion });
})

    .catch(err => {

        console.error(err);

        sendResponse({
            suggestion: ""
        });

    });

    return true;

});