import { useState } from "react"

function useApiCall(apiFunction, apiParameters = [], loadingMessage = "") {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState(loadingMessage)
  const [isError, setIsError] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const handleApiCall = async (event) => {
    event.preventDefault()
    
    setErrorMsg("")
    setIsError(false)
    setIsLoading(true)
    const response = await apiFunction(...apiParameters)
    setIsLoading(false)
    if (!response.success) {
      setIsError(true)
      setErrorMsg(response.data)
    }
  }

  return {
    isLoading,
    setIsLoading,
    loadingMsg,
    setLoadingMsg,
    isError,
    setIsError,
    errorMsg,
    setErrorMsg,
    handleApiCall,
  }

}

export default useApiCall
