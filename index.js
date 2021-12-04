import chalk from "chalk"
import fs from "fs"
import cheerio from "cheerio"
import axios from "axios"
import path from "path"

axios.defaults.baseURL = 'https://www.zxzj.fun'
const finalData = []
const dirname = path.resolve()
const videoTypeName = [
  '全部视频',
  '电影',
  '美剧',
  '韩剧',
  '日剧',
  '泰剧',
  '动漫'
]

// 获取网页html
function load(url) {
  return new Promise((resolve, reject) => {
    axios.get(url).then(res => {
      resolve(res.data)
    }).catch(err => {
      reject(err)
    })
  })
}

// 解析html获得$cheerio对象
function load$(html) {
  return cheerio.load(html)
}

async function main (videoType) {
  console.time('耗时')
  const list = await getList(videoType,1)
  for (const listElement of list) {
    const promiseAll = []
    for (let i = 1; i < listElement.episode + 1; i++) {
      promiseAll.push(
        new Promise(async (resolve, reject) => {
          const detail = await getDetail(listElement.videoId, i)
          resolve(detail)
        })
      )
    }
    console.log(`开始获取${listElement.title}播放地址`)
    listElement.details = await Promise.all(promiseAll)
  }
  output(list)
  console.timeEnd('耗时')
}

// 列表页
// /list/电影类-页码.html
async function getList(videoType, page) {
  console.log(`开始获取${videoTypeName[videoType]}第${page}页数据`)
  const html = await load(`/list/${videoType}-${page}.html`)
  const $ = load$(html)
  const list = []
  $('.stui-vodlist__thumb').each((index, element) => {
    const item = $(element)
    let title = item.prop('title')
    let videoId = item.prop('href').split('.')[0].split('/')[2]
    let imgUrl = item.data('original')
    let episode = item.children('.pic-text').text()
    episode = episode.substring(1, episode.length - 1)
    episode = episode === '完' ? 1 : episode - 0
    list.push({title, videoId, imgUrl, episode})
  })
  console.log(`成功获取${videoTypeName[videoType]}第${page}页数据`)
  return list
}

// 详情页
// /video/视频ID-1-集数.html
async function getDetail(videoId, episode) {
  const html = await load(`/video/${videoId}-1-${episode}.html`)
  const $ = load$(html)
  const result = {}
  result.desc = $('.data-more').children().last().text().substring(3)
  result.playUrl = JSON.parse($('.stui-player__video script').html().split('=')[1]).url
  console.log(`第${episode}集成功获取`)
  return result
}

function output(data) {
  if (!data) {
    data = finalData
  }
  fs.writeFile(`${dirname}/data.json`, JSON.stringify(data, null, 2), err => {
    if (err) {
      console.error(err)
    }
    console.log(chalk.green(`已保存到：${dirname}\\data.json`))
  })
}

main(4).catch(err => {
  console.log(err)
})
