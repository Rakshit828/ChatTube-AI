import axios from "axios";
import { BASE_URL } from "./config";


const createNewChat = async (chatData) => {
    try{
        response = await axios.post(`${BASE_URL}/newchat`, chatData)
    } catch(error){
        console.log("Some error occurred during chat creation")
    }

}