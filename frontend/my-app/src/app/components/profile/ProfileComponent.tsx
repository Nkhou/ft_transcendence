import React from 'react'
import Profile from './profile'
import Image from 'next/image'
import { User } from '../../utils/userinterface'

interface ProfileComponentProps {
    profile: boolean;
    closeProfile: () => void;
    user: User | null;
}

const ProfileComponent: React.FC<ProfileComponentProps> = ({ profile, closeProfile, user }) => {
    return (
        <>
            {profile && (
                 <div className="fixed inset-0 flex flex-col justify-center items-center bg-black bg-opacity-30 backdrop-blur-lg z-[9999] font-bold">
            
                 <Profile User={user}  />
                 <button
                 onClick={closeProfile}
                 className="fixed top-4 right-4 z-50 p-2 shadow-md text-white bg-black rounded-full z-[99999999]"
                 >
                 <Image src={'/icons/close.svg'} alt="Close" width={30} height={30} className="h-7 w-7" onClick={closeProfile} />
                 </button>
                 
                 
                 </div>
            )}
            </>
        

            
    )
}

export default ProfileComponent
