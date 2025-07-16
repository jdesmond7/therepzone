declare global {
  interface Window {
    google: {
      maps: {
        places: {
          AutocompleteService: any
          PlacesService: any
          PlacesServiceStatus: {
            OK: string
            ZERO_RESULTS: string
            OVER_QUERY_LIMIT: string
            REQUEST_DENIED: string
            INVALID_REQUEST: string
            NOT_FOUND: string
            UNKNOWN_ERROR: string
          }
        }
      }
    }
    initGoogleMaps: () => void
  }
}

export {} 