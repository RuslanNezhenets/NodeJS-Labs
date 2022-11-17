import { createServer } from 'http'
import { EventEmitter } from 'events'

export default class Application {
  constructor() {
    this.emitter = new EventEmitter()
    this.server = this._createServer()
  }

  listen(port, callback) {
    this.server.listen(port, callback)
  }

  addRouter(router) {
    Object.keys(router.endpoints).forEach((path) => {
      const endpoint = router.endpoints[path]
      Object.keys(endpoint).forEach((method) => {
        const handler = endpoint[method]
        this.emitter.on(this._getRouterMask(path, method), (req, res) => {
          handler(req, res)
        })
      })
    })
  }

  _createServer() {
    return createServer((req, res) => {
      const emitted = this.emitter.emit(
        this._getRouterMask(req.url, req.method),
        req,
        res,
      )
      if (!emitted) {
        res.end()
      }
    })
  }

  _getRouterMask(path, method) {
    return `[${path}]:[${method}]`
  }
}