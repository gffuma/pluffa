import { useId } from "react"

export function useCrawl() {
  const id = useId()
  console.log('CRAWLING Y SHITs', id)
  return (
    'GANG'
  )
}