import { useState, useEffect } from 'react';
import { X, Delete, CheckCircle2 } from 'lucide-react';
import { MaxPinLength, UsersData } from '../constants/auth';
import { usePhotobox } from '../contexts/studio';

export default function PinLogin({ onDone }) {
  const [pin, setPin] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { loginSession, setLoginSession } = usePhotobox();
  
  // You can set this to whatever PIN you want for admin access
  const MAX_PIN_LENGTH = MaxPinLength;

  const handleNumberClick = (number) => {
    if (pin.length < MAX_PIN_LENGTH) {
      setPin(prev => prev + number);
      setError('');
    }
  };

  const handleDeleteClick = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  const handleClearClick = () => {
    setPin('');
    setError('');
  };

  const handleVerifyPin = () => {
    const user = UsersData.find((u) => u.pin == pin);
    console.debug("user: ", user);
    if (user) {
      setLoginSession({...loginSession, isLogin: true, userId: user.id})
      setSuccess(true);
      onDone(true);
      setTimeout(() => {
        setIsOpen(false);
      }, 1500);
    } else {
      setError('Invalid PIN. Please try again.');
      setPin('');
    }
  };

  const handleCloseModal = () => {
    setIsOpen(false);
    onDone(false);
  };

  // Simulate a login requirement for demo purposes
  const handleShowModal = () => {
    setIsOpen(true);
    setPin('');
    setError('');
    setSuccess(false);
  };

  // For demo purposes, key events for keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      if (e.key >= '0' && e.key <= '9') {
        handleNumberClick(e.key);
      } else if (e.key === 'Backspace') {
        handleDeleteClick();
      } else if (e.key === 'Enter') {
        handleVerifyPin();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, pin]);

  if (!isOpen) {
    return (
      <div className="flex justify-center mt-10">
        <button 
          onClick={handleShowModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Open Admin Login
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-100 px-6 py-4 flex justify-between items-center border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Admin Login</h2>
          <button 
            onClick={handleCloseModal}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* PIN Display */}
        <div className="px-6 pt-6">
          <div className="flex justify-center mb-2">
            <div className="flex space-x-4">
              {[...Array(MAX_PIN_LENGTH)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center"
                >
                  {pin.length > i ? 
                    <div className="w-6 h-6 rounded-full bg-blue-600"></div> : 
                    null
                  }
                </div>
              ))}
            </div>
          </div>
          
          {error && (
            <div className="text-red-500 text-center mb-4">{error}</div>
          )}
          
          {success && (
            <div className="text-green-500 text-center mb-4 flex items-center justify-center">
              <CheckCircle2 className="mr-2" size={20} />
              Authentication successful!
            </div>
          )}
        </div>
        
        {/* Number Pad */}
        <div className="p-6">
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(number => (
              <button
                key={number}
                onClick={() => handleNumberClick(number.toString())}
                className="bg-gray-200 text-slate-900 rounded-lg text-2xl font-semibold h-16 flex items-center justify-center shadow hover:bg-gray-200 active:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
                disabled={success}
              >
                {number}
              </button>
            ))}
            
            <button
              onClick={handleClearClick}
              className="bg-red-100 text-red-700 rounded-lg font-semibold h-16 flex items-center justify-center shadow hover:bg-red-200 active:bg-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-colors"
              disabled={success}
            >
              Clear
            </button>
            
            <button
              onClick={() => handleNumberClick('0')}
              className="bg-gray-200 text-slate-900 rounded-lg text-2xl font-semibold h-16 flex items-center justify-center shadow hover:bg-gray-200 active:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
              disabled={success}
            >
              0
            </button>
            
            <button
              onClick={handleDeleteClick}
              className="bg-gray-200 text-slate-900 rounded-lg h-16 flex items-center justify-center shadow hover:bg-gray-300 active:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
              disabled={success}
            >
              <Delete size={24} />
            </button>
          </div>
          
          <button
            onClick={handleVerifyPin}
            className="mt-6 bg-blue-600 text-white w-full py-3 rounded-lg font-semibold shadow-lg hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
            disabled={pin.length !== MAX_PIN_LENGTH || success}
          >
            Unlock
          </button>
        </div>
      </div>
    </div>
  );
}