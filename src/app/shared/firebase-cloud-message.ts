export interface FirebaseCloudMessage {
    messageType?: 'notification' | 'data';
    channel_id?: string;
    notification_android_channel_id?: string;

    // Foreground
    title?: string;
    body?: string;
    show_notification?: string;

    tap?: 'background';

    // Custom
    data?: { [key: string]: string };
    titleText?: string;
    bodyText?: string;
    bodyText2?: string;
    bodyText3?: string;
    link?: string;
    linkLabel?: string;
    linkColor?: string;
    imageUrl?: string;
    isAd?: string;
}
