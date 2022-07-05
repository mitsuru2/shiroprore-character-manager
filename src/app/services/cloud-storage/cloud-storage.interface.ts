/**
 * Character image types.
 */
export interface CsCharacterImageType {
  type: string;
  label: string;
}

export const csCharacterImageTypes: CsCharacterImageType[] = [
  { type: 'shiromusume', label: '城娘' },
  { type: 'ojou', label: '御嬢' },
  { type: 'tokugi', label: '特技' },
  { type: 'taiha', label: '大破' },
];

export const CsCharacterImageTypeMax = csCharacterImageTypes.length;
