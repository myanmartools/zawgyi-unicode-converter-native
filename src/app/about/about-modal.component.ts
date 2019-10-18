/**
 * @license
 * Copyright DagonMetric. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found under the LICENSE file in the root directory of this source tree.
 */

import { Component } from '@angular/core';

import { ModalController } from '@ionic/angular';

import { ConfigService } from '@dagonmetric/ng-config';

import { AboutSlideItem, AppConfig } from '../shared';

/**
 * The app about modal component.
 */
@Component({
    selector: 'app-about-modal',
    templateUrl: 'about-modal.component.html',
    styleUrls: ['about-modal.component.scss']
})
export class AboutModalComponent {
    slidesOptions = {
        initialSlide: 0,
        slidesPerView: 1,
        autoplay: true
    };

    get appName(): string {
        return this._appConfig.appName;
    }

    get appVersion(): string {
        return this._appConfig.appVersion;
    }

    get appAboutImageUrl(): string {
        return this._appConfig.appAboutImageUrl;
    }

    get aboutSlides(): AboutSlideItem[] {
        return this._appConfig.aboutSlides;
    }

    private readonly _appConfig: AppConfig;

    constructor(
        private readonly _modalController: ModalController,
        configService: ConfigService
    ) {
        this._appConfig = configService.getValue<AppConfig>('app');
    }

    dismissModal(): void {
        // tslint:disable-next-line: no-floating-promises
        this._modalController.dismiss({
            dismissed: true
        });
    }
}
