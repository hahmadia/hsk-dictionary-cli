import Config from '@/lib/config'

export default {
  limit: location.hash.replace('#', ''), // #perpage/page
  getLrcsWithoutYouTube(youtubeVue) {
    let url = Config.lrcServer + 'lrc/listnoyoutube/'
    if (this.limit) {
      url = url + this.limit
    }
    $.getJSON(url, function(result) {
      youtubeVue.lrcs = result
    })
  },
  searchYouTubeByProxy(searchTerm, callback) {
    $.ajax(
      Config.lrcServer +
        'proxy.php?' +
        'https://www.youtube.com/results?search_query=' +
        searchTerm
    ).done(function(response) {
      var videoIds = []
      // We use 'ownerDocument' so we don't load the images and scripts!
      // https://stackoverflow.com/questions/15113910/jquery-parse-html-without-loading-images
      var ownerDocument = document.implementation.createHTMLDocument('virtual')
      let $html = $(response, ownerDocument)
      $html.find('.item-section li .yt-uix-tile-link').each(function() {
        if (
          !$(this)
            .attr('href')
            .includes('/channel/') &&
          !$(this)
            .attr('href')
            .includes('/user/')
        ) {
          videoIds.push(
            $(this)
              .attr('href')
              .replace('/watch?v=', '')
              .replace(/&list=.*/, '')
          )
        }
      })
      callback(videoIds)
    })
  }
}
