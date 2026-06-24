const video = document.getElementById("video");

async function startCamera() {

    try {

        const stream =
            await navigator.mediaDevices.getUserMedia({
                video: true
            });

        video.srcObject = stream;

        console.log("Camera Started");

    } catch (error) {

        console.error(
            "Camera Access Denied",
            error
        );
    }
}

startCamera();