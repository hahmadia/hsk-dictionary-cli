import Helper from '@/lib/helper'

export default {
  sources: [
    {
      host: 'www.51shucheng.com',
      name: '无忧书城 51shucheng.com',
      logo: 'https://www.51shucheng.net/images/logo.png',
      async getBooklist(url) {
        let $html = await Helper.scrape2(url)
        let list = []
        for (let a of $html.find('.zuojia table a')) {
          list.push({
            title: $(a).text(),
            url: $(a).attr('href')
          })
        }
        return list
      },
      async getBook(url) {
        let $html = await Helper.scrape2(url)
        let book = {
          url: url,
          title: $html.find('.catalog h1').text(),
          author: $html.find('.info a:nth-of-type(2)').attr('title'),
          category: $html.find('.info a:first-of-type').attr('title'),
          chapters: []
        }
        for (let a of $html.find('.mulu-list a')) {
          book.chapters.push({
            title: $(a).attr('title'),
            url: $(a).attr('href')
          })
        }
        return book
      },
      async getChapter(url) {
        let $html = await Helper.scrape2(url)
        let chapter = {
          title: $html.find('h1').text(),
          content: $html.find('.neirong').html(),
          book: {
            url: $html.find('.info a').attr('href'),
            title: $html.find('.info a').attr('title'),
            author: undefined,
            thumbnail: undefined,
            chapters: []
          }
        }
        chapter.book = await this.getBook(chapter.book.url)
        return chapter
      }
    },
    {
      host: 'www.51shucheng.net',
      name: '无忧书城 51shucheng.net',
      logo: 'https://www.51shucheng.net/images/logo.png',
      async getBooklist(url) {
        let $html = await Helper.scrape2(url)
        let list = []
        for (let a of $html.find('.zuojia table a, .mulu-list a')) {
          list.push({
            title: $(a).text(),
            url: $(a).attr('href')
          })
        }
        return list
      },
      async getBook(url) {
        let $html = await Helper.scrape2(url)
        let book = {
          url: url,
          title: $html.find('.catalog h1').text(),
          author: $html.find('.info a:nth-of-type(2)').attr('title'),
          category: $html.find('.info a:first-of-type').attr('title'),
          chapters: []
        }
        for (let a of $html.find('.mulu-list a')) {
          book.chapters.push({
            title: $(a).attr('title'),
            url: $(a).attr('href')
          })
        }
        return book
      },
      async getChapter(url) {
        let $html = await Helper.scrape2(url)
        let chapter = {
          title: $html.find('h1').text(),
          content: $html.find('.neirong').html(),
          book: {
            url: $html.find('.info a').attr('href'),
            title: $html.find('.info a').attr('title'),
            author: undefined,
            thumbnail: undefined,
            chapters: []
          }
        }
        chapter.book = await this.getBook(chapter.book.url)
        return chapter
      }
    },
    {
      host: 'zh.wikisource.org',
      name: 'Wikisource',
      logo:
        'https://zh.wikisource.org/static/images/project-logos/zhwikisource-2x.png',
      async getBook(url) {
        let $bookHTML = await Helper.scrape2(url)
        $bookHTML.find('.sisitem').remove()
        let chapters = []
        for (let a of $bookHTML.find('.mw-parser-output li a')) {
          chapters.push({
            title: $(a).text(),
            url: Helper.absoluteURL(url, decodeURIComponent($(a).attr('href')))
          })
        }
        let as = $bookHTML.find(
          '#headerContainer > table:first-child td:nth-child(3) a'
        )
        return {
          url: url,
          title: $bookHTML.find('#firstHeading').text(),
          author: $(as[as.length - 1]).text(),
          thumbnail: '',
          chapters
        }
      },
      async getChapter(url) {
        let $chapterHTML = await Helper.scrape2(url)
        let as = $chapterHTML.find(
          '#headerContainer > table:first-child td:nth-child(3) a'
        )
        let book = {
          title: $chapterHTML.find('.subpages a').text(),
          author: $(as[as.length - 1]).text(),
          thumbnail: '',
          chapters: []
        }
        const bookPath = $chapterHTML.find('.subpages a').attr('href')
        if (bookPath) {
          const bookURL = 'https://zh.wikisource.org' + bookPath
          book = await this.getBook(bookURL)
          book.url = bookURL
        }
        $chapterHTML.find('.mw-parser-output > table:first-of-type').remove()
        $chapterHTML.find('.mw-editsection').remove()
        $chapterHTML.find('#headerContainer').remove()
        $chapterHTML.find('#toc').remove()
        $chapterHTML
          .find('*')
          .contents()
          .each(function() {
            if (this.nodeType === Node.COMMENT_NODE) {
              $(this).remove()
            }
          })
        return {
          title: $chapterHTML
            .find('#firstHeading')
            .text()
            .trim(),
          content: $chapterHTML.find('.mw-parser-output').html(),
          book: book
        }
      },
      async getBooklist(url) {
        let $html = await Helper.scrape2(url)
        $html
          .find('.mw-parser-output > p:first-child, #toc, .mw-editsection')
          .remove()
        let list = []
        for (let a of $html.find(
          '.mw-parser-output li a:first-of-type:not(.new)'
        )) {
          list.push({
            url: 'https://zh.wikisource.org' + $(a).attr('href'),
            title: $(a)
              .text()
              .trim()
          })
        }
        return list
      }
    },
    {
      host: 'www.luoxia.com',
      name: 'Luoxia 落霞小说',
      logo: 'https://www.luoxia.com/theme/img/logo.svg',
      async getBook(url) {
        let $bookHTML = await Helper.scrape2(url)
        let book = {
          title: $bookHTML
            .find('.book-describe h1')
            .text()
            .trim(),
          author: $bookHTML
            .find('.book-describe h1 + p')
            .text()
            .trim()
            .replace('作者：', ''),
          thumbnail: $bookHTML.find('.book-img img').attr('src'),
          chapters: []
        }
        for (let a of $bookHTML.find('.book-list a')) {
          book.chapters.push({
            title: $(a).attr('title'),
            url: $(a).attr('href')
          })
        }
        return book
      },
      async getChapter(url) {
        let $chapterHTML = await Helper.scrape2(url)
        let chapter = {
          title: $chapterHTML
            .find('#nr_title')
            .text()
            .trim(),
          content: $chapterHTML.find('#nr1').html()
        }
        this.chapters = []
        let bookURL = url.replace(/[^/]*$/, '')
        chapter.book = await this.getBook(bookURL)
        return chapter
      },
      async getBooklist(url) {
        let $html = await Helper.scrape2(url)
        let list = []
        if (url === 'https://www.luoxia.com/') {
          for (let a of $html.find('.hot-book a')) {
            list.push({
              url: $(a).attr('href'),
              title: $(a)
                .find('.pop-tit')
                .text(),
              author: $(a)
                .find('.pop-intro')
                .text()
            })
          }
        } else {
          for (let li of $html.find('.pop-book2')) {
            list.push({
              url: $(li)
                .find('a')
                .attr('href'),
              title: $(li)
                .find('a')
                .attr('title'),
              author: $(li)
                .find('.pop-intro')
                .text(),
              thumbnail: $(li)
                .find('img')
                .attr('src')
            })
          }
        }
        return list
      }
    }
  ],
  source(url) {
    const host = url.replace(/.*\/\/([^/]*).*/, '$1')
    const source = this.sources.find(source => source.host === host)
    return source
  },
  getBook(url) {
    return this.source(url) ? this.source(url).getBook(url) : false
  },
  getChapter(url) {
    return this.source(url) ? this.source(url).getChapter(url) : false
  },
  getBooklist(url) {
    return this.source(url) ? this.source(url).getBooklist(url) : false
  }
}
