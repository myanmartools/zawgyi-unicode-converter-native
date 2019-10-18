/**
 * @license
 * Copyright DagonMetric. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found under the LICENSE file in the root directory of this source tree.
 */

import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';

import { TranslitRuleAny, TranslitRuleLoader } from '@dagonmetric/ng-translit';

import { uni2zgRules, zg2uniRules } from '@myanmartools/zawgyi-unicode-translit-rules';

/**
 * Implements an static rule loader for `TranslitRuleLoader`.
 */
@Injectable()
export class ZgUniTranslitRuleLoader implements TranslitRuleLoader {
    load(ruleName: string): Observable<TranslitRuleAny> {
        if (ruleName === 'zg2uni') {
            return of(zg2uniRules);
        }

        if (ruleName === 'uni2zg') {
            return of(uni2zgRules);
        }

        return of([]);
    }
}
