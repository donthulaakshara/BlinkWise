window.addEventListener("load", () => {

    requestNotificationPermission();

    console.log("BlinkWise Started");

});

let currentMode = "Work";

const modeElement =
    document.getElementById(
        "currentMode"
    );

const healthScoreElement =
    document.getElementById(
        "healthScore"
    );

// Default values
let alertThreshold = 10;

// Student Mode
document
    .getElementById("studentBtn")
    .addEventListener(
        "click",
        () => {

            currentMode =
                "Student";

            alertThreshold = 12;

            modeElement.textContent =
                currentMode;

            console.log(
                "Mode:",
                currentMode
            );
        }
    );

// Work Mode
document
    .getElementById("workBtn")
    .addEventListener(
        "click",
        () => {

            currentMode =
                "Work";

            alertThreshold = 10;

            modeElement.textContent =
                currentMode;

            console.log(
                "Mode:",
                currentMode
            );
        }
    );

// Gamer Mode
document
    .getElementById("gamerBtn")
    .addEventListener(
        "click",
        () => {

            currentMode =
                "Gamer";

            alertThreshold = 15;

            modeElement.textContent =
                currentMode;

            console.log(
                "Mode:",
                currentMode
            );
        }
    );

// Future access from blinkDetector.js
window.getCurrentMode =
    () => currentMode;

window.getAlertThreshold =
    () => alertThreshold;

window.updateHealthScore =
    (score) => {

        healthScoreElement
            .textContent = score;
    };