export interface FirebaseCloudMessage {
    messageType?: 'notification' | 'data';

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
