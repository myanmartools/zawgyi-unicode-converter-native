import { AppConfig } from './app-config';

export const appSettings: AppConfig = {
    appName: 'Zawgyi Unicode Converter',
    appVersion: '4.0.2',
    appThemeColor: '#8764B8',
    storeAppUrlInfo: {
        android: 'market://details?id=com.dagonmetric.zawgyiunicodeconverter'
    },
    navLinks: [
        {
            url: 'https://myanmartools.org',
            label: 'အခြားမြန်မာဆော့ဖ်ဝဲကိရိယာများ',
            iconName: 'logo-myanmartools-24'
        },
        {
            url: 'https://www.facebook.com/DagonMetric',
            label: 'ကျွန်ုပ်တို့၏ Facebook စာမျက်နှာ',
            iconName: 'logo-facebook-24'
        },
        {
            url: 'https://www.youtube.com/channel/UCbJLAOU-kG6vkBOU1TSM5Cw',
            label: 'ကျွန်ုပ်တို့၏ YouTube ချန်နယ်',
            iconName: 'logo-youtube-24'
        },
        {
            url: 'https://github.com/myanmartools/zawgyi-unicode-converter-native',
            label: 'GitHub တွင် Code ရယူရန်',
            iconName: 'logo-github-24'
        }
    ],
    socialSharing: {
        subject: 'Zawgyi Unicode Converter app you may also like',
        message:
            'ဇော်ဂျီ ယူနီကုတ် ဖတ်မရတဲ့ အခက်အခဲရှိနေသူများအတွက် ဇော်ဂျီကနေ ယူနီကုတ်၊ ယူနီကုတ်ကနေ ဇော်ဂျီ အပြန်အလှန် အလိုအလျောက် ပြောင်းပေးတဲ့ app တစ်ခု မျှဝေလိုက်ပါတယ်။',
        linkUrl: 'https://myanmartools.org/apps/zawgyi-unicode-converter'
    },
    privacyUrl: 'https://privacy.dagonmetric.com/privacy-statement'
};
