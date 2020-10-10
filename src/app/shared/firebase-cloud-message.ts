export interface FirebaseCloudMessage {
    messageType?: 'notification' | 'data';

    // Foreground
    title?: string;
    body?: string;
    show_notification?: string;

    tap?: 'background';

    data?: { [key: string]: string };
    link?: string;
    linkLabel?: string;
    themeColor?: string;
}
