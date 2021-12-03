import chalk from "chalk"
import fs from "fs"
import cheerio from "cheerio"
import axios from "axios"
import path from "path"

axios.defaults.baseURL = 'https://www.zxzj.fun'
// 当前目录
const dirname = path.resolve()

// 列表页
// /list/电影类-页码.html
function getList() {
  axios.get('/list/1-1.html').then(res => {
    const $ = cheerio.load(res.data)
    const result = []
    $('.stui-vodlist__thumb').each((index, element) => {
      const item = $(element)
      let title = item.prop('title')
      let videoId = item.prop('href').split('.')[0].split('/')[2]
      let imgUrl = item.data('original')
      let episode = item.children('.pic-text').text()
      episode = episode.substring(1, episode.length - 1)
      episode = episode === '完' ? 1 : episode - 0
      result.push({title, videoId, imgUrl, episode})
    })
    output(result)
  })
}

// 详情页
// /video/视频ID-1-集数.html
function getDetail(videoId, episode) {
  axios.get(`/video/${videoId}-1-${episode}.html`).then(res => {
    // console.log(res.data)
    const $ = cheerio.load(res.data)
    const result = {}
    result.desc = $('.data-more').children().last().text()
    result.playUrl = JSON.parse($('.stui-player__video script').html().split('=')[1]).url
    output(result)
  })
}

function output(data) {
  fs.writeFile(`${dirname}/data.json`, JSON.stringify(data, null, 2), err => {
    if (err) {
      console.error(err)
    }
    console.log(chalk.green(`已保存到：${dirname}\\data.json`))
  })
}

getList()
