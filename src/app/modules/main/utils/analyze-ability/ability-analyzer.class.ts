import { AbilityAttrType } from 'src/app/services/firestore-data/firestore-document.interface';

export class AbilityAttrMatchPattern {
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

  debug: string;

  constructor(type: AbilityAttrType, value = 0, debug = '') {
    this.type = type;
    this.value = value;
    this.debug = debug;
  }
}

export class AbilityAnalyzer {
  private matchPatterns: AbilityAttrMatchPattern[] = [
    // Attack up (percent)
    new AbilityAttrMatchPattern([/ずつ/g, /攻撃が(\d+)%上昇/g], 'AttackUpRate', 1), // 攻撃が20%上昇
    new AbilityAttrMatchPattern([/ずつ/g, /攻撃が\d+%上昇\((上限|最大)(\d+)%\)/g], 'AttackUpRate', 2), // 攻撃が4%ずつ上昇(最大40%)
    new AbilityAttrMatchPattern([/特殊攻撃が/g, /攻撃が(\d+.?\d?)倍/g], 'AttackUpRate', 1, 100, -100), // 攻撃が1.2倍
    new AbilityAttrMatchPattern([/特殊攻撃が/g, /攻撃が[^\d]{1,6}に対して(\d+.?\d?)倍/g], 'AttackUpRate', 1, 100, -100), // 攻撃が飛行敵に対して1.2倍
    new AbilityAttrMatchPattern([/攻撃が(\d+)%と\d+上昇/g], 'AttackUpRate', 1), // 攻撃が20%と10上昇
    new AbilityAttrMatchPattern([/ずつ/g, /攻撃と[^上昇\d]+が(\d+)%上昇/g], 'AttackUpRate', 1), // 攻撃と耐久が20%上昇
    new AbilityAttrMatchPattern([/ずつ/g, /攻撃と[^上昇\d]+が\d+%上昇\((上限|最大)(\d+)%\)/g], 'AttackUpRate', 2), // 攻撃と耐久が4%ずつ上昇(最大40%)
    new AbilityAttrMatchPattern([/ずつ/g, /攻撃と[^上昇\d]+が(\d+.?\d?)倍/g], 'AttackUpRate', 1, 100, -100), // 攻撃と耐久が1.2倍
    new AbilityAttrMatchPattern([/攻撃と[^上昇\d]+が(\d+)%と\d+上昇/g], 'AttackUpRate', 1), // 攻撃と耐久が20%と50上昇
    new AbilityAttrMatchPattern([/低下効果/g, /大きく/g, /攻撃が(\d+)%[^上昇低下]*が\d*%?に?上昇/g], 'AttackUpRate', 1), // 攻撃が20%、砲弾直撃ボーナスが60%に上昇
    // 攻撃と耐久が20%、防御が10%上昇
    new AbilityAttrMatchPattern([/低下効果/g, /大きく/g, /攻撃と[^上昇\d]+が(\d+)%[^上昇低下]+が\d*%?に?上昇/g], 'AttackUpRate', 1), // eslint-disable-line
  ];

  analyze(descriptions: string[]): AbilityAttr[] {
    let result: AbilityAttr[] = [];
    const description = descriptions.join('');

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
            result.push(new AbilityAttr(pattern.type, value, matches[k][0]));
          }
        }
      }
    }

    // Remove attribute info items with small value.
    result = this.slimDownMatchedResult(result);

    return result;
  }

  //============================================================================
  // Private functions.
  //
  private slimDownMatchedResult(attrList: AbilityAttr[]): AbilityAttr[] {
    let result: AbilityAttr[] = [];

    // Sort descending order.
    attrList.sort((a, b) => {
      if (a.type === b.type) {
        return b.value - a.value;
      } else {
        return a.type < b.type ? -1 : 1;
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
