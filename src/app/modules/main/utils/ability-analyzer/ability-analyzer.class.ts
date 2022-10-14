import { AbilityAttrType } from 'src/app/services/firestore-data/firestore-document.interface';

class AbilityAttrMatchPattern {
  queries: RegExp[];

  type: AbilityAttrType;

  factor: number;

  offset: number;

  index: number;

  constructor(queries: RegExp[], type: AbilityAttrType, index: number, factor: number = 1, offset: number = 0) {
    this.queries = queries;
    this.type = type;
    this.index = index;
    this.factor = factor;
    this.offset = offset;
  }
}

export class AbilityAttr {
  type: AbilityAttrType;

  value: number;

  isStepEffect: boolean;

  debug: string;

  constructor(type: AbilityAttrType, value = 0, isStepEffect = false, debug = '') {
    this.type = type;
    this.value = value;
    this.isStepEffect = isStepEffect;
    this.debug = debug;
  }
}

export class AbilityAnalyzer {
  private matchPatterns: AbilityAttrMatchPattern[] = [
    //
    // Attack up (percent)
    //
    new AbilityAttrMatchPattern([/ずつ/g, /攻撃が(\d+)%上昇/g], 'AttackUpRate', 1), /* 攻撃が20%上昇 *//* eslint-disable-line */
    new AbilityAttrMatchPattern([/ずつ/g, /攻撃が\d+%上昇\((上限|最大)(\d+)%\)/g], 'AttackUpRate', 2), /* 攻撃が4%ずつ上昇(最大40%) *//* eslint-disable-line */
    new AbilityAttrMatchPattern([/特殊攻撃が/g, /攻撃が(\d+.?\d?)倍/g], 'AttackUpRate', 1, 100, -100), /* 攻撃が1.2倍 *//* eslint-disable-line */
    new AbilityAttrMatchPattern([/特殊攻撃が/g, /攻撃が[^\d]{1,6}に対して(\d+.?\d?)倍/g], 'AttackUpRate', 1, 100, -100), /* 攻撃が飛行敵に対して1.2倍 *//* eslint-disable-line */
    new AbilityAttrMatchPattern([/攻撃が(\d+)%と\d+上昇/g], 'AttackUpRate', 1), /* 攻撃が20%と10上昇 *//* eslint-disable-line */
    new AbilityAttrMatchPattern([/ずつ/g, /攻撃と[^上昇\d]+が(\d+)%上昇/g], 'AttackUpRate', 1), /* 攻撃と耐久が20%上昇 *//* eslint-disable-line */
    new AbilityAttrMatchPattern([/ずつ/g, /攻撃と[^上昇\d]+が\d+%上昇\((上限|最大)(\d+)%\)/g], 'AttackUpRate', 2), /* 攻撃と耐久が4%ずつ上昇(最大40%) *//* eslint-disable-line */
    new AbilityAttrMatchPattern([/ずつ/g, /攻撃と[^上昇\d]+が(\d+.?\d?)倍/g], 'AttackUpRate', 1, 100, -100), /* 攻撃と耐久が1.2倍 *//* eslint-disable-line */
    new AbilityAttrMatchPattern([/攻撃と[^上昇\d]+が(\d+)%と\d+上昇/g], 'AttackUpRate', 1), /* 攻撃と耐久が20%と50上昇 *//* eslint-disable-line */
    new AbilityAttrMatchPattern([/低下効果/g, /大きく/g, /攻撃が(\d+)%[^上昇低下]*が\d*%?に?上昇/g], 'AttackUpRate', 1), /* 攻撃が20%、砲弾直撃ボーナスが60%に上昇 *//* eslint-disable-line */
    new AbilityAttrMatchPattern([/低下効果/g, /大きく/g, /攻撃と[^上昇\d]+が(\d+)%[^上昇低下]+が\d*%?に?上昇/g], 'AttackUpRate', 1), /* 攻撃と耐久が20%、防御が10%上昇 *//* eslint-disable-line */
    //
    // Attack down (percent)
    //
    new AbilityAttrMatchPattern([/\d+秒間/g, /ずつ/g, /(敵|兜)の攻撃(が|を)(\d+)%低下/g], 'AttackDownRate', 3), /* 敵の攻撃が20%低下 *//* eslint-disable-line */
    new AbilityAttrMatchPattern([/\d+秒間/g, /ずつ/g, /(敵|兜)の攻撃(が|を)\d+%低下\((上限|最大)(\d+)%\)/g], 'AttackDownRate', 4), /* 敵の攻撃が2%ずつ低下(上限10%) *//* eslint-disable-line */
    new AbilityAttrMatchPattern([/\d+秒間/g, /(敵|兜)の攻撃(が|を)(\d+)%と\d+低下/g], 'AttackDownRate', 3), /* 敵の攻撃が20%と20低下 *//* eslint-disable-line */
    new AbilityAttrMatchPattern([/\d+秒間/g, /(敵|兜)の攻撃(が|を)(\d+)%[^\d]+は\d+%低下/g], 'AttackDownRate', 3), /* 敵の攻撃が20%、妖怪は30%低下 *//* eslint-disable-line */
    new AbilityAttrMatchPattern([/\d+秒間/g, /(敵|兜)の攻撃(が|を)\d+%[^\d]+は(\d+)%低下/g], 'AttackDownRate', 3), /* eslint-disable-line */
    new AbilityAttrMatchPattern([/\d+秒間/g, /ずつ/g, /(敵|兜)の攻撃と[^\d]+(が|を)(\d+)%低下/g], 'AttackDownRate', 3), /* 敵の攻撃と移動速度が20%低下 *//* eslint-disable-line */
    new AbilityAttrMatchPattern([/\d+秒間/g, /ずつ/g, /(敵|兜)の攻撃と[^\d]+(が|を)\d+%低下\((上限|最大)(\d+)%\)/g], 'AttackDownRate', 4), // eslint-disable-line
    new AbilityAttrMatchPattern([/\d+秒間/g, /(敵|兜)の攻撃と[^\d]+(が|を)(\d+)%と\d+低下/g], 'AttackDownRate', 3), /* 敵の攻撃と移動速度が20%と100低下 *//* eslint-disable-line */
    new AbilityAttrMatchPattern([/\d+秒間/g, /(敵|兜)の攻撃が(\d+)%[^\d]+が\d+%低下/g], 'AttackDownRate', 2), /* 敵の攻撃が20%、攻撃速度が10%低下 *//* eslint-disable-line */
    new AbilityAttrMatchPattern([/\d+秒間/g, /(敵|兜)の攻撃が(\d+)%と\d+[^\d]+が\d+%低下/g], 'AttackDownRate', 2), /* 敵の攻撃が5%と20、攻撃速度が10%低下 *//* eslint-disable-line */
    new AbilityAttrMatchPattern([/(敵|兜)の攻撃と[^\d]+(が|を)(\d+)%[^\d]+は\d+%低下/g], 'AttackDownRate', 3), /* 敵の攻撃と射程が25%、妖怪は35%低下 *//* eslint-disable-line */
    new AbilityAttrMatchPattern([/(敵|兜)の攻撃と[^\d]+(が|を)\d+%[^\d]+は(\d+)%低下/g], 'AttackDownRate', 3), /* eslint-disable-line */
    new AbilityAttrMatchPattern([/\d+秒間/g, /ダメージを与え、?攻撃(が|を)(\d+)%低下/g], 'AttackDownRate', 2), /* ダメージを与え攻撃が20%低下 *//* eslint-disable-line */
    new AbilityAttrMatchPattern([/\d+秒間/g, /ダメージを与え、?攻撃と[^\d]+(が|を)(\d+)%低下/g], 'AttackDownRate', 2), /* ダメージを与え攻撃と移動速度が20%低下 *//* eslint-disable-line */
    new AbilityAttrMatchPattern([/\d+秒間/g, /攻撃し、?攻撃(が|を)(\d+)%低下させ/g], 'AttackDownRate', 2), /* 攻撃し攻撃を20%低下させる *//* eslint-disable-line */
    new AbilityAttrMatchPattern([/\d+秒間/g, /攻撃し、?攻撃と[^\d]+(が|を)(\d+)%低下/g], 'AttackDownRate', 2), /* 攻撃し攻撃と攻撃速度を20%低下させる *//* eslint-disable-line */
    new AbilityAttrMatchPattern([/\d+秒間/g, /(敵|兜)の[^\d]+が\d+%?、?攻撃(が|を)(\d+)%低下/g], 'AttackDownRate', 3), /* 敵の与ダメージが30%、攻撃が20%低下 *//* eslint-disable-line */
    new AbilityAttrMatchPattern([/\d+秒間/g, /(敵|兜)の[^\d]+が\d+%?低下、?攻撃(が|を)(\d+)%低下/g], 'AttackDownRate', 3), /* 敵の移動速度が60%低下攻撃が20%低下 *//* eslint-disable-line */
    new AbilityAttrMatchPattern([/\d+秒間/g, /(敵|兜)の[^\d]+が\d+%?、?攻撃と[^\d]+(が|を)(\d+)%低下/g], 'AttackDownRate', 3), /* 敵の与ダメージが30%、攻撃と防御が20%低下 *//* eslint-disable-line */
    new AbilityAttrMatchPattern([/\d+秒間/g, /(敵|兜)の攻撃と[^\d]+(が|を)(\d+)%[^\d]+(が|を)\d+%?低下/g], 'AttackDownRate', 3), /* 敵の攻撃と防御が25%移動速度が25%低下 *//* eslint-disable-line */
    //
    // Damage up (percent)
    //
    new AbilityAttrMatchPattern([/\d+秒間/g, /ずつ/g, /(与ダメージ|与ダメ)が(\d+)%上昇/g], 'DamageUpRate', 2), /* 与ダメージが20%上昇 *//* eslint-disable-line */
    new AbilityAttrMatchPattern([/\d+秒間/g, /ずつ/g, /(与ダメージ|与ダメ)が(\d+)倍/g], 'DamageUpRate', 2, 100, -100), /* 与ダメージが1.2倍 *//* eslint-disable-line */
    new AbilityAttrMatchPattern([/\d+秒間/g, /ずつ/g, /(与ダメージ|与ダメ)が(\d+)%[^\d上昇低下]+が\d+%?上昇/g], 'DamageUpRate', 2), /* 与ダメージが20%防御が20上昇 *//* eslint-disable-line */
    new AbilityAttrMatchPattern([/\d+秒間/g, /ずつ/g, /(与ダメージ|与ダメ)と[^\d上昇低下]+が(\d+)%上昇/g], 'DamageUpRate', 2), /* 与ダメージと防御が20%上昇 *//* eslint-disable-line */
    new AbilityAttrMatchPattern([/\d+秒間/g, /ずつ/g, /(与ダメージ|与ダメ)が(\d+)%[^\d上昇低下]+が\d+%?[^\d上昇低下]+が\d+%?上昇/g], 'DamageUpRate', 2), /* 与ダメージが7%近接城娘の射程が10、遠隔城娘の攻撃が50上昇 *//* eslint-disable-line */
  ];

