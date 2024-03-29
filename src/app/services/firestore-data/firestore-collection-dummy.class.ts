import { FsCollectionName } from './firestore-collection-name.enum';
import { FsAbilityType, FsDocumentBase, FsFacilityType, FsGeographType, FsRegion, FsWeaponType } from './firestore-document.interface';

export const fsAbilityTypesData: FsAbilityType[] = [
  new FsAbilityType('aaDP1APcLDh2z7ud3NTk', '特技', 0, false),
  new FsAbilityType('SrxjSPsy2StCIJxegVaz', '所持特技', 1, false),
  new FsAbilityType('fZGsWgRvgqfMKqhLoBnR', '編成特技', 2, false),
  new FsAbilityType('sFtaxbe7qsqYi6zG9Z7i', '大破特技', 3, false),
  new FsAbilityType('OAdc5b0je3Vj7KXVJead', '特殊攻撃', 4, false),
  new FsAbilityType('SAjy7mRqgvygHGIwgtVd', '特殊能力', 5, false),
  new FsAbilityType('yjHNuIylWnqEf634dKJO', '計略', 6, true),
];

export const fsFacilityTypesData: FsFacilityType[] = [
  new FsFacilityType('D6c1aVvv95lY6t17Z7GU', '門', '10'),
  new FsFacilityType('Bu0pOdQFrCtossZEytt5', '堀', '20'),
  new FsFacilityType('BOIQQrrYfCrtO2sSuxSI', '石垣', '30'),
  new FsFacilityType('vDXFd9C69qn885ewm0Er', '狭間', '40'),
  new FsFacilityType('oz46QIcwqMhs2oc470jq', '水源', '50'),
  new FsFacilityType('HmZz704dSOrTnHfDdobk', '鯱', '60'),
  new FsFacilityType('2H9ng9xgKi0Aqf9wjUpU', '祠', '70'),
  new FsFacilityType('CYPss2w1x4ySmLZM7E0A', '櫓', '80'),
  new FsFacilityType('9it3h7N2WZ4jO4baF6mb', '鎧兜', '90'),
  new FsFacilityType('6DRdfYcfLAIA7I5O3iw6', '茶室', 'a0'),
  new FsFacilityType('1LAgW3EfErboi4QXiecY', '庭園', 'b0'),
  new FsFacilityType('BDDsmsB8crZegjz3LmXh', 'その他', 'c0'),
];

export const fsGeographTypesData: FsGeographType[] = [
  new FsGeographType('jwVwcTpFGZEX6gs2CIzk', '平', 0),
  new FsGeographType('mm3IgpQv10joXnzcLDrL', '平山', 1),
  new FsGeographType('XnmWwozEZq0XHQZiHc3e', '山', 2),
  new FsGeographType('VYGXee7r1IPbCJDutHdH', '水', 3),
  new FsGeographType('W1O0A66Py290kW3U2rt2', '地獄', 4),
  new FsGeographType('7C3a8Xmi4Rm4P63hqNqd', '無', 5),
];

export const fsRegionsData: FsRegion[] = [
  new FsRegion('ytdAg5aMsotJibbGl55d', '北海道', 0),
  new FsRegion('artSw2oFvtG8WTLLQWz5', '東北', 1),
  new FsRegion('0PPO4R7U40z1C2iesEvG', '関東', 2),
  new FsRegion('flS7EeeyyhpWHUoknPjt', '甲信越', 3),
  new FsRegion('QddmSiTZDOe9iz1uqIhk', '北陸', 4),
  new FsRegion('PUrgTW9QNMDKi5xjlFRd', '東海', 5),
  new FsRegion('85Zk51jUw5et8Q5PY4Zp', '近畿', 6),
  new FsRegion('GWUCpIivjH0PDWMYc7m0', '中国', 7),
  new FsRegion('XY9tZG44wmi1xsaB7dRy', '四国', 8),
  new FsRegion('zEsvfn7A8tQ7JPuy1qb4', '九州', 9),
  new FsRegion('lkWlRJBr9MI1A5TXpb8x', '沖縄', 10),
  new FsRegion('cXcXK9nak9lRoNKlr4xQ', '海外', 11),
  new FsRegion('L5QnJjHYOOhK0GQ8R74K', 'その他', 12),
  new FsRegion('1q5CKzAKw5lpExsqQaEu', '異界', 13),
];

