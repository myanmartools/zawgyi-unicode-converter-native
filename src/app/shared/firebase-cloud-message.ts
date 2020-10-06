export interface FirebaseCloudMessage {
    messageType: 'notification';
    from: string;
    title?: string;
    body?: string;
    collapse_key?: string;
    show_notification?: string;
    tap?: 'background';
}