  analyze(descriptions: string[]): AbilityAttr[] {
    let result: AbilityAttr[] = [];

    // Join description text lines to one text.
    const description = descriptions.join('');

    // Split the description text by step effect description or not.
    const textLines = this.splitDescriptionTextByStepEffect(description);

    // Apply all patterns to the input description.
    for (let i = 0; i < textLines.length; ++i) {
      const tmpArray = this.matchAnalyzePattern(textLines[i].text);
      // Update step effect flag.
      for (let j = 0; j < tmpArray.length; ++j) {
        tmpArray[j].isStepEffect = textLines[i].isStepEffect;
      }
      result = result.concat(tmpArray);
    }

    // Remove attribute info items with small value.
    result = this.slimDownMatchedResult(result);

    return result;
  }

  //============================================================================
  // Private functions.
  //
  private splitDescriptionTextByStepEffect(description: string): { text: string; isStepEffect: boolean }[] {
    let result: { text: string; isStepEffect: boolean }[] = [];

    const tmp = description.split('巨大化する度に');

    // CASE: Not step effect.
    if (tmp.length === 1) {
      return [{ text: tmp[0], isStepEffect: false }];
    }

    // Text before the key word is not step effect description.
    if (tmp[0] !== '') {
      result.push({ text: tmp[0], isStepEffect: false });
    }

    // If step effect is detected, it looks for end of the step effect.
    const tmp2 = tmp[1].split(/最大化時|【水上】/g);
    result.push({ text: tmp2[0], isStepEffect: true });
    for (let i = 1; i < tmp2.length; ++i) {
      result.push({ text: tmp2[i], isStepEffect: false });
    }

    return result;
  }