export const fsWeaponTypesData: FsWeaponType[] = [
  new FsWeaponType('1wGftjRoKQzrKOeGtZfA', '刀', '10', 9, false),
  new FsWeaponType('2Q0Sif1Pw6ZY01vn1k2D', '槍', '18', 5, false),
  new FsWeaponType('HBisp7cxePmzQw8TX8Ht', '槌', '20', 12, false),
  new FsWeaponType('XofM155jFukqT2zqitGd', '盾', '28', 10, false),
  new FsWeaponType('Ixx50qWCFJXpwOA2tYuU', '拳', '30', 8, true),
  new FsWeaponType('WFDdQigBv9CcNRZ1uNMy', '鎌', '38', 7, false),
  new FsWeaponType('etlFdgGjvjt3sB5Y6Rh3', '戦棍', '40', 11, false),
  new FsWeaponType('cuzYjgLosqW5gA9QQsfs', '双剣', '48', 9, false),
  new FsWeaponType('XM8s1LyTERwVd8gUzxL0', '弓', '50', 7, false),
  new FsWeaponType('EFXxN79Rk7zMO556PK35', '石弓', '58', 9, false),
  new FsWeaponType('2FcXLBVzpHH6pATuPIhE', '鉄砲', '60', 11, false),
  new FsWeaponType('wGRMf9PJW8eqEnL2wn6P', '大砲', '68', 13, false),
  new FsWeaponType('ZMl8E60quJJ6FLmwqEuL', '歌舞', '70', 10, true),
  new FsWeaponType('2iEN6Oea4i15WVLlFd8r', '法術', '78', 10, false),
  new FsWeaponType('byV7Yfpn0p2RjplZaetc', '鈴', '80', 8, true),
  new FsWeaponType('JEnNDTAnQvxV3bP3xuGc', '杖', '88', 10, true),
  new FsWeaponType('1P1sjWuXKDGQelMDbiyP', '祓串', '90', 9, true),
  new FsWeaponType('KbBAVH0AUR64qOcPwert', '本', '98', 10, true),
  new FsWeaponType('VSUcK8pUwcfo2X86EtqQ', '投剣', 'a0', 9, false),
  new FsWeaponType('XrpFg0UmTbJ8JRPo7bsy', '鞭', 'a8', 8, false),
  new FsWeaponType('gpkcXm50DdpkhRRFH9OY', '陣貝', 'b0', 12, false),
  new FsWeaponType('Z6o0nE1PP4FdB52YTECz', '軍船', 'b4', 15, false),
  new FsWeaponType('7SOJv751A3AkKeHjO3RT', '神娘', 'e0', 99, false),
  new FsWeaponType('L4FpZNz6GuDE98CJWgr7', 'その他', 'f0', 99, true),
];

export class FirestoreCollectionDummy<T extends FsDocumentBase> {
  data: FsDocumentBase[];

  isLoaded: boolean;

  isListening: boolean;

  constructor(private name: FsCollectionName) {
    this.data = [];
    this.isLoaded = false;
    this.isListening = false;

    if (name === FsCollectionName.AbilityTypes) {
      this.data = fsAbilityTypesData;
      this.isLoaded = true;
    } else if (name === FsCollectionName.FacilityTypes) {
      this.data = fsFacilityTypesData;
      this.isLoaded = true;
    } else if (name === FsCollectionName.GeographTypes) {
      this.data = fsGeographTypesData;
      this.isLoaded = true;
    } else if (name === FsCollectionName.Regions) {
      this.data = fsRegionsData;
      this.isLoaded = true;
    } else if (name === FsCollectionName.WeaponTypes) {
      this.data = fsWeaponTypesData;
      this.isLoaded = true;
    }
  }

  /**
   * It loads data from server once. (not subscribing.)
   * Offline cache will NOT used.
   * @returns Promise<number>. Data length.
   */
  async load(): Promise<number> {
    return this.data.length;
  }

  /**
   * Add new document to the collection.
   * ID will be assigned automatically.
   * @param data Target data.
   * @param uid User ID. It's original user ID stored in Users collection as 'name' field.
   * @returns Promise<string>. New document ID.
   */
  async add(data: T, uid: string): Promise<string> {  // eslint-disable-line
    return '';
  }

  /**
   * It update target data document.
   * It push input data to the specified field which is list type.
   * @param docId Document ID.
   * @param fieldName Target field name.
   * @param value Data to be pushed to the target list field.
   * @param uid User ID. It's original user ID stored in Users collection as 'name' field.
   * @returns Document ID.
   */
  async updateField(docId: string, fieldName: string, value: any, uid: string): Promise<string> { // eslint-disable-line
    return docId;
  }

  /**
   * It adds an new data field to the specified data document.
   * @param docId Document ID.
   * @param fieldName Field name to be added to the document.
   * @param value Default value.
   * @param uid User ID who does this operation.
   * @returns Document ID.
   */
  async addField(docId: string, fieldName: string, value: any, uid: string): Promise<string> { // eslint-disable-line
    return docId;
  }

  /**
   * Increment the 'count' field value.
   * @param docId Document ID.
   * @param uid User ID. It's original user ID stored in Users collection as 'name' field.
   * @returns Counter value after increment.
   */
  async incrementCounter(docId: string, uid: string): Promise<number> { // eslint-disable-line
    return 0;
  }

  async delete(docId: string): Promise<void> {} // eslint-disable-line
}
