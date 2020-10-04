import { AppConfig } from './app-config';

export const appSettings: AppConfig = {
    appName: 'Zawgyi Unicode Converter',
    appVersion: '3.7.0',
    appThemeColor: '#8764B8',
    storeAppUrlInfo: {
        android: 'market://details?id=com.dagonmetric.zawgyiunicodeconverter'
    },
    navLinks: [
        {
            url: 'https://myanmartools.org',
            label: 'Explore Myanmar Tools',
            iconName: 'logo-myanmartools-24'
        },
        {
            url: 'https://www.facebook.com/DagonMetric',
            label: 'Posts on Facebook',
            iconName: 'logo-facebook-24'
        },
        {
            url: 'https://www.youtube.com/channel/UCbJLAOU-kG6vkBOU1TSM5Cw',
            label: 'Videos on YouTube',
            iconName: 'logo-youtube-24'
        },
        {
            url: 'https://github.com/myanmartools/zawgyi-unicode-converter-native',
            label: 'Source code on GitHub',
            iconName: 'logo-github-24'
        }
    ],
    socialSharing: {
        subject: 'Zawgyi Unicode Converter app you may also like',
        message:
            'ဇော်ဂျီ ယူနီကုဒ် ဖတ်မရတဲ့ အခက်အခဲရှိနေသူများအတွက် ဇော်ဂျီကနေ ယူနီကုဒ်၊ ယူနီကုဒ်ကနေ ဇော်ဂျီ အပြန်အလှန် အလိုအလျောက် ပြောင်းပေးတဲ့ app တစ်ခု မျှဝေလိုက်ပါတယ်။',
        linkUrl: 'https://myanmartools.org/apps/zawgyi-unicode-converter'
    },
    privacyUrl: 'https://privacy.dagonmetric.com/privacy-statement'
};
