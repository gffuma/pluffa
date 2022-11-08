const ClientConfig = {
  baseUrl: '/__pluffastatik',
}

export function configureStatikClientBaseUrl(url: string) {
  ClientConfig.baseUrl = url
}

export function getStatikClientBaseUrl() {
  return ClientConfig.baseUrl
}
