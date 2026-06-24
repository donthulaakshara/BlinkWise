const videoElement =
    document.getElementById("video");

const canvasElement =
    document.getElementById("outputCanvas");

const canvasCtx =
    canvasElement.getContext("2d");

const statusElement =
    document.getElementById("status");

const blinkCountElement =
    document.getElementById("blinkCount");

const blinkRateElement =
    document.getElementById("blinkRate");

const earElement =
    document.getElementById("earValue");

const calibrationElement =
    document.getElementById(
        "calibrationStatus"
    );

const thresholdElement =
    document.getElementById(
        "thresholdValue"
    );

const LEFT_EYE =
    [33, 160, 158, 133, 153, 144];

const RIGHT_EYE =
    [362, 385, 387, 263, 373, 380];

let blinkCount = 0;

let frameCounter = 0;

let startTime =
    Date.now();

let lastBlinkTime =
    Date.now();

let lastReminderTime = 0;

let lastFaceDetectedTime =
    Date.now();

let blinkThreshold = 0.23;

let calibrationValues = [];

let isCalibrated = false;

const calibrationDuration =
    15000;

const calibrationStart =
    Date.now();

const CLOSED_EYE_FRAMES = 3;

let currentEAR = 0;

let currentBlinkRate = 0;

let healthScore = 100;

function distance(
    p1,
    p2
) {

    const dx =
        p1.x - p2.x;

    const dy =
        p1.y - p2.y;

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
        distance(
            p2,
            p6
        );

    const vertical2 =
        distance(
            p3,
            p5
        );

    const horizontal =
        distance(
            p1,
            p4
        );

    return (
        vertical1 +
        vertical2
    ) /
    (
        2 *
        horizontal
    );
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
                "Face Lost";

            return;
        }

        lastFaceDetectedTime =
            Date.now();

        statusElement.textContent =
            "Tracking";

        const landmarks =
            results.multiFaceLandmarks[0];

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

        currentEAR =
            averageEAR;

        earElement.textContent =
            averageEAR.toFixed(
                3
            );

        // Calibration Data Collection
        if (
            !isCalibrated
        ) {

            calibrationValues.push(
                averageEAR
            );

            // FIX 1: The 'return;' was removed from here. 
            // Now the code proceeds to count blinks using the default 0.23 threshold!
        }

        // Active Tracking (Always running now)
        if (
            averageEAR <
            blinkThreshold
        ) {

            frameCounter++;

        } else {

            if (
                frameCounter >=
                CLOSED_EYE_FRAMES &&
                Date.now() -
                lastBlinkTime >
                300
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

    // FIX 2: Background Tab Bypass
    if (document.hidden) {
        
        // If tab is minimized, force tracking to continue via setTimeout
        setTimeout(startFaceTracking, 100);
        
    } else {
        
        // If tab is active, use native smooth frames
        requestAnimationFrame(
            startFaceTracking
        );
    }
}

videoElement.addEventListener(
    "loadeddata",
    () => {

        startFaceTracking();

    }
);

// Fallback visibility listener to kickstart camera if it ever completely halts
document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
        startFaceTracking();
    }
});


// THE BULLETPROOF LOOP
setInterval(() => {

    const now =
        Date.now();

    // 1. Calculate REAL Blink Rate instantly (scaling up partial minutes)
    const elapsedMinutes =
        (now - startTime) / 60000;

    currentBlinkRate =
        elapsedMinutes > 0
            ? Math.round(blinkCount / elapsedMinutes)
            : 0;

    blinkRateElement.textContent = 
        currentBlinkRate;

    blinkRateElement.style.color = 
        "white";

    // 2. Calibration Countdown UI
    if (!isCalibrated) {

        const elapsedCal =
            now - calibrationStart;

        if (elapsedCal < calibrationDuration) {

            const secondsLeft =
                Math.ceil((calibrationDuration - elapsedCal) / 1000);

            calibrationElement.textContent =
                `Calibrating (${secondsLeft}s)...`;

            calibrationElement.className =
                "status-orange";

        } else {

            isCalibrated =
                true;

            // Lock in custom threshold
            if (
                calibrationValues &&
                calibrationValues.length > 0
            ) {

                const sumEAR =
                    calibrationValues.reduce(
                        (a, b) => a + b,
                        0
                    );

                const baselineEAR =
                    sumEAR /
                    calibrationValues.length;

                blinkThreshold =
                    baselineEAR *
                    0.75;

            } else {

                blinkThreshold =
                    0.25;
            }

            calibrationElement.textContent =
                "Complete";

            calibrationElement.className =
                "status-green";

            thresholdElement.textContent =
                blinkThreshold.toFixed(
                    3
                );

            console.log(
                "Calibration locked in! Custom Threshold:",
                blinkThreshold
            );
        }

    } 

// 3. Background Notification Trigger (UNLOCKED)
    const timeSinceLastBlink =
        now - lastBlinkTime;

    const timeSinceLastFace =
        now - lastFaceDetectedTime;

    // THE FIX: It now dynamically reads your Mode Threshold!
    if (
        (timeSinceLastFace < 2000 || document.hidden) &&
        timeSinceLastBlink > window.ALERT_THRESHOLD
    ) {

        if (typeof AppNotifier !== "undefined") {

            console.log(
                "ALERT FIRED: User passed the threshold without blinking!"
            );

            // This will trigger the pop-up AND play alert.mp3
            AppNotifier.triggerBlinkReminder();

            // Reset the blink timer to avoid spam
            lastBlinkTime =
                now;

        } 
    }

    // 4. Update Session Time
    const sessionElapsed =
        Math.floor((now - startTime) / 1000);

    const minutes =
        String(Math.floor(sessionElapsed / 60)).padStart(2, '0');

    const seconds =
        String(sessionElapsed % 60).padStart(2, '0');

    const sessionTimeElement =
        document.getElementById("sessionTime");

    if (sessionTimeElement) {
        
        sessionTimeElement.textContent =
            `${minutes}:${seconds}`;
            
    }

}, 1000);