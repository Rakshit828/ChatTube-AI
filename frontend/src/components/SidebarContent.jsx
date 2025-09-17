import { useContext } from 'react'
import { BsThreeDotsVertical } from "react-icons/bs";
import { PenBox } from "lucide-react";
import { ChatContext } from '../context/ChatContext';
import { AuthContext } from '../context/AuthContext';



const SidebarContent = ({ sidebar, isMobile, handleCreateNewChat }) => {
    const { chats, loadAllQAs, qas, setQAs } = useContext(ChatContext)
    const { header } = useContext(AuthContext)

    const handleLoadAllQAs = async (chatID) => {
        console.log("Loding QAs req gone")
        const response = await loadAllQAs(chatID, header)
        if (response.success) {
            setQAs(response.data)
        }
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
                            return <Chat key={chat.uuid} chat={chat.title} onClick={async (e)=>{
                                e.preventDefault()
                                await handleLoadAllQAs(chat.uuid)
                            }} />
                        })}

                    </div>
                </div>
            )}

        </div>

    )
}


const Chat = ({ chat, onClick }) => (
    <div
        className="flex justify-between items-center p-2 sm:p-3 w-full text-white text-sm sm:text-base rounded-lg hover:bg-gray-800 cursor-pointer transition-colors duration-200 group"
        onClick={onClick}
    >
        <span className="truncate flex-1 mr-2">{chat}</span>
        <BsThreeDotsVertical
            size={16}
            color="white"
            className="opacity-0 group-hover:opacity-70 hover:opacity-100 cursor-pointer flex-shrink-0 transition-opacity duration-200"
        />
    </div>
);



export default SidebarContent
