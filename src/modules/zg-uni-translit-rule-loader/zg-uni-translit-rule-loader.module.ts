/**
 * @license
 * Copyright DagonMetric. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found under the LICENSE file in the root directory of this source tree.
 */

import { NgModule } from '@angular/core';

import { TRANSLIT_RULE_LOADER } from '@dagonmetric/ng-translit';

import { ZgUniTranslitRuleLoader } from './zg-uni-translit-rule-loader';

/**
 * The NGMODULE for providing `ZgUniTranslitRuleLoader`.
 */
@NgModule({
    providers: [
        {
            provide: TRANSLIT_RULE_LOADER,
            useClass: ZgUniTranslitRuleLoader
        }
    ]
})
export class ZgUniTranslitRuleLoaderModule { }
