import { useEffect } from 'react';
import { PenBox } from "lucide-react";
import { useDispatch, useSelector } from 'react-redux';
import useApiCall from '../../hooks/useApiCall';
import { loadAllChats } from '../../api/chats';
import { initializeUserChats } from '../../features/chatsSlice';
import ThreeDotLoader from './ThreeDotLoader';
import Chat from './Chat.jsx'



const SidebarContent = ({ sidebar, isMobile, handleCreateNewChat }) => {
    const userChats = useSelector(state => state.chats.userChats);
    const currentChat = useSelector(state => state.chats.currentChat);
    const { selectedChatId } = currentChat || {};
    
    console.log("USER CHATS ARE : ", userChats)

    const dispatch = useDispatch();

    const {
        isLoading,
        isError,
        errorMsg,
        loadingMsg,
        handleApiCall
    } = useApiCall(loadAllChats, "Loading Chats", true);

    useEffect(() => {
        const handleLoadAllChats = async () => {
            const response = await handleApiCall([]);
            if (response.success && !isError) {
                dispatch(initializeUserChats(response.data));
            }
        };

        handleLoadAllChats();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="flex flex-col flex-1 overflow-y-auto custom-dark-scrollbar">
            {/* New Chat button */}
            <div
                id="new-chat"
                className={`
          h-12 sm:h-14 flex items-center
          ${sidebar ? "justify-start px-3 gap-3 sm:gap-4" : "justify-center"}
          text-white rounded-lg hover:bg-gray-800 cursor-pointer transition-colors duration-200 w-full
        `}
                onClick={handleCreateNewChat}
            >
                <PenBox size={20} color="white" />
                {sidebar && <span className="truncate ml-2">New Chat</span>}
            </div>

            {/* Recent Chats */}
            {(sidebar || isMobile) && (
                <div id="chats" className="w-full mt-4 sm:mt-6 text-gray-400 px-3">
                    <div className="text-xs sm:text-sm font-medium mb-2">Recent Chats</div>
                    <div className="space-y-1">
                        {isLoading && (
                            <div className="flex flex-col items-center justify-center py-4">
                                <ThreeDotLoader />
                                {loadingMsg && <p className="text-xs mt-2">{loadingMsg}</p>}
                            </div>
                        )}

                        {isError && (
                            <div className="text-red-400 text-sm p-3 bg-red-900/20 rounded-lg">
                                {errorMsg}
                            </div>
                        )}

                        {!isLoading && !isError && userChats && userChats.length > 0 && (
                            userChats.map(chat => (
                                <Chat
                                    key={chat.uuid}
                                    chatID={chat.uuid}
                                    chatTitle={chat.title}
                                    isSelected={selectedChatId === chat.uuid}
                                    dispatch={dispatch}
                                />
                            ))
                        )}

                        {!isLoading && !isError && (!userChats || userChats.length === 0) && (
                            <div className="text-gray-500 text-sm text-center py-4">
                                No chats yet. Start a new conversation!
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};


export default SidebarContent;