const videoElement = document.getElementById("video");
const canvasElement = document.getElementById("outputCanvas");
const canvasCtx = canvasElement.getContext("2d");

const statusElement =
    document.getElementById("status");

const blinkCountElement =
    document.getElementById("blinkCount");

const blinkRateElement =
    document.getElementById("blinkRate");

const earElement =
    document.getElementById("earValue");

const LEFT_EYE =
    [33, 160, 158, 133, 153, 144];

const RIGHT_EYE =
    [362, 385, 387, 263, 373, 380];

let blinkCount = 0;
let frameCounter = 0;

let startTime = Date.now();

let lastBlinkTime = Date.now();
let lastReminderTime = 0;

const BLINK_THRESHOLD = 0.23;
const CLOSED_EYE_FRAMES = 2;

function distance(p1, p2) {

    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;

    return Math.sqrt(
        dx * dx +
        dy * dy
    );
}

function calculateEAR(
    landmarks,
    eye
) {

    const p1 =
        landmarks[eye[0]];

    const p2 =
        landmarks[eye[1]];

    const p3 =
        landmarks[eye[2]];

    const p4 =
        landmarks[eye[3]];

    const p5 =
        landmarks[eye[4]];

    const p6 =
        landmarks[eye[5]];

    const vertical1 =
        distance(p2, p6);

    const vertical2 =
        distance(p3, p5);

    const horizontal =
        distance(p1, p4);

    return (
        vertical1 +
        vertical2
    ) / (2 * horizontal);
}

function drawEyePoints(
    landmarks,
    eyeIndices,
    color
) {

    for (
        const index
        of eyeIndices
    ) {

        const point =
            landmarks[index];

        canvasCtx.beginPath();

        canvasCtx.arc(
            point.x *
            canvasElement.width,

            point.y *
            canvasElement.height,

            4,
            0,
            Math.PI * 2
        );

        canvasCtx.fillStyle =
            color;

        canvasCtx.fill();
    }
}

const faceMesh =
    new FaceMesh({

        locateFile:
            (file) =>
                `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`

    });

faceMesh.setOptions({

    maxNumFaces: 1,

    refineLandmarks: true,

    minDetectionConfidence: 0.5,

    minTrackingConfidence: 0.5

});

faceMesh.onResults(
    (results) => {

        canvasElement.width =
            videoElement.videoWidth;

        canvasElement.height =
            videoElement.videoHeight;

        canvasCtx.clearRect(
            0,
            0,
            canvasElement.width,
            canvasElement.height
        );

        if (
            !results.multiFaceLandmarks ||
            results.multiFaceLandmarks.length === 0
        ) {

            statusElement.textContent =
                "No Face Detected";

            return;
        }

        statusElement.textContent =
            "Monitoring";

        const landmarks =
            results.multiFaceLandmarks[0];

        drawEyePoints(
            landmarks,
            LEFT_EYE,
            "#60a5fa"
        );

        drawEyePoints(
            landmarks,
            RIGHT_EYE,
            "#22c55e"
        );

        const leftEAR =
            calculateEAR(
                landmarks,
                LEFT_EYE
            );

        const rightEAR =
            calculateEAR(
                landmarks,
                RIGHT_EYE
            );

        const averageEAR =
            (
                leftEAR +
                rightEAR
            ) / 2;

        earElement.textContent =
            averageEAR.toFixed(3);

        if (
            averageEAR <
            BLINK_THRESHOLD
        ) {

            frameCounter++;

        } else {

            if (
                frameCounter >=
                CLOSED_EYE_FRAMES
            ) {

                blinkCount++;

                lastBlinkTime =
                    Date.now();

                blinkCountElement.textContent =
                    blinkCount;

                console.log(
                    "Blink:",
                    blinkCount
                );
            }

            frameCounter = 0;
        }
    }
);

async function startFaceTracking() {

    if (
        videoElement.readyState >= 2
    ) {

        await faceMesh.send({
            image:
                videoElement
        });
    }

    requestAnimationFrame(
        startFaceTracking
    );
}

videoElement.addEventListener(
    "loadeddata",
    () => {

        startFaceTracking();

    }
);

setInterval(() => {

    const elapsedMinutes =
        (Date.now() -
            startTime) /
        60000;

    const blinkRate =
        elapsedMinutes > 0
            ? blinkCount /
              elapsedMinutes
            : 0;

    blinkRateElement.textContent =
        blinkRate.toFixed(1);

    let healthScore = 100;

    if (
        blinkRate < 15
    ) {

        healthScore -= 15;
    }

    if (
        blinkRate < 10
    ) {

        healthScore -= 20;
    }

    if (
        Date.now() -
            lastBlinkTime >
        15000
    ) {

        healthScore -= 25;
    }

    healthScore =
        Math.max(
            0,
            healthScore
        );

    window.updateHealthScore(
        healthScore
    );

    const threshold =
        window.getAlertThreshold();

    if (
        blinkRate < threshold &&
        Date.now() -
            lastReminderTime >
        60000
    ) {

        showBlinkReminder();

        lastReminderTime =
            Date.now();
    }

}, 1000);