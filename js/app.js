console.log("BlinkWise Started");

let currentMode = "Work";

const modeElement = document.getElementById("currentMode");

document
    .getElementById("studentBtn")
    .addEventListener("click", () => {

        currentMode = "Student";
        modeElement.textContent = currentMode;

        console.log(currentMode);
    });

document
    .getElementById("workBtn")
    .addEventListener("click", () => {

        currentMode = "Work";
        modeElement.textContent = currentMode;

        console.log(currentMode);
    });

document
    .getElementById("gamerBtn")
    .addEventListener("click", () => {

        currentMode = "Gamer";
        modeElement.textContent = currentMode;

        console.log(currentMode);
    });