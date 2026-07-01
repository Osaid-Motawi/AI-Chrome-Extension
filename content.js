console.log("AI Autocomplete Extension Loaded");

let activeElement = null;
let typingTimer;
let currentSuggestion = "";

const suggestionBox = document.createElement("div");
suggestionBox.style.position = "absolute";
suggestionBox.style.pointerEvents = "none";
suggestionBox.style.whiteSpace = "pre-wrap";
suggestionBox.style.wordWrap = "break-word";
suggestionBox.style.zIndex = "999999";
suggestionBox.style.display = "none";
suggestionBox.style.overflow = "hidden";
suggestionBox.style.margin = "0";
document.body.appendChild(suggestionBox);

document.addEventListener("focusin", (event) => {
    const element = event.target;

    if (
        element.tagName === "TEXTAREA" ||
        (element.tagName === "INPUT" && element.type === "text") ||
        element.isContentEditable
    ) {
        activeElement = element;
        console.log("Focused:", element);
    }
});

document.addEventListener("input", (event) => {
    const element = event.target;

    if (element !== activeElement) return;

    currentSuggestion = "";
    suggestionBox.style.display = "none";

    clearTimeout(typingTimer);

    typingTimer = setTimeout(() => {

        const text = getText(element);

        if (!text || text.trim().length < 2) return;

        console.log("Sending message to background:", text);

        chrome.runtime.sendMessage(
            {
                type: "GET_SUGGESTION",
                text: text
            },
            (response) => {

                if (chrome.runtime.lastError) {
                    console.error("Runtime Error:", chrome.runtime.lastError.message);
                    return;
                }

console.log("Response from background:", response);

if (activeElement !== element) return;
if (getText(element) !== text) return;

if (response && response.suggestion) {
    let suggestion = response.suggestion;

    const endsWithSpace = /\s$/.test(text);
    const startsClean = /^[\s.,!?;:'")\]،؛]/.test(suggestion);

    if (!endsWithSpace && !startsClean && suggestion.length > 0) {
        suggestion = " " + suggestion;
    }

    currentSuggestion = suggestion;
    console.log("AI Suggestion:", currentSuggestion);
    renderSuggestion(element, text);
}
            }
        );

    }, 500);
});

document.addEventListener("keydown", (event) => {

    if (event.key !== "Tab") return;
    if (!activeElement) return;
    if (!currentSuggestion) return;

    event.preventDefault();

    if (activeElement.isContentEditable) {
        activeElement.innerText += currentSuggestion;
    } else {
        activeElement.value += currentSuggestion;
        activeElement.dispatchEvent(new Event("input", { bubbles: true }));
    }

    console.log("Suggestion accepted:", currentSuggestion);

    currentSuggestion = "";
    suggestionBox.style.display = "none";
    suggestionBox.textContent = "";
});

function getText(element) {
    if (element.isContentEditable) return element.innerText;
    return element.value;
}

function renderSuggestion(element, typedText) {
    if (!currentSuggestion) return;

    positionSuggestion(element);

    suggestionBox.innerHTML = "";

    const typedSpan = document.createElement("span");
    typedSpan.textContent = typedText;
    typedSpan.style.color = "transparent"; 

    const suggestionSpan = document.createElement("span");
    suggestionSpan.textContent = currentSuggestion;
    suggestionSpan.style.color = "#9a9a9a"; 

    suggestionBox.appendChild(typedSpan);
    suggestionBox.appendChild(suggestionSpan);

    suggestionBox.style.display = "block";
}

function positionSuggestion(element) {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);

    console.log("positionSuggestion rect:", rect);

    suggestionBox.style.boxSizing = style.boxSizing;
    suggestionBox.style.left = window.scrollX + rect.left + "px";
    suggestionBox.style.top = window.scrollY + rect.top + "px";
    suggestionBox.style.width = rect.width + "px";
    suggestionBox.style.height = rect.height + "px";

    suggestionBox.style.fontSize = style.fontSize;
    suggestionBox.style.fontFamily = style.fontFamily;
    suggestionBox.style.fontWeight = style.fontWeight;
    suggestionBox.style.letterSpacing = style.letterSpacing;
    suggestionBox.style.lineHeight = style.lineHeight;

    suggestionBox.style.paddingTop = style.paddingTop;
    suggestionBox.style.paddingBottom = style.paddingBottom;
    suggestionBox.style.paddingLeft = style.paddingLeft;
    suggestionBox.style.paddingRight = style.paddingRight;

    suggestionBox.style.borderWidth = style.borderWidth;
    suggestionBox.style.borderStyle = "solid";
    suggestionBox.style.borderColor = "transparent";

    suggestionBox.style.direction = style.direction;
    suggestionBox.style.textAlign = style.textAlign;
}

window.addEventListener("scroll", () => {
    if (currentSuggestion && activeElement) positionSuggestion(activeElement);
}, true);

window.addEventListener("resize", () => {
    if (currentSuggestion && activeElement) positionSuggestion(activeElement);
});

document.addEventListener("selectionchange", () => {
    suggestionBox.style.display = "none";
    suggestionBox.textContent = "";
    currentSuggestion = "";
});