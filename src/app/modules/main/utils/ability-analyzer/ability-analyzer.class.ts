import { AbilityAttrType, FsAbilityAttribute } from 'src/app/services/firestore-data/firestore-document.interface';

class AbilityAttrMatchPattern {
  queries: RegExp[];

  types: AbilityAttrType[] = [];

  factor: number;

  offset: number;

  index: number;

  countIndex: number;

  constructor(queries: RegExp[], types: AbilityAttrType[], index: number, factor: number = 1, offset: number = 0, countIndex: number = 0) {
    this.queries = queries;
    this.types = types;
    this.index = index;
    this.factor = factor;
    this.offset = offset;
    this.countIndex = countIndex;
  }
}

export class AbilityAnalyzer {
  private matchPatterns: AbilityAttrMatchPattern[] = [
    //
    // Attack up (percent)
    //
    new AbilityAttrMatchPattern([/。|、|ずつ|\d+秒間|一度だけ|大きく|少しだけ/g, /特殊攻撃|低下効果/g, /攻撃(?:と[^\d上下]+){0,2}が(\d+)%(?:と\d+)?上昇/g], ['AttackUpPercent'], 1), /* 攻撃が20%上昇 *//* eslint-disable-line */
    new AbilityAttrMatchPattern([/。|、|ずつ|\d+秒間|一度だけ|大きく|少しだけ/g, /特殊攻撃|低下効果/g, /攻撃(?:と[^\d上下]+){0,2}が\d+%上昇\((上限|最大)(\d+)%\)/g], ['AttackUpPercent'], 2), /* 攻撃が4%ずつ上昇(最大40%) *//* eslint-disable-line */
    new AbilityAttrMatchPattern([/。|、|ずつ|\d+秒間|一度だけ|大きく|少しだけ/g, /特殊攻撃|低下効果/g, /攻撃(?:と[^\d上下]+){0,2}が(\d+\.?\d?)倍/g], ['AttackUpPercent'], 1, 100, -100), /* 攻撃が1.2倍 *//* eslint-disable-line */
    new AbilityAttrMatchPattern([/。|、|ずつ|\d+秒間|一度だけ|大きく|少しだけ/g, /特殊攻撃|低下効果/g, /攻撃(?:と[^\d上下]+){0,2}が(\d+)%([^\d上下]+が\d*%?){1,2}に?上昇/g], ['AttackUpPercent'], 1), /* 攻撃が20%、砲弾直撃ボーナスが60%に上昇 *//* eslint-disable-line */
    new AbilityAttrMatchPattern([/。|、|ずつ|\d+秒間|一度だけ|大きく|少しだけ/g, /特殊攻撃|低下効果/g, /攻撃が[^\d]{1,6}に対して(\d+\.?\d?)倍/g], ['AttackUpPercent'], 1, 100, -100), /* 攻撃が飛行敵に対して1.2倍 *//* eslint-disable-line */
    //
    // Attack down (percent)
    //
    new AbilityAttrMatchPattern([/。|、|ずつ|\d+秒間|一度だけ|大きく|少しだけ/g, /(?:敵の|兜の|ダメージを与え|攻撃し)(?:[^\d上下]+と){0,2}攻撃(?:と[^\d上下]+){0,2}(?:が|を)(\d+)%(?:と\d+)?(?:[^\d上下]+(?:が|を)\d+%?){0,2}低下/g], ['AttackDownPercent'], 1), /* 敵の攻撃が20%、攻撃速度が10%低下 *//* eslint-disable-line */
    new AbilityAttrMatchPattern([/。|、|ずつ|\d+秒間|一度だけ|大きく|少しだけ/g, /(?:敵の|兜の|ダメージを与え|攻撃し)(?:[^\d上下]+と){0,2}攻撃(?:と[^\d上下]+){0,2}(?:が|を)\d+%低下\((?:上限|最大)(\d+)%\)/g], ['AttackDownPercent'], 1), /* 敵の攻撃が2%ずつ低下(上限10%) *//* eslint-disable-line */
    new AbilityAttrMatchPattern([/。|、|ずつ|\d+秒間|一度だけ|大きく|少しだけ/g, /(?:敵の|兜の|ダメージを与え|攻撃し)(?:[^\d上下]+と){0,2}攻撃(?:と[^\d上下]+){0,2}(?:が|を)(\d+)%[^\d]+は\d+%低下/g], ['AttackDownPercent'], 1), /* 敵の攻撃が20%、妖怪は30%低下 *//* eslint-disable-line */
    new AbilityAttrMatchPattern([/。|、|ずつ|\d+秒間|一度だけ|大きく|少しだけ/g, /(?:敵の|兜の|ダメージを与え|攻撃し)(?:[^\d上下]+と){0,2}攻撃(?:と[^\d上下]+){0,2}(?:が|を)\d+%[^\d]+は(\d+)%低下/g], ['AttackDownPercent'], 1), /* eslint-disable-line */
    new AbilityAttrMatchPattern([/。|、|ずつ|\d+秒間|一度だけ|大きく|少しだけ/g, /(?:敵の|兜の|ダメージを与え|攻撃し)[^\d上下]+(?:と[^\d上下]+){0,2}が\d+%?(?:[^\d上下]+と){0,2}攻撃(?:と[^\d上下]+){0,2}(?:が|を)(\d+)%低下/g], ['AttackDownPercent'], 1), /* 敵の与ダメージが30%、攻撃が20%低下 *//* eslint-disable-line */
    new AbilityAttrMatchPattern([/。|、|ずつ|\d+秒間|一度だけ|大きく|少しだけ/g, /(?:敵の|兜の|ダメージを与え|攻撃し)[^\d上下]+(?:と[^\d上下]+){0,2}が\d+%?低下(?:[^\d上下]+と){0,2}攻撃(?:と[^\d上下]+){0,2}(?:が|を)(\d+)%低下/g], ['AttackDownPercent'], 1), /* 敵の移動速度が60%低下攻撃が20%低下 *//* eslint-disable-line */
    //
    // Damage up (percent)
    //
    new AbilityAttrMatchPattern([/。|、|ずつ|\d+秒間|一度だけ|大きく|少しだけ/g, /低下効果/g, /(?:与ダメージ|与ダメ)(?:と[^\d上下]+){0,2}が(\d+)%(?:[^\d上下]+が\d+%?){0,2}上昇/g], ['DamageUpPercent'], 1), /* 与ダメージが20%上昇 *//* eslint-disable-line */
    new AbilityAttrMatchPattern([/。|、|ずつ|\d+秒間|一度だけ|大きく|少しだけ/g, /低下効果/g, /(?:与ダメージ|与ダメ)(?:と[^\d上下]+){0,2}が(\d+\.?\d*)倍/g], ['DamageUpPercent'], 1, 100, -100), /* 与ダメージが1.2倍 *//* eslint-disable-line */
    //
    // Taken damage up (percent)
    //
    new AbilityAttrMatchPattern([/。|、|ずつ|\d+秒間|一度だけ|大きく|少しだけ/g, /(?:敵|兜)の(?:[^\d上下]+(?:と[^\d上下]+){0,1}が\d+%?){0,2}(?:低下)?(?:被ダメージ|被ダメ)が?(\d+)%上昇/g], ['TakenDamageUpPercent'], 1), /* 敵の被ダメージが20%上昇 *//* eslint-disable-line */
    new AbilityAttrMatchPattern([/。|、|ずつ|\d+秒間|一度だけ|大きく|少しだけ/g, /(?:敵|兜)の(?:[^\d上下]+(?:と[^\d上下]+){0,1}が\d+%?){0,2}(?:低下)?(?:被ダメージ|被ダメ)が?(\d+\.?\d*)倍/g], ['TakenDamageUpPercent'], 1, 100, -100), /* 敵の被ダメージが1.2倍 *//* eslint-disable-line */
    //
    // Taken damage down (percent)
    //
    new AbilityAttrMatchPattern([/。|、|ずつ|\d+秒間|一度だけ|大きく|少しだけ/g, /(?:被ダメージ|被ダメ)(?:と[^\d上下減]+){0,2}(?:を|が)?(\d+)%(?:軽減|減少)/g], ['TakenDamageDownPercent'], 1), /* 敵の被ダメージが20%上昇 *//* eslint-disable-line */
    //
    // Sortie interval shorten (percent)
    //
    new AbilityAttrMatchPattern([/。|、|ずつ|\d+秒間|一度だけ|大きく|少しだけ/g, /再配置(?:までの|の|時の)?時間が?(\d+)%短縮/g], ['ShortSortieIntervalPercent'], 1),  /* eslint-disable-line */
    //
    // Keiryaku interval shorten (percent)
    //
    new AbilityAttrMatchPattern([/。|、|ずつ|\d+秒間|一度だけ|大きく|少しだけ/g, /計略再?使用(?:までの)?時間(?:が|を)?(\d+)%短縮/g], ['ShortKeiryakuIntervalPercent'], 1), /* eslint-disable-line */
    //
    // Range up (fixed value)
    //
    new AbilityAttrMatchPattern([/。|、|ずつ|\d+秒間|一度だけ|大きく|少しだけ/g, /低下効果/g, /射程が上昇/g], ['RangeUpFixedValue'], 0), /* 射程が上昇 *//* eslint-disable-line */
    new AbilityAttrMatchPattern([/。|、|ずつ|\d+秒間|一度だけ|大きく|少しだけ/g, /低下効果/g, /射程(?:と[^\d上下倍]+){0,2}が(?:\d+%と)?(\d+)(?:[^\d上下倍]+が\d*%?){0,2}上昇/g], ['RangeUpFixedValue'], 1), /* 射程が40上昇 *//* eslint-disable-line */
    //
    // Range up (percent)
    //
    new AbilityAttrMatchPattern([/。|、|ずつ|\d+秒間|一度だけ|大きく|少しだけ/g, /回復射程/g, /射程(?:と[^\d上下]+){0,2}が(\d+)%(?:と\d+)?(?:[^\d上下]+が\d*%?){0,2}上昇/g], ['RangeUpPercent'], 1), /* 射程が40%上昇 *//* eslint-disable-line */
    new AbilityAttrMatchPattern([/。|、|ずつ|\d+秒間|一度だけ|大きく|少しだけ/g, /回復射程/g, /射程(?:と[^\d上下]+){0,2}が(\d+\.?\d*)倍/g], ['RangeUpPercent'], 1, 100, -100), /* 射程が2倍 *//* eslint-disable-line */
    //
    // HideShiromusume
    //
    new AbilityAttrMatchPattern([/。|、|ずつ|\d+秒間|一度だけ|大きく|少しだけ/g, /(?:城娘|対象|自身)(?:と[^\d上下短倍]+){0,2}が敵から狙われ(?:ない|なくなる|ず)/g], ['HideShiromusume'], 0), /* eslint-disable-line */
    new AbilityAttrMatchPattern([/。|、|ずつ|\d+秒間|一度だけ|大きく|少しだけ/g, /再配置時敵から狙われ(?:ない|なくなる|ず)/g], ['HideShiromusume'], 0), /* eslint-disable-line */
    new AbilityAttrMatchPattern([/。|、|ずつ|\d+秒間|一度だけ|大きく|少しだけ/g, /(?:城娘|対象|自身)の(?:[^\d上下]+が(?:\d+\.?\d*倍|\d*%?上昇|半減|敵の防御を\d*%?無視)し?){0,2}敵から狙われ(?:ない|なくなる|ず)/g], ['HideShiromusume'], 0 ), /* eslint-disable-line */
    new AbilityAttrMatchPattern([/。|、|ずつ|\d+秒間|一度だけ|大きく|少しだけ/g, /敵から狙われ(?:ない|なくなる|ず).*\(.*(?:自分のみ|城娘(\/伏兵)?(\/蔵)?が対象)/g], ['HideShiromusume'], 0), /* eslint-disable-line */
    new AbilityAttrMatchPattern([/。|、|ずつ|\d+秒間|一度だけ|大きく|少しだけ/g, /^[^伏兵蔵]*敵から狙われ(?:ない|なくなる|ず)[^伏兵蔵]*$/g], ['HideShiromusume'], 0), /* eslint-disable-line */
    new AbilityAttrMatchPattern([/。|、|ずつ|\d+秒間|一度だけ|大きく|少しだけ/g, /自身は攻撃を行わず敵から狙われ(?:ない|なくなる|ず)/g], ['HideShiromusume'], 0), /* eslint-disable-line */
    //
    // Hide token.
    //
    new AbilityAttrMatchPattern([/。|、|ずつ|\d+秒間|一度だけ|大きく|少しだけ/g, /敵(?:から|に)狙われず.+伏兵を配置/g], ['HideToken'], 0), /* eslint-disable-line */
    new AbilityAttrMatchPattern([/。|、|ずつ|\d+秒間|一度だけ|大きく|少しだけ/g, /敵(?:から|に)狙われ(?:ない|なくなる|ず).*\(.*伏兵(\/蔵)?が対象/g], ['HideToken'], 0), /* eslint-disable-line */
    new AbilityAttrMatchPattern([/。|、|ずつ|\d+秒間|一度だけ|大きく|少しだけ/g, /伏兵(?:と蔵)?が敵(?:から|に)狙われ(?:ない|なくなる|ず)/g], ['HideToken'], 0), /* eslint-disable-line */
    new AbilityAttrMatchPattern([/。|、|ずつ|\d+秒間|一度だけ|大きく|少しだけ/g, /伏兵(?:と蔵)?が敵の攻撃対象になら(?:ない|なくなる|ず)/g], ['HideToken'], 0), /* eslint-disable-line */
    new AbilityAttrMatchPattern([/。|、|ずつ|\d+秒間|一度だけ|大きく|少しだけ/g, /敵(?:から|に)狙われず.+(?:最も近い対象を攻撃させる|後退させる)伏兵/g], ['HideToken'], 0), /* eslint-disable-line */
    new AbilityAttrMatchPattern([/。|、|ずつ|\d+秒間|一度だけ|大きく|少しだけ/g, /伏兵をランダムで配置.*敵(?:から|に)狙われ(?:ない|なくなる|ず)/g], ['HideToken'], 0), /* eslint-disable-line */
    //
    // Hide wherehouse
    //
    new AbilityAttrMatchPattern([/。|、|ずつ|\d+秒間|一度だけ|大きく|少しだけ/g, /蔵(?:と伏兵)?が敵から狙われ(?:ない|なくなる|ず)/g], ['HideWarehouse'], 0), /* eslint-disable-line */
    new AbilityAttrMatchPattern([/。|、|ずつ|\d+秒間|一度だけ|大きく|少しだけ/g, /敵から狙われ(?:ない|なくなる|ず).*\(.*蔵が対象/g], ['HideWarehouse'], 0), /* eslint-disable-line */
    //
    // Map weapon (fire)
    //
    new AbilityAttrMatchPattern([/。|、|ずつ|\d+秒間|一度だけ|大きく|少しだけ/g, /【火属性】範囲内の敵に攻撃の(\d\.?\d*)倍の?ダメージ/g], ['MapWeapon', "MapWeaponFire"], 1, 100), /* eslint-disable-line */
    new AbilityAttrMatchPattern([/。|、|ずつ|\d+秒間|一度だけ|大きく|少しだけ/g, /【火属性】範囲内の敵に攻撃の(\d\.?\d*)倍の?ダメージを(\d)連続で与え/g], ['MapWeapon', "MapWeaponFire"], 1, 100, 0, 2), /* eslint-disable-line */
    //
    // Map weapon (thunder)
    //
    new AbilityAttrMatchPattern([/。|、|ずつ|\d+秒間|一度だけ|大きく|少しだけ/g, /【雷属性】範囲内の敵に攻撃の(\d\.?\d*)倍の?術ダメージ/g], ['MapWeapon', "MapWeaponThunder"], 1, 100), /* eslint-disable-line */
    new AbilityAttrMatchPattern([/。|、|ずつ|\d+秒間|一度だけ|大きく|少しだけ/g, /【雷属性】範囲内の敵に攻撃の(\d\.?\d*)倍の?術ダメージを(\d)連続で与え/g], ['MapWeapon', "MapWeaponThunder"], 1, 100, 0, 2), /* eslint-disable-line */
    //
    // Map weapon (wind)
    //
    new AbilityAttrMatchPattern([/。|、|ずつ|\d+秒間|一度だけ|大きく|少しだけ/g, /^範囲内の敵に攻撃の(\d\.?\d*)倍の?ダメージを与え(?:敵を)?(?:劇的に)?後退させる/g], ['MapWeapon', "MapWeaponWind"], 1, 100), /* eslint-disable-line */
    //
    // Map weapon (ice)
    //
    new AbilityAttrMatchPattern([/。|、|ずつ|\d+秒間|一度だけ|大きく|少しだけ/g, /^範囲内の敵に攻撃の(\d\.?\d*)倍の?術ダメージを与え「氷結」にする/g], ['MapWeapon', "MapWeaponIce"], 1, 100), /* eslint-disable-line */
    //
    // Map weapon (water)
    //
    new AbilityAttrMatchPattern([/。|、|ずつ|\d+秒間|一度だけ|大きく|少しだけ/g, /^範囲内の敵に攻撃の(\d\.?\d*)倍の?ダメージを与え後退させ移動速度(?:を|が)(?:\d+%)?低下/g], ['MapWeapon', "MapWeaponWater"], 1, 100), /* eslint-disable-line */
    //
    // Map weapon (rock)
    //
    new AbilityAttrMatchPattern([/。|、|ずつ|\d+秒間|一度だけ|大きく|少しだけ/g, /^範囲内の敵に攻撃の(\d\.?\d*)倍の?ダメージを与え移動速度(?:を|が)(?:\d+%)?低下/g], ['MapWeapon', "MapWeaponRock"], 1, 100), /* eslint-disable-line */
    //
    // Map weapon (poison)
    //
    new AbilityAttrMatchPattern([/。|、|ずつ|\d+秒間|一度だけ|大きく|少しだけ/g, /^範囲内の敵に攻撃の(\d\.?\d*)倍の?ダメージを与え「猛毒」にする/g], ['MapWeapon', "MapWeaponPoison"], 1, 100), /* eslint-disable-line */
    //
    // Map weapon (seal)
    //
    new AbilityAttrMatchPattern([/。|、|ずつ|\d+秒間|一度だけ|大きく|少しだけ/g, /^範囲内の敵の動きを封じる/g], ['MapWeapon', "MapWeaponSeal"], 0), /* eslint-disable-line */
    new AbilityAttrMatchPattern([/。|、|ずつ|\d+秒間|一度だけ|大きく|少しだけ/g, /^範囲内の敵に攻撃の(\d\.?\d*)倍の?ダメージを与え(?:敵の)?動きを封じる/g], ['MapWeapon', "MapWeaponSeal"], 1, 100), /* eslint-disable-line */
    new AbilityAttrMatchPattern([/。|、|ずつ|\d+秒間|一度だけ|大きく|少しだけ/g, /属性】範囲内の敵に攻撃の(\d\.?\d*)倍の?術?ダメージを与え(?:敵の)?動きを封じる/g], ['MapWeapon', "MapWeaponSeal"], 1, 100), /* eslint-disable-line */
    //
    // Map weapon (others)
    //
    new AbilityAttrMatchPattern([/範囲内の敵に5種の効果を与える\(範囲:特大\)①1.5倍ダメ②(\d\.?\d*)倍ダメ/g], ['MapWeapon', "MapWeaponOthers"], 1, 100, 150), /* eslint-disable-line */
    new AbilityAttrMatchPattern([/。|、|ずつ|\d+秒間|一度だけ|大きく|少しだけ/g, /^範囲内の敵に攻撃の(\d\.?\d*)倍の?ダメージを与え(?:攻撃|攻撃速度|防御|射程|攻撃後の隙)が\d+%(?:低下|延長)/g], ['MapWeapon', "MapWeaponOthers"], 1, 100), /* eslint-disable-line */
    new AbilityAttrMatchPattern([/。|、|ずつ|\d+秒間|一度だけ|大きく|少しだけ/g, /^範囲内の敵に攻撃の(\d\.?\d*)倍の?ダメージを与え(?:攻撃|攻撃速度|防御|射程)と(?:攻撃|攻撃速度|防御|射程|移動速度)が\d+%低下/g], ['MapWeapon', "MapWeaponOthers"], 1, 100), /* eslint-disable-line */
    new AbilityAttrMatchPattern([/。|、|ずつ|\d+秒間|一度だけ|大きく|少しだけ/g, /^範囲内の敵に攻撃の(\d\.?\d*)倍の?ダメージを与え(?:殿と)?城娘(?:と伏兵)?を攻撃の\d\.?\d*倍で回復/g], ['MapWeapon', "MapWeaponOthers"], 1, 100), /* eslint-disable-line */
  ];

  analyze(descriptions: string[]): FsAbilityAttribute[] {
    let result: FsAbilityAttribute[] = [];

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

  private matchAnalyzePattern(description: string): FsAbilityAttribute[] {
    let result: FsAbilityAttribute[] = [];

    // Apply all patterns to the input description.
    for (let i = 0; i < this.matchPatterns.length; ++i) {
      const pattern = this.matchPatterns[i];
      let text = description;
      let value = 0;

      for (let j = 0; j < pattern.queries.length; ++j) {
        if (j + 1 < pattern.queries.length) {
          // Remove noisy text.
          text = text.replace(pattern.queries[j], '');
        } else {
          // Match query.
          const matchObj = text.matchAll(pattern.queries[j]);
          const matches = Array.from(matchObj); // Convert RegExp object to array.
          for (let k = 0; k < matches.length; ++k) {
            if (pattern.index === 0) {
              value = 0; // Set 0 as value if the index is 0.
            } else {
              // Set calculated value.
              value = Math.round(Number(matches[k][pattern.index]) * pattern.factor) + pattern.offset;
              value = pattern.countIndex === 0 ? value : value * Number(matches[k][pattern.countIndex]);
            }
            // Register attribute info.
            for (let l = 0; l < pattern.types.length; ++l) {
              result.push(new FsAbilityAttribute(pattern.types[l], value, false));
            }
          }
        }
      }
    }

    return result;
  }

  private slimDownMatchedResult(attrList: FsAbilityAttribute[]): FsAbilityAttribute[] {
    let result: FsAbilityAttribute[] = [];

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
