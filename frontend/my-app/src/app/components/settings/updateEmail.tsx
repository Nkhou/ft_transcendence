import { useState } from 'react';
import Image from 'next/image';
import { api } from '@/app/services/api'; // Import the API instance
import axios from 'axios'; // Ensure axios is installed (`npm install axios`)

interface UpdateEmailModalProps {
  email: boolean;
  set_email: (value: boolean) => void;
  t: (key: string) => string;
  token: string;
}

const UpdateEmailModal = ({ email, set_email, t, token }: UpdateEmailModalProps) => {
  const [newEmail, setNewEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleEmailChange = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.put(
        'api/users/update-email/', 
        { email: newEmail }, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );


      if (response.status === 200) {
        setSuccess(t('accountsettings.emailUpdated')); 
        set_email(false); 
      } else {
        setError(t('accountsettings.emailUpdateFailed')); 
      }
    } catch (err) {
      setError(t('accountsettings.errorOccurred')); 
    } finally {
      setIsLoading(false);
    }
  };

  return (
    email && (
      <div className='fixed inset-0 bg-stone-950 z-[999999999999] flex w-screen h-screen items-center justify-center flex-col gap-4'>
        <Image 
          src='/icons/close.svg' 
          alt={t('accountsettings.close')} // Translate close icon alt text
          width={50} 
          height={50} 
          className='absolute top-0 right-0 m-4 cursor-pointer' 
          onClick={() => set_email(false)} 
        />
        <div className="d">
          <button className='font-[Roquila] text-8xl px-6 text-gradient1'>
            {t('accountsettings.changeemail')} {/* Translate the modal title */}
          </button>
        </div>
        <input
          type="email"
          placeholder={t('accountsettings.enterNewEmail')} // Translate the input placeholder
          className='text-white bg-neutral-800 rounded-xl w-[19rem] h-[3em] font-[abelhid] font-bold text-start px-4'
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)} // Handle input change
        />
        {error && <p className="text-red-500">{error}</p>} 
        {success && <p className="text-green-500">{success}</p>} 
        
        <button
          className={`font-[walo] text-xl px-6 text-gradient1 hover:text-white bg-neutral-900 h-[3em] my-6 rounded-xl hover:bg-yellow-600 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleEmailChange}
          disabled={isLoading || !newEmail} 
        >
          {isLoading ? t('accountsettings.updating') : t('profile.save')} 
        </button>
      </div>
    )
  );
};

export default UpdateEmailModal;
