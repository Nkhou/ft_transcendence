'use client';

interface UserProfileProps {
  profile_picture: string | undefined;
  height?: number;
  width?: number;
}

const UserProfile: React.FC<UserProfileProps> = ({ profile_picture, height, width }) => {
  
  
  const profilePictureUrl = profile_picture
    ? profile_picture.startsWith('https') 
      ? profile_picture
      :  `https://${process.env.NEXT_PUBLIC_API_BASE_URL}${profile_picture}`
    : '/avatar.jpg'; // Default image

  return (
    <>
    <div className="rounded-full overflow-hidden" style={{ height, width }}>
     {/* wrap up the user with an image as a bordee */}
    {/* <div className="dic">
    <img src="2.png z-[1]" alt="profile" />

    </div> */}

        <div className="dib">

      <img
        src={profilePictureUrl}
        alt="Profile picture"
        height={height}
        width={width}
        className="object-cover rounded-full w-full h-full z-[9999999]"
        />
        </div>
    </div>
        </>
  );
};

export default UserProfile;
