class NotificationEngine {

    constructor() {

        this.hasPermission =
            false;

        this.cooldown =
            false;

        this.init();
    }

    init() {

        if (!("Notification" in window)) {

            console.log(
                "Notifications not supported"
            );

            return;
        }

        if (Notification.permission === "granted") {

            this.hasPermission =
                true;

        } else if (Notification.permission !== "denied") {

            Notification
                .requestPermission()
                .then(permission => {

                    this.hasPermission =
                        (permission === "granted");

                    console.log(
                        "Notification Permission:",
                        permission
                    );

                });
        }
    }

    playAlertSound() {

        try {

            const audio =
                new Audio(
                    "assets/sounds/alert.mp3"
                );

            audio.volume =
                0.5;

            audio.play();

        } catch (error) {

            console.log(
                "Audio Error:",
                error
            );
        }
    }

    getReminderMessage() {

        // Fallback check just in case getCurrentMode isn't loaded yet
        const currentMode =
            typeof window.getCurrentMode === "function"
                ? window.getCurrentMode()
                : document.getElementById("currentMode").textContent.trim();

        if (
            currentMode ===
            "Student"
        ) {

            return {
                title:
                    "BlinkWise • Study Reminder",

                body:
                    "Your eyes need a short refresh. Blink a few times and look away from the screen.",
                
                type: 
                    "warning"
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
                    "You're highly focused. Remember to blink and reduce eye strain.",
                
                type: 
                    "danger"
            };
        }

        return {

            title:
                "BlinkWise • Work Reminder",

            body:
                "Blink rate is below the healthy range. Please blink naturally.",
            
            type: 
                "warning"
        };
    }

    showBanner(message, type) {

        const banner =
            document.getElementById('alertBanner');

        if (!banner) return;

        banner.textContent =
            message;

        banner.style.display =
            "block";

        if (type === "danger") {

            banner.style.background =
                "rgba(239, 68, 68, 0.2)";

            banner.style.border =
                "1px solid rgba(239, 68, 68, 0.5)";

            banner.style.color =
                "#fca5a5";

        } else {

            banner.style.background =
                "rgba(251, 191, 36, 0.2)";

            banner.style.border =
                "1px solid rgba(251, 191, 36, 0.5)";

            banner.style.color =
                "#fcd34d";
        }

        setTimeout(() => {

            banner.style.display =
                "none";

        }, 5000);
    }

    triggerBlinkReminder() {

        if (!this.hasPermission) return;

        if (this.cooldown) return;

        const message =
            this.getReminderMessage();

        this.sendDesktopNotification(
            message.title,
            message.body
        );

        this.showBanner(
            message.body,
            message.type
        );

        this.playAlertSound();

        this.cooldown =
            true;

        // Keeps your exact 60-second cooldown logic
        setTimeout(() => {

            this.cooldown =
                false;

        }, 60000);
    }

    trigger202020Rule() {

        if (!this.hasPermission) return;

        this.sendDesktopNotification(
            "BlinkWise • 20-20-20 Rule",
            "You've been focused for 20 minutes! Look at something 20 feet away for 20 seconds."
        );

        this.showBanner(
            "20-20-20 Rule: Look 20ft away for 20s!",
            "warning"
        );

        this.playAlertSound();
    }

    sendDesktopNotification(title, body) {

        new Notification(
            title,
            {
                body:
                    body,

                icon:
                    "assets/logo.png",

                silent:
                    false,
                
                // Keeps the popup on screen until the user dismisses it
                requireInteraction:
                    true 
            }
        );
    }
}

// Initialize globally so other files can trigger it
const AppNotifier =
    new NotificationEngine();