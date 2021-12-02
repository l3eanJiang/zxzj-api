const axios = require('axios').default
const cheerio = require('cheerio')
const baseUrl = 'https://www.zxzj.fun'

axios.get(baseUrl + '/list/1.html').then((res) => {
  const $ = cheerio.load(res.data)
  const result = []
  $('.stui-vodlist__thumb').each(() => {
    const item = $(this)
    let title = item.prop('title')
    let href = baseUrl + item.prop('href')
    let imgUrl = item.data('original')
    let status = item.children('pic-text').text()
    result.push({title, href, imgUrl, status})
  })
  console.log(result)
})
