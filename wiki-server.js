// *--------------------
// WikiのWebサーバー
// ---------------------*

// DBに接続
const path = require('path')
const NeDB = require('nedb')
const db = new NeDB({
  filename: path.join(__dirname, 'wiki.db'),
  autoload: true
})

// WEBサーバーを起動
const express = require('express')
const app = express()
const portNo = 3001

// body-parserを有効にする
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: true}))
app.listen(portNo, () => {
  console.log('起動', `http://localhost:${portNo}`)
})

// API定義
// Wikiデータを返す
app.get('/api/get/:wikiname', (req, res) => {
  const wikiname = req.params.wikiname
  db.find({name: wikiname}, (err, docs) => {
    if (err) {
      res.json({status: false, msg: err})
      return
    }
    if (docs.length === 0) {
      docs = [{name: wikiname, body: ''}]
    }
    res.json({status: true, data: docs[0]})
  })
})

// Wikiデータに書き込む
app.post('/api/put/:wikiname', (req, res) => {
  const wikiname = req.params.wikiname
  console.log('/api/put/' + wikiname, req.body)
  // 既存のエントリを確認
  db.find({'name': wikiname}, (err, docs) => {
    if (err) {
      res.json({status: false, msg: err})
      return
    }
    const body = req.body.body
    // エントリがなければ挿入
    if (docs.length === 0) {
      db.insert({name: wikiname, body})
    // 既存のエントリを更新
    } else {
      db.update({name: wikiname}, {name: wikiname, body})
    }
    res.json({status: true})
  })
})

// publicディレクトリを自動で返す
app.use('/wiki/:wikiname', express.static('./public'))
app.use('/edit/:wikiname', express.static('./public'))
app.get('/', (req, res) => {
  res.redirect(302, '/wiki/FrontPage')
})