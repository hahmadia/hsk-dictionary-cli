import $ from 'jquery'

export default {
  /**
   * Add tooltips with the jQuery UI Tooltip component.
   */

  addTooltips(selectorOrNode = false, templateFilterFunction = false) {
    window.AnnotatorTooltip = this
    let nodes = []
    if (typeof selectorOrNode === 'object') {
      nodes = [selectorOrNode]
    } else {
      nodes = $(selectorOrNode).get()
    }
    for (let node of nodes) {
      const wordBlocks = $(node)
        .find('.word-block[data-candidates]')
        .get()
      for (let block of wordBlocks) {
        Tipped.create(block, this.tooltipTemplate(templateFilterFunction), {
          position: 'bottomleft',
          maxWidth: 300,
          minWith: 150,
          close: true
        })
      }
    }
  },

  addHighlightingEventListener() {
    $('.word-block-simplified')
      .off('click')
      .on('click', function() {
        $(this)
          .parent()
          .toggleClass('mand-highlight')
      })
    $('.word-block-traditional')
      .off('click')
      .on('click', function() {
        $(this)
          .parent()
          .toggleClass('mand-highlight')
      })
  },

  speak(text) {
    window.speechSynthesis.cancel()
    var utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'zh-CN'
    window.speechSynthesis.speak(utterance)
    utterance.onend = function() {
      //
    }
  },

  tooltipTemplate(templateFilterFunction = false) {
    return function() {
      let s = $(this).attr('data-candidates')
      if (s) {
        var candidates = JSON.parse(unescape(s))
        var html = ''
        for (let candidate of candidates) {
          var $definitionsList = $(
            `<ol class="tooltip-entry-definitions"></ol>`
          )
          for (let definition of candidate.definitions) {
            $definitionsList.append(
              `<li class="tooltip-entry-definition">${definition.text}</li>`
            )
          }
          html += `
          <div class="tooltip-entry">
            <span class="tooltip-entry-character">${candidate.simplified} (${
            candidate.traditional
          })</span>
            <span class="tooltip-entry-pinyin">${candidate.pinyin}</span>
            <button onclick="window.AnnotatorTooltip.speak('${
              candidate.simplified
            }');  return false" class="btn speak"><i class="glyphicon glyphicon-volume-up"></i></button>
            ${$definitionsList.html()}
          </div>`
        }
        if (templateFilterFunction) {
          html = templateFilterFunction(candidates, this, html)
        }
        return html
      }
    }
  }
}