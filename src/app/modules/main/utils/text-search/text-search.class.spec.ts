import { TextSearch } from './text-search.class';

describe('TextSearch', () => {
  const textSearch = new TextSearch();

  it('should create an instance', () => {
    expect(new TextSearch()).toBeTruthy();
  });

  it('Sigle text line, single search token.', () => {
    console.log("Sigle text line, single search token.");
    textSearch.clear();
    textSearch.add('あいうえおかきくけこさしすせそ',  {cate: 'Hiragana'})
    const result = textSearch.search('おか');
    expect(result.allTokensFound).toBeTruthy();
    expect(result.details.length).toEqual(1);
    expect(result.details[0].token).toEqual("おか");
    expect(result.details[0].parseInfo.length).toEqual(1);
    expect(result.details[0].parseInfo[0].prop).toEqual({cate: 'Hiragana'});
    expect(result.details[0].parseInfo[0].line).toEqual(0);
    expect(result.details[0].parseInfo[0].start).toEqual(4);
    expect(result.details[0].parseInfo[0].end).toEqual(6);
    expect(result.details[0].parseInfo[0].finished).toBeTruthy();
  });

  it('Single text lines, single search token. Without properties.', () => {
    console.log("Single text lines, single search token. Without properties.");
    textSearch.clear();
    textSearch.add(['あいうえお', 'かきくけこ', 'さしすせそ'])
    const result = textSearch.search('おかき');
    expect(result.allTokensFound).toBeTruthy();
    expect(result.details.length).toEqual(1);
    expect(result.details[0].token).toEqual("おかき");
    expect(result.details[0].parseInfo.length).toEqual(2);
    expect(result.details[0].parseInfo[0].line).toEqual(0);
    expect(result.details[0].parseInfo[0].start).toEqual(4);
    expect(result.details[0].parseInfo[0].end).toEqual(5);
    expect(result.details[0].parseInfo[0].finished).toBeFalsy();
    expect(result.details[0].parseInfo[1].line).toEqual(1);
    expect(result.details[0].parseInfo[1].start).toEqual(0);
    expect(result.details[0].parseInfo[1].end).toEqual(2);
    expect(result.details[0].parseInfo[1].finished).toBeTruthy();
  });

  it('Multi text elements, single search token.', () => {
    console.log("Multi text elements, single search token.");
    textSearch.clear();
    textSearch.add(['あいうえお', 'かきくけこ', 'さしすせそ'], {cate: "Hiragana"});
    textSearch.add(['アイウエオ', 'カキクケコ', 'サシスセソ'], {cate: "Katakana"});
    const result = textSearch.search('エオカキクケコサシス');
    expect(result.allTokensFound).toBeTruthy();
    expect(result.details.length).toEqual(1);
    expect(result.details[0].token).toEqual("エオカキクケコサシス");
    expect(result.details[0].parseInfo.length).toEqual(3);
    expect(result.details[0].parseInfo[0].prop).toEqual({cate: "Katakana"});
    expect(result.details[0].parseInfo[0].line).toEqual(0);
    expect(result.details[0].parseInfo[0].start).toEqual(3);
    expect(result.details[0].parseInfo[0].end).toEqual(5);
    expect(result.details[0].parseInfo[0].finished).toEqual(false);
    expect(result.details[0].parseInfo[1].prop).toEqual({cate: "Katakana"});
    expect(result.details[0].parseInfo[1].line).toEqual(1);
    expect(result.details[0].parseInfo[1].start).toEqual(0);
    expect(result.details[0].parseInfo[1].end).toEqual(5);
    expect(result.details[0].parseInfo[1].finished).toEqual(false);
    expect(result.details[0].parseInfo[2].prop).toEqual({cate: "Katakana"});
    expect(result.details[0].parseInfo[2].line).toEqual(2);
    expect(result.details[0].parseInfo[2].start).toEqual(0);
    expect(result.details[0].parseInfo[2].end).toEqual(3);
    expect(result.details[0].parseInfo[2].finished).toEqual(true);
  });

  it('Single text lines, multi search tokens. Without properties. (1)', () => {
    console.log("Single text lines, multi search tokens. Without properties. (1)");
    textSearch.clear();
    textSearch.add(['あいうえお', 'かきくけこ', 'さしすせそ'])
    const result = textSearch.search(['おかき', 'しお']);
    expect(result.allTokensFound).toEqual(false);
    expect(result.details.length).toEqual(2);
    expect(result.details[0].token).toEqual("おかき");
    expect(result.details[0].parseInfo.length).toEqual(2);
    expect(result.details[0].parseInfo[0].line).toEqual(0);
    expect(result.details[0].parseInfo[0].start).toEqual(4);
    expect(result.details[0].parseInfo[0].end).toEqual(5);
    expect(result.details[0].parseInfo[0].finished).toBeFalsy();
    expect(result.details[0].parseInfo[1].line).toEqual(1);
    expect(result.details[0].parseInfo[1].start).toEqual(0);
    expect(result.details[0].parseInfo[1].end).toEqual(2);
    expect(result.details[0].parseInfo[1].finished).toBeTruthy();
    expect(result.details[1].token).toEqual("しお");
    expect(result.details[1].parseInfo.length).toEqual(0);
  });

  it('Single text lines, multi search tokens. Without properties. (2)', () => {
    console.log('Single text lines, multi search tokens. Without properties. (2)');
    textSearch.clear();
    textSearch.add(['あいうえお', 'かきくけこ', 'さしすせそ'])
    const result = textSearch.search(['おかき', 'え']);
    expect(result.allTokensFound).toEqual(true);
    expect(result.details.length).toEqual(2);
    expect(result.details[0].token).toEqual("おかき");
    expect(result.details[0].parseInfo.length).toEqual(2);
    expect(result.details[0].parseInfo[0].line).toEqual(0);
    expect(result.details[0].parseInfo[0].start).toEqual(4);
    expect(result.details[0].parseInfo[0].end).toEqual(5);
    expect(result.details[0].parseInfo[0].finished).toBeFalsy();
    expect(result.details[0].parseInfo[1].line).toEqual(1);
    expect(result.details[0].parseInfo[1].start).toEqual(0);
    expect(result.details[0].parseInfo[1].end).toEqual(2);
    expect(result.details[0].parseInfo[1].finished).toBeTruthy();
    expect(result.details[1].token).toEqual("え");
    expect(result.details[1].parseInfo.length).toEqual(1);
    expect(result.details[1].parseInfo[0].line).toEqual(0);
    expect(result.details[1].parseInfo[0].start).toEqual(3);
    expect(result.details[1].parseInfo[0].end).toEqual(4);
    expect(result.details[1].parseInfo[0].finished).toEqual(true);
  });

  it('Multi text elements, multi search tokens.', () => {
    console.log('Multi text elements, multi search tokens.');
    textSearch.clear();
    textSearch.add(['あいうえお', 'かきくけこ', 'さしすせそ'], {cate: "Hiragana"});
    textSearch.add(['アイウエオ', 'カキクケコ', 'サシスセソ'], {cate: "Katakana"});
    const result = textSearch.search(['クケコ', 'けこさ']);
    console.log(result);
    expect(result.allTokensFound).toBeTruthy();
    expect(result.details.length).toEqual(2);
    expect(result.details[0].token).toEqual('クケコ');
    expect(result.details[0].parseInfo.length).toEqual(1);
    expect(result.details[0].parseInfo[0].prop).toEqual({cate: "Katakana"});
    expect(result.details[0].parseInfo[0].line).toEqual(1);
    expect(result.details[0].parseInfo[0].start).toEqual(2);
    expect(result.details[0].parseInfo[0].end).toEqual(5);
    expect(result.details[0].parseInfo[0].finished).toEqual(true);
    expect(result.details[1].token).toEqual('けこさ');
    expect(result.details[1].parseInfo.length).toEqual(2);
    expect(result.details[1].parseInfo[0].prop).toEqual({cate: "Hiragana"});
    expect(result.details[1].parseInfo[0].line).toEqual(1);
    expect(result.details[1].parseInfo[0].start).toEqual(3);
    expect(result.details[1].parseInfo[0].end).toEqual(5);
    expect(result.details[1].parseInfo[0].finished).toEqual(false);
    expect(result.details[1].parseInfo[1].prop).toEqual({cate: "Hiragana"});
    expect(result.details[1].parseInfo[1].line).toEqual(2);
    expect(result.details[1].parseInfo[1].start).toEqual(0);
    expect(result.details[1].parseInfo[1].end).toEqual(1);
    expect(result.details[1].parseInfo[1].finished).toEqual(true);
  });

  it('Single token detected at multi lines.', () => {
    console.log('Single token detected at multi lines.');
    textSearch.clear();
    textSearch.add(['あいあいあい', 'いあいいあい', 'あいあいいあ'], {cate: "Hiragana1"});
    textSearch.add(['いいいいあい', 'あいあいいい'], {cate: "Hiragana2"});
    const result = textSearch.search('あいあい');
    console.log(result);
    expect(result.allTokensFound).toBeTruthy();
    expect(result.details.length).toEqual(1);
    expect(result.details[0].token).toEqual('あいあい');
    expect(result.details[0].parseInfo.length).toEqual(5);
    expect(result.details[0].parseInfo[0].prop).toEqual({cate: "Hiragana1"});
    expect(result.details[0].parseInfo[0].line).toEqual(0);
    expect(result.details[0].parseInfo[0].start).toEqual(0);
    expect(result.details[0].parseInfo[0].end).toEqual(4);
    expect(result.details[0].parseInfo[0].finished).toEqual(true);
    expect(result.details[0].parseInfo[1].prop).toEqual({cate: "Hiragana1"});
    expect(result.details[0].parseInfo[1].line).toEqual(1);
    expect(result.details[0].parseInfo[1].start).toEqual(4);
    expect(result.details[0].parseInfo[1].end).toEqual(6);
    expect(result.details[0].parseInfo[1].finished).toEqual(false);
    expect(result.details[0].parseInfo[2].prop).toEqual({cate: "Hiragana1"});
    expect(result.details[0].parseInfo[2].line).toEqual(2);
    expect(result.details[0].parseInfo[2].start).toEqual(0);
    expect(result.details[0].parseInfo[2].end).toEqual(2);
    expect(result.details[0].parseInfo[2].finished).toEqual(true);
    expect(result.details[0].parseInfo[3].prop).toEqual({cate: "Hiragana2"});
    expect(result.details[0].parseInfo[3].line).toEqual(0);
    expect(result.details[0].parseInfo[3].start).toEqual(4);
    expect(result.details[0].parseInfo[3].end).toEqual(6);
    expect(result.details[0].parseInfo[3].finished).toEqual(false);
    expect(result.details[0].parseInfo[4].prop).toEqual({cate: "Hiragana2"});
    expect(result.details[0].parseInfo[4].line).toEqual(1);
    expect(result.details[0].parseInfo[4].start).toEqual(0);
    expect(result.details[0].parseInfo[4].end).toEqual(2);
    expect(result.details[0].parseInfo[4].finished).toEqual(true);
  });
});
