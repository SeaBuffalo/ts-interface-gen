const getParentAndChildInterfaces = require("./generator.js");

const titleInput = document.getElementById("title");
const jsonInput = document.getElementById("input");
const result = document.getElementById("interface");
const resultContainer = document.getElementById("result-ctr");
const submitButton = document.getElementById("submit");
const copyButton = document.getElementById("copy");
const resetButton = document.getElementById("reset");

const handleConvert = async() => {
  const titleInputVal = titleInput.value;
  const jsonInputVal = jsonInput.value;
  if (titleInputVal && jsonInputVal) {
    const tsInterface = await getParentAndChildInterfaces(
      titleInputVal, jsonInputVal
    );
    if (tsInterface) {
      result.innerHTML = tsInterface;
      resultContainer.classList.remove("hidden");
      resultContainer.scrollIntoView({ 
        behavior: "smooth", block: "start", inline: "nearest" 
      });
    }
  } else {
    alert("Please validate inputs");
  }
}

const copyResult = () => {
  if (result && result.innerText) {
    navigator.clipboard.writeText(result.innerText.trim());
    copyButton.innerHTML = 'Copied! <i class="color-green"> &#10003;</i>';
    copyButton.classList.add("border-green");
    copyButton.setAttribute("disabled", "disabled");
    setTimeout(
      () => {
        copyButton.innerHTML = "Copy";
        copyButton.classList.remove("border-green");
        copyButton.removeAttribute("disabled");
      }, 
      2000
    )
  }
}

const refresh = () => {
  if (resetButton) {
    location.reload();
  }
}

copyButton && copyButton.addEventListener("click", copyResult);
submitButton && submitButton.addEventListener("click", handleConvert);
resetButton && resetButton.addEventListener("click", refresh); 