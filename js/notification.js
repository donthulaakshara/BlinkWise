let notificationCooldown = false;

function requestNotificationPermission() {

    if (!("Notification" in window)) {

        console.log(
            "Notifications not supported"
        );

        return;
    }

    Notification
        .requestPermission()
        .then(permission => {

            console.log(
                "Notification Permission:",
                permission
            );

        });
}

function playAlertSound() {

    try {

        const audio =
            new Audio(
                "assets/sounds/alert.mp3"
            );

        audio.volume = 0.5;

        audio.play();

    } catch (error) {

        console.log(
            "Audio Error:",
            error
        );
    }
}

function getReminderMessage() {

    const currentMode =
        window.getCurrentMode();

    if (
        currentMode ===
        "Student"
    ) {

        return {
            title:
                "BlinkWise • Study Reminder",

            body:
                "Your eyes need a short refresh. Blink a few times and look away from the screen."
        };
    }

    if (
        currentMode ===
        "Gamer"
    ) {

        return {
            title:
                "BlinkWise • Gaming Alert",

            body:
                "You're highly focused. Remember to blink and reduce eye strain."
        };
    }

    return {

        title:
            "BlinkWise • Work Reminder",

        body:
            "Blink rate is below the healthy range. Please blink naturally."
    };
}

function showBlinkReminder() {

    if (
        Notification.permission !==
        "granted"
    ) {

        return;
    }

    if (
        notificationCooldown
    ) {

        return;
    }

    const message =
        getReminderMessage();

    new Notification(
        message.title,
        {
            body:
                message.body,

            icon:
                "assets/logo.png",

            silent:
                false
        }
    );

    playAlertSound();

    notificationCooldown =
        true;

    setTimeout(() => {

        notificationCooldown =
            false;

    }, 60000);
}