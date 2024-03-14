const americanOnly = require('./american-only.js');
const americanToBritishSpelling = require('./american-to-british-spelling.js');
const americanToBritishTitles = require("./american-to-british-titles.js")
const britishOnly = require('./british-only.js')

const reverseDict = (dict) => {
  return Object.assign(
    {},
    ...Object.entries(dict).map(([k, v]) => ({ [v]: k }))
  );
};

class Translator {
  translate(text, dict, titles, timeRegex, locale) {
    const lowerText = text.toLowerCase();
    const matches = {};

    // Match titles
    Object.entries(titles).map(([k, v]) => {
      if (lowerText.includes(k)) {
        matches[k] = v.charAt(0).toUpperCase() + v.slice(1);
      }
    });

    // Match words with spaces
    const wordsWithSpaces = Object.fromEntries(
      Object.entries(dict).filter(([k, v]) => k.includes(" "))
    );
    Object.entries(wordsWithSpaces).map(([k, v]) => {
      if (lowerText.includes(k)) {
        matches[k] = v;
      }
    });

    // Match individual words
    lowerText.match(/(\w+([-'])(\w+)?['-]?(\w+))|\w+/g).forEach((word) => {
      if (dict[word]) {
        matches[word] = dict[word];
      }
    });

    // Match time
    const matchedTimes = lowerText.match(timeRegex);
    if (matchedTimes) {
      matchedTimes.map((e) => {
        if (locale == "toBritish") {
          return (matches[e] = e.replace(":", "."));
        }
        return (matches[e] = e.replace(".", ":"));
      })
    }

    // No match
    if (Object.keys(matches).length === 0) return null;

    // Output
    console.log("matches :>> ", matches);
    const translation = this.output(text, matches);
    const highlighted = this.highlight(text, matches);

    return [translation, highlighted];
  }

  toBritishEnglish(text) {
    const dict = { ...americanOnly, ...americanToBritishSpelling };
    const titles = americanToBritishTitles;
    const timeRegex = /([1-9]|1[012]):[0-5][0-9]/g;
    const translated = this.translate(
      text,
      dict,
      titles,
      timeRegex,
      "toBritish"
    );

    if (!translated) {
      return text;
    }
    return translated;
  } 
  
  toAmericanEnglish(text) {
    const dict = { ...britishOnly, ...reverseDict(americanToBritishSpelling) };
    const titles = reverseDict(americanToBritishTitles);
    const timeRegex = /([1-9]|1[012]).[0-5][0-9]/g;
    const translated = this.translate(
      text,
      dict,
      titles,
      timeRegex,
      "toAmerican"
    );

    if (!translated) {
      return text;
    }
    return translated;
  }

  highlight(text, matches) {
    const regex = new RegExp(Object.keys(matches).join("|"), "gi");
    return text.replace(regex, (matched) => {
      return `<span class="highlight">${matches[matched.toLowerCase()]}</span>`;
    });
  }

  output(text, matches) {
    const regex = new RegExp(Object.keys(matches).join("|"), "gi");
    return text.replace(regex, (matched) => matches[matched.toLowerCase()]);
  }
}

module.exports = Translator;