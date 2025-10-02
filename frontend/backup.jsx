import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectAccessToken, selectRefreshToken, setAccessToken } from "../features/authSlice";
import { handleRefreshToken } from "../api/chats";

function useApiCall(apiFunction, loadingMessage = "", requiresHeader = true) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(loadingMessage);
  const [isError, setIsError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const accessToken = useSelector(selectAccessToken);
  const refreshToken = useSelector(selectRefreshToken);

  const dispatch = useDispatch()

  const handleTokenRefresh = async (header) => {
    header["Authorization"] = `Bearer ${refreshToken}`
    console.log("Header for refresh ", header)
    const response = await handleRefreshToken(header)
    if (response.success) {
      return response.data
    }
    if (response.data.error === "expired_jwt_token_error" && response.status_code === 401) {
      // This is the condition when the refresh token itself is expired
      // Logic to redirect to login page again
    }
  }

  const handleApiCall = async (apiParameters = []) => {
    setErrorMsg("");
    setIsError(false);
    setIsLoading(true);

    const header = requiresHeader
      ? {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`
      }
      : undefined;

    console.log("Header for access ", header)

    const response = await apiFunction(...apiParameters, header);

    setIsLoading(false);
    
    // This if block handles the not successful response and gives the response for more control to the component
    if (!response.success) {
      if (response.data.error.trim() === "expired_jwt_token_error" && response.status_code === 401) {
        setIsLoading(true)
        setLoadingMsg("Verifying User")
        const accessTokenObj = await handleTokenRefresh(header)
        dispatch(setAccessToken(accessTokenObj))
        return
      }

      setIsError(true);
      setErrorMsg(response.data);
      setLoadingMsg("")
      return response
    }


    return response.data;
  };

  return {
    isLoading,
    setIsLoading,
    loadingMsg,
    setLoadingMsg,
    isError,
    setIsError,
    errorMsg,
    setErrorMsg,
    handleApiCall
  };
}

export default useApiCall;
