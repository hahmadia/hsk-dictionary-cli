import Papa from 'papaparse'

export default {
  _cedictData: [],
  _hskData: [],
  _merged: [],
  _cedictFile: 'data/cedict_ts.u8.txt',
  _hskCSV: 'data/HSK 1-6 Vocabulary/HSK Standard Course 1-6-Table 1.csv',
  _hskFields: {
    hskId: 'Id',
    simplified: 'Simplified',
    traditional: 'Traditional',
    pinyin: 'Pinyin',
    definitions: 'English',
    book: 'Book',
    hsk: 'HSK',
    lesson: 'Lesson',
    dialog: 'Dialog',
    nw: 'NW',
    example: 'Example',
    exampleTranslation: 'Translation',
    oofc: 'OofC',
    pn: 'PN'
  },
  f() {
    // CEDICT.parsePinyinInCEDICTFIle(function(parsed) {
    //   console.log(parsed)
    //   window.parsed = parsed
    // })
  },
  loadHSK(callback) {
    Papa.parse(this._hskCSV, {
      download: true,
      header: true,
      complete: results => {
        for (let row of results.data) {
          var result = {}
          for (var index in this._hskFields) {
            result[index] = row[this._hskFields[index]]
          }
          result.index = 0
          Object.freeze(result)
          this._hskData.push(result)
        }
        callback()
      }
    })
  },
  lookupSimplified(simplified, pinyin = false) {
    const candidates = this._cedictData
      .filter(row => {
        let pinyinMatch = true
        if (pinyin.length > 0) {
          pinyinMatch = row.pinyin === pinyin
        }
        return pinyinMatch && row.simplified === simplified
      })
      .sort((a, b) => {
        return b.definitions.length - a.definitions.length // More definitions = longer definition = likely more common word
      })
    return candidates
  },
  parsePinyin(pinyin) {
    return pinyinify(pinyin.replace(/u:/gi, 'ü')) // use the pinyinify library to parse tones
      .replace(/\d/g, '') // pinyinify does not handle 'r5', we remove all digits
  },
  loadCEDICT(callback) {
    let xhttp = new XMLHttpRequest()
    let that = this
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        that.loadCEDICTData(this.responseText, callback)
      }
    }
    xhttp.open('GET', this._cedictFile, true) // Use .txt extension so gzip will work with it
    xhttp.setRequestHeader('Cache-Control', 'max-age=3600')
    xhttp.send()
  },
  loadCEDICTData(cedictText, callback) {
    let same = {
      traditional: undefined,
      pinyin: undefined
    }
    for (let line of cedictText.split('\n')) {
      if (!line.startsWith('#')) {
        line = line.replace(/\[.+?\]/g, m => this.parsePinyin(m))
        const matches = line.match(/^([^\s]+) ([^\s]+) \[(.+)\] \/(.*)\//)
        if (matches) {
          let row = {
            simplified: matches[2],
            traditional: matches[1],
            pinyin: matches[3],
            definitions: matches[4],
            index: 0 // for homonyms
          }
          if (
            row.traditional === same.traditional &&
            row.pinyin === same.pinyin
          ) {
            row.index++
          } else {
            same = {
              traditional: row.traditional,
              pinyin: row.pinyin
            }
          }
          Object.freeze(row)
          if (row) this._cedictData.push(row)
        }
      }
    }
    this._cedictData = this._cedictData.sort(function(a, b) {
      return b.simplified.length - a.simplified.length
    })
    callback()
  },
  getHSK(simplified, pinyin) {
    return this._hskData.filter(function(row) {
      return (
        row.simplified === simplified &&
        row.pinyin.toLowerCase() === pinyin.toLowerCase()
      )
    })
  },
  assignHSK(cedictWord) {
    const hskWords = this.getHSK(cedictWord.simplified, cedictWord.pinyin)
    if (hskWords.length > 0) {
      const hskWord = Object.assign({}, hskWords[0])
      const result = Object.assign(hskWord, cedictWord)
      return result
    } else {
      let emptyHSKWord = {}
      for (let field in this._hskFields) {
        emptyHSKWord[field] = ''
      }
      emptyHSKWord.hsk = 'outside'
      const result = Object.assign(emptyHSKWord, cedictWord)
      return result
    }
  },
  download(filename, text) {
    var element = document.createElement('a')
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(text)
    )
    element.setAttribute('download', filename)

    element.style.display = 'none'
    document.body.appendChild(element)

    element.click()

    document.body.removeChild(element)
  },
  findHSKNotInCEDICT() {
    return this._hskData.filter(
      h => !this._cedictData.find(c => c.simplified === h.simplified)
    )
  },
  merge() {
    console.log('Merging...')
    this._merged = []
    for (let row of this._cedictData) {
      this._merged.push(this.assignHSK(row))
    }
    this._merged = this._merged.concat(this.findHSKNotInCEDICT())
    console.log('Merged, generating CSV...')
    window.csv = Papa.unparse(this._merged)
    console.log(
      'CSV ready. Type `copy(csv)` in the console to copy to clipboard.'
    )
  }
}
