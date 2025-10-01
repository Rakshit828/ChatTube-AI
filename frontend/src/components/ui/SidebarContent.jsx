import { useEffect } from 'react';
import { PenBox } from "lucide-react";
import { useDispatch, useSelector } from 'react-redux';
import useApiCall from '../../hooks/useApiCall';
import { loadAllChats, getCurrentChatData } from '../../api/chats';
import { initializeCurrentChat, initializeUserChats } from '../../features/chatsSlice';
import ThreeDotLoader from './ThreeDotLoader';


const SidebarContent = ({ sidebar, isMobile, handleCreateNewChat }) => {
    const userChats = useSelector(state => state.chats.userChats);
    const currentChat = useSelector(state => state.chats.currentChat);
    const { selectedChatId } = currentChat || {};

    const dispatch = useDispatch();

    const { 
        isLoading, 
        isError, 
        errorMsg,
         handleApiCall 
    } = useApiCall(loadAllChats, "Loading Chats", true);

    useEffect(() => {
        const handleLoadAllChats = async () => {
            try {
                const dataFromServer = await handleApiCall([]);
                if (dataFromServer) dispatch(initializeUserChats(dataFromServer));
            } catch (err) {
                console.error(err);
            }
        };
        handleLoadAllChats();
    }, []);

    return (
        <div className="flex flex-col flex-1 overflow-y-auto">
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
                        {userChats ? (
                            userChats.map(chat => (
                                <Chat
                                    key={chat.uuid}
                                    chatID={chat.uuid}
                                    chatTitle={chat.title}
                                    isSelected={selectedChatId === chat.uuid}
                                    dispatch={dispatch}
                                />
                            ))
                        ) : (
                            <>
                                {isLoading && <ThreeDotLoader />}
                                {isError && <div>{errorMsg}</div>}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const Chat = ({ chatID, chatTitle, isSelected, dispatch }) => {
    const { handleApiCall } = useApiCall(getCurrentChatData);

    const handleSelectCurrentChat = async () => {
        const dataFromServer = await handleApiCall([chatID]);
        console.log("Data from the server ", dataFromServer)
        dispatch(initializeCurrentChat(dataFromServer));
    };

    return (
        <div
            className={`
        flex justify-between items-center p-2 sm:p-3 w-full text-sm sm:text-base rounded-lg cursor-pointer transition-colors duration-200
        ${isSelected ? 'bg-gray-700' : 'text-white hover:bg-gray-800'}
      `}
            onClick={handleSelectCurrentChat}
        >
            <span className="truncate flex-1">{chatTitle}</span>
        </div>
    );
};

export default SidebarContent;
