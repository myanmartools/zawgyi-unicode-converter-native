export interface Sponsor {
    title: string;
    subTitle?: string;
    logoUrl: string;
    imageUrl?: string;
    themeColor?: string;
    description: string;
    detailUrlForMobile?: string;
    detailUrlForWeb?: string;
    detailUrlLabelForMobile?: string;
    detailUrlLabelForWeb?: string;
    expiresIn?: number | null;
    inactive?: boolean;
}