  private matchAnalyzePattern(description: string): AbilityAttr[] {
    let result: AbilityAttr[] = [];

    // Apply all patterns to the input description.
    for (let i = 0; i < this.matchPatterns.length; ++i) {
      const pattern = this.matchPatterns[i];
      let text = description;

      for (let j = 0; j < pattern.queries.length; ++j) {
        if (j + 1 < pattern.queries.length) {
          // Remove noisy text.
          text = text.replace(pattern.queries[j], '');
        } else {
          // Match query.
          const matchObj = text.matchAll(pattern.queries[j]);
          const matches = Array.from(matchObj);
          for (let k = 0; k < matches.length; ++k) {
            const value = Math.round(Number(matches[k][pattern.index]) * pattern.factor) + pattern.offset;
            result.push(new AbilityAttr(pattern.type, value, false, matches[k][0]));
          }
        }
      }
    }

    return result;
  }

  private slimDownMatchedResult(attrList: AbilityAttr[]): AbilityAttr[] {
    let result: AbilityAttr[] = [];

    // Sort descending order.
    // Priority: Type >> isStepEffect >> Value
    attrList.sort((a, b) => {
      return a.type < b.type ? -1 : 1;
    });
    attrList.sort((a, b) => {
      if (a.type === b.type) {
        if (a.isStepEffect === b.isStepEffect) {
          return 0;
        } else {
          return a.isStepEffect ? -1 : 1;
        }
      } else {
        return 0;
      }
    });
    attrList.sort((a, b) => {
      if (a.type === b.type && a.isStepEffect === b.isStepEffect) {
        return b.value - a.value;
      } else {
        return 0;
      }
    });

    // Make new list.
    if (attrList.length > 0) {
      result.push(attrList[0]);

      for (let i = 1; i < attrList.length; ++i) {
        if (attrList[i - 1].type !== attrList[i].type) {
          result.push(attrList[i]);
        }
      }
    }

    return result;
  }
}
