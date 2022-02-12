import request from 'superagent'

const fetcher = (url) => request.get(url).then((r) => r.body)
export default fetcher
