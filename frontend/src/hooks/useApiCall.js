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
    const response = await handleRefreshToken(header)
    if (response.success) {
      return response.data.access_token
    }
    if (response.data.error === "expired_jwt_token_error" && response.status_code === 401) {
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

    console.log(header)

    const response = await apiFunction(...apiParameters, header);

    setIsLoading(false);

    if (!response.success) {
      if (response.data.error === "expired_jwt_token_error" && response.status_code === 401) {
        const accessTokenObj = await handleTokenRefresh(header)
        dispatch(setAccessToken(accessTokenObj))
      }
      setIsError(true);
      setErrorMsg(response.data);
      return null;
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
