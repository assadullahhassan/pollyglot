// import { marked } from "marked";
// import DOMPurify from "dompurify";

const form = document.querySelector("form");
const input = document.querySelector("textarea");
const output = document.querySelector("#output");
const mainSub = document.querySelector("#main-sub");
const btnDiv = document.querySelector("#btn-div");
const outputDiv = document.querySelector("#output-div");
const translateBtn = document.querySelector("#translate-btn");
const outputContent = document.querySelector("#output-content");

translateBtn.disabled = true;


input.addEventListener("input", () => {
  translateBtn.disabled = input.value.trim().length < 3;
});

translateBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  const text = input.value;
  console.log("Input text:", text);
  const targetLanguage = document.querySelector('input[name="target-language"]:checked').value;
    mainSub.style.display = "none";
    outputDiv.style.display = "block";
    outputContent.innerHTML = `<p>Translating...</p>`;

    input.readOnly = true;
    btnDiv.innerHTML = `
        <button type="btn" onclick="location.reload()">Start Over</button>
    `;
    try {
    const response = await fetch("http://localhost:3000/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text, targetLanguage })
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
      outputContent.textContent = "Translation failed. Please try again.";
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let translatedText = "";

      while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      console.log("Chunk :", chunk);
      setTimeout(() => {
      translatedText += chunk;
      translatedText = translatedText.replace('undefined', '');
      outputContent.textContent = translatedText; 
      }, 400);
    }

    

  } catch (error) {
    console.error("Error translating text:", error);
    outputContent.textContent = "Translation failed. Please try again.";
  }
});