import { useContext, useEffect, useState } from 'react'
import { BsThreeDotsVertical } from "react-icons/bs";
import { PenBox } from "lucide-react";
import { ChatContext } from '../context/ChatContext';
import { AuthContext } from '../context/AuthContext';


const SidebarContent = ({ sidebar, isMobile, handleCreateNewChat }) => {
    console.log("Rendering from SidebarContent")
    const {
        chats,
        setChats,
        loadAllQAs,
        loadAllChats,
        selectedChatID,
        setSelectedChatID,
        setQAs,
        handleSetURLs
    } = useContext(ChatContext)

    const { header } = useContext(AuthContext)

    useEffect(() => {
        const handleLoadAllChats = async () => {
            const response = await loadAllChats(header)
            if (response.success) {
                console.log(response.data)
                setChats(response.data)
            }
        }
        handleLoadAllChats()
    }, [])


    const handleLoadAllQAs = async (chatID, youtubeVideoURL) => {
        console.log("Loding QAs req gone")
        const response = await loadAllQAs(chatID, header)
        console.log(response.data)
        if (response.success) {
            setQAs(response.data)
            handleSetURLs(youtubeVideoURL)
        }
        setSelectedChatID(chatID)
        return response.data
    }

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

            {/* Rest of content only if expanded */}
            {(sidebar || isMobile) && (
                <div id="chats" className="w-full mt-4 sm:mt-6 text-gray-400 px-3">
                    <div className="text-xs sm:text-sm font-medium mb-2">Recent Chats</div>
                    <div className="space-y-1">

                        {chats?.map((chat) => {
                            return <Chat key={chat.uuid} chatTitle={chat.title} video={chat.youtube_video} onClick={async () => {
                                await handleLoadAllQAs(chat.uuid, chat.youtube_video)
                            }}
                                isSelected={selectedChatID == chat.uuid ? true : false}
                            />
                        })}

                    </div>
                </div>
            )}
        </div>

    )
}


const Chat = ({ chatTitle, video, onClick, isSelected }) => (
    <div
        className={`
            flex justify-between items-center p-2 sm:p-3 w-full text-sm sm:text-base rounded-lg cursor-pointer transition-colors duration-200 group
            ${isSelected ? 'bg-gray-700' : 'text-white hover:bg-gray-800'}
        `}
        onClick={async (event) => {
            event.preventDefault()
            await onClick(video)
        }}
    >
        <span className="truncate flex-1 mr-2">{chatTitle}</span>
        <BsThreeDotsVertical
            size={16}
            className="opacity-0 group-hover:opacity-70 hover:opacity-100 cursor-pointer flex-shrink-0 transition-opacity duration-200"
        />
    </div>
)




export default SidebarContent
