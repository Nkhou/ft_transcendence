import React from 'react'
interface FriendProps {
    name :string;
   
}

const Friend:React.FC<FriendProps> = ({name}) => {
  return (
    <div>
        {/* i need the avatar of the friend and the name */}
        <div className=" flex mt-10 gap-5">
            <img src="/avatar2.jpg" alt="avatar" className="w-20 h-20 rounded-full"/>
            <div className="text-gray-800 dark:text-gray-100 font-[Montserrat] text-xl md:text-xl lg:text-2xl ">
                {name}
            </div>
        </div>

      
    </div>
  )
}

export default Friend
