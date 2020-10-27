/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed, async } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { AlertController, MenuController, ModalController, Platform, ToastController } from '@ionic/angular';

import { Clipboard } from '@ionic-native/clipboard/ngx';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { HeaderColor } from '@ionic-native/header-color/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { WebIntent } from '@ionic-native/web-intent/ngx';

import { LogModule } from '@dagonmetric/ng-log';
import { TranslitModule } from '@dagonmetric/ng-translit';
import { ZawgyiDetectorModule } from '@myanmartools/ng-zawgyi-detector';

import { CdkTextareaSyncSizeModule } from '../modules/cdk-extensions';
import { ZgUniTranslitRuleLoaderModule } from '../modules/zg-uni-translit-rule-loader';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
    // let platformSpy: any;

    let alertControllerSpy: any;
    let clipboardSpy: any;
    let firebaseXSpy: any;
    let headerColorSpy: any;
    let menuControllerSpy: any;
    let modalControllerSpy: any;
    let nativeStorageSpy: any;
    let socialSharingSpy: any;
    let splashScreenSpy: any;
    let statusBarSpy: any;
    let toastControllerSpy: any;
    let webIntentSpy: any;

    beforeEach(async(() => {
        // platformSpy = jasmine.createSpyObj('Platform', {
        //     ready: Promise.resolve(),
        //     is: () => {
        //         return false;
        //     }
        // });

        clipboardSpy = jasmine.createSpyObj('Clipboard', ['copy']);
        firebaseXSpy = jasmine.createSpyObj('FirebaseX', ['fetch', 'activateFetched', 'getValue']);
        headerColorSpy = jasmine.createSpyObj('HeaderColor', ['tint']);

        alertControllerSpy = jasmine.createSpyObj('AlertController', ['create']);
        menuControllerSpy = jasmine.createSpyObj('MenuController', ['toggle', 'isOpen', 'close']);
        modalControllerSpy = jasmine.createSpyObj('ModalController', ['create', 'getTop', 'dismiss']);
        nativeStorageSpy = jasmine.createSpyObj('NativeStorage', ['setItem', 'getItem']);
        socialSharingSpy = jasmine.createSpyObj('SocialSharing', ['shareWithOptions']);
        splashScreenSpy = jasmine.createSpyObj('SplashScreen', ['hide']);
        statusBarSpy = jasmine.createSpyObj('StatusBar', ['styleLightContent', 'backgroundColorByHexString']);
        toastControllerSpy = jasmine.createSpyObj('ToastController', ['create']);
        webIntentSpy = jasmine.createSpyObj('WebIntent', [
            'unregisterBroadcastReceiver',
            'registerBroadcastReceiver',
            'getIntent'
        ]);

        void TestBed.configureTestingModule({
            declarations: [AppComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            imports: [
                CommonModule,
                FormsModule,
                NoopAnimationsModule,

                CdkTextareaSyncSizeModule,
                MatFormFieldModule,
                MatInputModule,
                LogModule,
                TranslitModule,
                ZgUniTranslitRuleLoaderModule,
                ZawgyiDetectorModule
            ],
            providers: [
                Platform,
                { provide: Clipboard, useValue: clipboardSpy },
                { provide: FirebaseX, useValue: firebaseXSpy },
                { provide: HeaderColor, useValue: headerColorSpy },
                { provide: AlertController, useValue: alertControllerSpy },
                { provide: MenuController, useValue: menuControllerSpy },
                { provide: ModalController, useValue: modalControllerSpy },
                { provide: NativeStorage, useValue: nativeStorageSpy },
                { provide: SocialSharing, useValue: socialSharingSpy },
                { provide: SplashScreen, useValue: splashScreenSpy },
                { provide: StatusBar, useValue: statusBarSpy },
                { provide: ToastController, useValue: toastControllerSpy },
                { provide: WebIntent, useValue: webIntentSpy }
            ]
        }).compileComponents();
    }));

    it('should create the app', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.debugElement.componentInstance;
        void expect(app).toBeTruthy();
    });
});
