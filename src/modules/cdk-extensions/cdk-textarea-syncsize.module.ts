/**
 * @license
 * Copyright DagonMetric. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found under the LICENSE file in the root directory of this source tree.
 */

import { NgModule } from '@angular/core';

import { PlatformModule } from '@angular/cdk/platform';
import { CdkTextareaSyncSize } from './cdk-textarea-syncsize';

/**
 * The `NGMODULE` for `CdkTextareaSyncSize`.
 */
@NgModule({
    declarations: [CdkTextareaSyncSize],
    imports: [PlatformModule],
    exports: [CdkTextareaSyncSize]
})
export class CdkTextareaSyncSizeModule {}
