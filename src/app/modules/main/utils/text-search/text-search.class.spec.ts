import { TextSearch } from './text-search.class';

//==============================================================================
// TextSearch.search()
//
describe('TextSearch.search()', () => {
  const textSearch = new TextSearch();

  it('Sigle text line, single search token.', () => {
    console.log("Sigle text line, single search token.");
    textSearch.clear();
    textSearch.add('あいうえおかきくけこさしすせそ',  {cate: 'Hiragana'})
    const result = textSearch.search('おか');
    expect(result.allTokensFound).toBeTruthy();
    expect(result.details.length).toEqual(1);
    expect(result.details[0].token).toEqual("おか");
    expect(result.details[0].found).toEqual(true);
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
    expect(result.details[0].found).toEqual(true);
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
    expect(result.details[0].found).toEqual(true);
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
    expect(result.details[0].found).toEqual(true);
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
    expect(result.details[1].found).toEqual(false);
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
    expect(result.details[0].found).toEqual(true);
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
    expect(result.details[0].found).toEqual(true);
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
    expect(result.details[0].found).toEqual(true);
    expect(result.details[0].parseInfo.length).toEqual(1);
    expect(result.details[0].parseInfo[0].prop).toEqual({cate: "Katakana"});
    expect(result.details[0].parseInfo[0].line).toEqual(1);
    expect(result.details[0].parseInfo[0].start).toEqual(2);
    expect(result.details[0].parseInfo[0].end).toEqual(5);
    expect(result.details[0].parseInfo[0].finished).toEqual(true);
    expect(result.details[1].token).toEqual('けこさ');
    expect(result.details[1].found).toEqual(true);
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
    expect(result.details[0].found).toEqual(true);
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

//==============================================================================
// TextSearch.quichSearch()
//
describe('TextSearch.quichSearch()', () => {
  const textSearch = new TextSearch();

  it('Sigle text line, single search token.', () => {
    console.log("Sigle text line, single search token.");
    textSearch.clear();
    textSearch.add('あいうえおかきくけこさしすせそ',  {cate: 'Hiragana'})
    const result = textSearch.quickSearch('おか');
    expect(result.allTokensFound).toBeTruthy();
    expect(result.details.length).toEqual(1);
    expect(result.details[0].token).toEqual("おか");
    expect(result.details[0].found).toEqual(true);
    expect(result.details[0].parseInfo.length).toEqual(0);
  });

  it('Single text lines, single search token. Without properties.', () => {
    console.log("Single text lines, single search token. Without properties.");
    textSearch.clear();
    textSearch.add(['あいうえお', 'かきくけこ', 'さしすせそ'])
    const result = textSearch.quickSearch('おかき');
    expect(result.allTokensFound).toBeTruthy();
    expect(result.details.length).toEqual(1);
    expect(result.details[0].token).toEqual("おかき");
    expect(result.details[0].found).toEqual(true);
    expect(result.details[0].parseInfo.length).toEqual(0);
  });

  it('Multi text elements, single search token.', () => {
    console.log("Multi text elements, single search token.");
    textSearch.clear();
    textSearch.add(['あいうえお', 'かきくけこ', 'さしすせそ'], {cate: "Hiragana"});
    textSearch.add(['アイウエオ', 'カキクケコ', 'サシスセソ'], {cate: "Katakana"});
    const result = textSearch.quickSearch('エオカキクケコサシス');
    expect(result.allTokensFound).toBeTruthy();
    expect(result.details.length).toEqual(1);
    expect(result.details[0].token).toEqual("エオカキクケコサシス");
    expect(result.details[0].found).toEqual(true);
    expect(result.details[0].parseInfo.length).toEqual(0);
  });

  it('Single text lines, multi search tokens. Without properties. (1)', () => {
    console.log("Single text lines, multi search tokens. Without properties. (1)");
    textSearch.clear();
    textSearch.add(['あいうえお', 'かきくけこ', 'さしすせそ'])
    const result = textSearch.quickSearch(['しお', 'おかき']);
    expect(result.allTokensFound).toEqual(false);
    expect(result.details.length).toEqual(1);
    expect(result.details[0].token).toEqual("しお");
    expect(result.details[0].found).toEqual(false);
    expect(result.details[0].parseInfo.length).toEqual(0);
  });

  it('Single text lines, multi search tokens. Without properties. (2)', () => {
    console.log('Single text lines, multi search tokens. Without properties. (2)');
    textSearch.clear();
    textSearch.add(['あいうえお', 'かきくけこ', 'さしすせそ'])
    const result = textSearch.quickSearch(['おかき', 'え']);
    expect(result.allTokensFound).toEqual(true);
    expect(result.details.length).toEqual(2);
    expect(result.details[0].token).toEqual("おかき");
    expect(result.details[0].found).toEqual(true);
    expect(result.details[0].parseInfo.length).toEqual(0);
    expect(result.details[1].token).toEqual("え");
    expect(result.details[0].found).toEqual(true);
    expect(result.details[1].parseInfo.length).toEqual(0);
  });

  it('Multi text elements, multi search tokens.', () => {
    console.log('Multi text elements, multi search tokens.');
    textSearch.clear();
    textSearch.add(['あいうえお', 'かきくけこ', 'さしすせそ'], {cate: "Hiragana"});
    textSearch.add(['アイウエオ', 'カキクケコ', 'サシスセソ'], {cate: "Katakana"});
    const result = textSearch.quickSearch(['クケコ', 'けこさ']);
    console.log(result);
    expect(result.allTokensFound).toBeTruthy();
    expect(result.details.length).toEqual(2);
    expect(result.details[0].token).toEqual('クケコ');
    expect(result.details[0].found).toEqual(true);
    expect(result.details[0].parseInfo.length).toEqual(0);
    expect(result.details[1].token).toEqual('けこさ');
    expect(result.details[1].found).toEqual(true);
    expect(result.details[1].parseInfo.length).toEqual(0);
  });

  it('Single token detected at multi lines.', () => {
    console.log('Single token detected at multi lines.');
    textSearch.clear();
    textSearch.add(['あいあいあい', 'いあいいあい', 'あいあいいあ'], {cate: "Hiragana1"});
    textSearch.add(['いいいいあい', 'あいあいいい'], {cate: "Hiragana2"});
    const result = textSearch.quickSearch('あいあい');
    console.log(result);
    expect(result.allTokensFound).toBeTruthy();
    expect(result.details.length).toEqual(1);
    expect(result.details[0].token).toEqual('あいあい');
    expect(result.details[0].found).toEqual(true);
    expect(result.details[0].parseInfo.length).toEqual(0);
  });
});

describe('TextSearch (private)', () => {
  const textSearch = new TextSearch();

  //============================================================================
  // Test of private functions.
  //
  // From here, you must export private functions to test them.
  // Please comment out the 'private' key word of the target functions.
  //
  //----------------------------------------------------------------------------
  // private parseInputText(text: string): string[]
  //
  it('Normal texts separated by white spaces.', () => {
    console.log('Normal texts separated by white spaces.');
    const result = TextSearch.parseInputText("aaa bbb　ccc");
    expect(result.length).toEqual(3);
    expect(result[0]).toEqual("aaa");
    expect(result[1]).toEqual("bbb");
    expect(result[2]).toEqual("ccc");
  });

  it('Single quote texts', () => {
    console.log('Single quote texts.');
    const result = TextSearch.parseInputText("'aaa' 'bbb ccc'");
    expect(result.length).toEqual(2);
    expect(result[0]).toEqual("aaa");
    expect(result[1]).toEqual("bbb ccc");
  });

  it('Double quote texts', () => {
    console.log('Double quote texts.');
    const result = TextSearch.parseInputText('"aaa" "bbb ccc"');
    expect(result.length).toEqual(2);
    expect(result[0]).toEqual("aaa");
    expect(result[1]).toEqual("bbb ccc");
  });

  it('Mix of single and double quotes.', () => {
    console.log('Mix of single and double quotes.');
    const result = TextSearch.parseInputText("  aaa 'bbb \" ccc' \"ddd ' eee\"  ");
    expect(result.length).toEqual(3);
    expect(result[0]).toEqual("aaa");
    expect(result[1]).toEqual('bbb " ccc');
    expect(result[2]).toEqual("ddd ' eee");
  });

  it('Single char.', () => {
    console.log('Single char.');
    const result = TextSearch.parseInputText("a");
    expect(result.length).toEqual(1);
    expect(result[0]).toEqual("a");
  });

  it('Unclosed quotation.', () => {
    console.log('Unclosed quotation.');
    const result = TextSearch.parseInputText("'abc");
    expect(result.length).toEqual(1);
    expect(result[0]).toEqual("'abc");
  });

});
