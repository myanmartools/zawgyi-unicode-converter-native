/**
 * @license
 * Copyright DagonMetric. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found under the LICENSE file in the root directory of this source tree.
 */

import { Component, Input } from '@angular/core';

import { ModalController } from '@ionic/angular';

import { Clipboard } from '@ionic-native/clipboard/ngx';

import { AppLog } from './app-log';

/**
 * The app debug log modal component.
 */
@Component({
    selector: 'app-logs-modal',
    templateUrl: 'app-logs-modal.component.html',
    styleUrls: ['app-logs-modal.component.scss']
})
export class AppLogsModalComponent {
    @Input()
    appLogs: AppLog[] = [];

    constructor(private readonly _modalController: ModalController, private readonly _clipboard: Clipboard) {}

    async copyData(data: unknown): Promise<Promise<void>> {
        await this._clipboard.clear();
        await this._clipboard.copy(typeof data === 'string' ? data : JSON.stringify(data));
    }

    dismissModal(): void {
        void this._modalController.dismiss({
            dismissed: true
        });
    }
}
