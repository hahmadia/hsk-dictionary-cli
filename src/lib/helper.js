import countries from './countries.js'
import $ from 'jquery'
import Annotator from '@/vendor/annotator-js/js/annotator'
import AnnotatorTooltip from '@/vendor/annotator-js/js/annotator-tooltip'
import Helper from '@/lib/helper'
import Normalizer from '@/lib/normalizer'

export default {
  loaderMessages: [],
  lastId: 0,
  uniqueId() {
    this.lastId += 1
    return this.lastId
  },
  isChinese(text) {
    return text.match(
      // eslint-disable-next-line no-irregular-whitespace
      /[\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u3005\u3007\u3021-\u3029\u3038-\u303B‌​\u3400-\u4DB5\u4E00-\u9FCC\uF900-\uFA6D\uFA70-\uFAD9]+/g
    )
  },
  scrape(url, callback) {
    $.ajax('proxy.php?' + url).done(function(response) {
      // We use 'ownerDocument' so we don't load the images and scripts!
      // https://stackoverflow.com/questions/15113910/jquery-parse-html-without-loading-images
      var ownerDocument = document.implementation.createHTMLDocument('virtual')
      var $html = $(response.data, ownerDocument)
      callback($html, response.data)
    })
  },
  highlight(text, word, level) {
    if (text) {
      return text.replace(
        word,
        '<span data-hsk="' + level + '">' + word + '</span>'
      )
    }
  },
  showPinyinClick(e) {
    const selector = $(e.target).attr('data-target-selector')
    $(selector).addClass('add-pinyin show-pinyin show-simplified') // Soo it will have the pinyin looks
    $(e.target).text('Loading...')
    // eslint-disable-next-line no-undef
    new Annotator(CEDICT).annotateBySelector(`${selector}`, function() {
      if (!$(e.target).attr('data-keep')) {
        $(e.target).remove()
      }
      Helper.augmentAnnotatedBlocks(selector)
    })
  },
  f(candidate) {
    if (candidate.id) {
      location.hash = `#view/hsk/${candidate.id}`
    } else {
      location.hash = `#view/cedict/${candidate.traditional}`
    }
  },
  saved(candidate) {
    return window.hskDictionaryApp.$store.getters.hasSavedWord({
      traditional: candidate.traditional,
      pinyin: candidate.pinyin
    })
  },
  addSaved(candidate) {
    window.hskDictionaryApp.$store.dispatch('addSavedWord', {
      traditional: candidate.traditional,
      pinyin: candidate.pinyin
    })
  },
  removeSaved(candidate) {
    window.hskDictionaryApp.$store.dispatch('removeSavedWord', {
      traditional: candidate.traditional,
      pinyin: candidate.pinyin
    })
  },
  augmentAnnotatedBlocks(selector) {
    $(selector + ' .word-block[data-candidates]').each(function() {
      const candidates = JSON.parse(unescape($(this).attr('data-candidates')))
      if (candidates) {
        let book = 'outside'
        for (let candidate of candidates) {
          const saved = Helper.saved(candidate)
          candidate = Normalizer.normalize(candidate)
          if (candidate.book !== 'outside') book = candidate.book
          if (saved) $(this).addClass('saved')
        }
        $(this).attr('data-hover-hsk', book)
        $(this).attr('data-candidates', JSON.stringify(candidates))
      }
      $(this).click(function() {
        const candidates = JSON.parse(unescape($(this).attr('data-candidates')))
        if (candidates && candidates.length > 0) {
          if ($(this).hasClass('saved')) {
            Helper.removeSaved(candidates[0])
          } else {
            Helper.addSaved(candidates[0])
          }
        }
      })
    })
    AnnotatorTooltip.addTooltips(selector, function(candidates) {
      let html = ''
      for (let candidate of candidates) {
        var $definitionsList = $(`<ol class="tooltip-entry-definitions"></ol>`)
        for (let definition of candidate.definitions) {
          $definitionsList.append(
            `<li class="tooltip-entry-definition">${definition.text}</li>`
          )
        }
        const traditionalHtml =
          candidate.simplified != candidate.traditional
            ? ` (${candidate.traditional})`
            : ''
        html += `
        <div class="tooltip-entry">
          <a class="tooltip-entry-character" href="#view/cedict/${
            candidate.traditional
          },${candidate.pinyin}')}"><span data-hsk="${candidate.book}">${
          candidate.simplified
        }</span>${traditionalHtml}</a>
          <span class="tooltip-entry-pinyin">${candidate.pinyin}</span>
          <button onclick="AnnotatorTooltip.speak('${
            candidate.simplified
          }');  return false" class="btn speak"><i class="glyphicon glyphicon-volume-up"></i></button>
          ${$definitionsList.html()}
        </div>`
      }
      return html
    })
  },
  showMoreClick(e) {
    var $button = $(e.currentTarget)
    $button.siblings('[data-collapse-target]').toggleClass('collapsed')
    $button.toggleClass('collapsed')
  },
  unique(names) {
    var uniqueNames = []
    $.each(names, function(i, el) {
      if ($.inArray(el, uniqueNames) === -1) uniqueNames.push(el)
    })
    return uniqueNames
  },
  country(code) {
    for (let country of countries) {
      if (country.code === code) {
        return country
      }
    }
  },
  randomArrayItem(array, start = 0, length = false) {
    length = length || array.length
    array = array.slice(start, length)
    let index = Math.floor(Math.random() * array.length)
    return array[index]
  },
  loaderMessage(message) {
    this.loaderMessages.push(message)
    console.log('loaderMessage()', message)
    if (this.loaderMessages.length > 4) {
      $('.loading-messages').html(
        `<b>10 more beats...</b><br>It gets faster next time.`
      )
    } else {
      $('.loading-messages').html(`${message}`)
    }
  },
  ucFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }
}
