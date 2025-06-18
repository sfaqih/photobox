import { useEffect, useState } from "react";
import Background from "../components/Background";
import { HeaderPage } from "../components/Header";
import { useNavigate } from "react-router-dom";
import { usePhotobox } from "../contexts/studio";
import { ChevronDown, Minus, Plus, User } from "lucide-react";

export default function Package() {
    const navigate = useNavigate();
    const {settings, photoSession, setPhotoSession} = usePhotobox();
    const preSessionTimer = settings?.preSession || 1;
    const [copies, setCopies] = useState(1);
    const pricePerCopy = settings?.printPrice;
    const basePrice = settings?.basePrice - pricePerCopy;

    const handleBack = () => {
        navigate('/instruction');
    }

    const handleNext = () => {
        setPhotoSession({...photoSession, amount: totalPrice, printCopies: copies})
        navigate('/choose-payment');
    }

    const incrementCopies = () => {
        setCopies(prev => Math.min(prev + 1, 100)); // Max 10 copies
    };
  
    const decrementCopies = () => {
        setCopies(prev => Math.max(prev - 1, 1)); // Min 1 copy
    };
    
    const totalPrice = (copies * pricePerCopy) + basePrice;
  
    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
        }).format(price).replace('IDR', 'Rp');
    };
    return (
        <>
        <Background>
        <HeaderPage onBack={handleBack} title={'Pilih Jumlah Cetak'}></HeaderPage>
            <div className="w-full flex grid justify-center">
                            <div className="w-full max-w-md">
                {/* Main Card */}
                <div className="bg-gradient-to-b from-yellow-100 to-orange-100 rounded-3xl p-8 shadow-xl border border-orange-200 relative overflow-hidden">
                {/* Notebook rings on the left */}
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-b from-red-300 to-red-400 rounded-l-3xl">
                    <div className="flex flex-col justify-evenly h-full py-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="w-4 h-4 bg-red-400 rounded-full ml-2 shadow-inner"></div>
                    ))}
                    </div>
                </div>
                
                {/* Content */}
                <div className="ml-4">
                    {/* Title */}
                    <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center">
                    How Many Print?
                    <span className="text-orange-500">*</span>
                    </h2>
                    
                    {/* Cute Character */}
                    <div className="flex justify-center mb-8">
                    <div className="relative">
                        {/* Bear body */}
                        <div className="w-20 h-20 bg-yellow-200 rounded-full border-2 border-orange-300 flex items-center justify-center relative">
                        {/* Bear face */}
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center relative">
                            {/* Eyes */}
                            <div className="absolute top-4 left-3 w-2 h-2 bg-gray-700 rounded-full"></div>
                            <div className="absolute top-4 right-3 w-2 h-2 bg-gray-700 rounded-full"></div>
                            {/* Nose */}
                            <div className="absolute top-7 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-gray-600 rounded-full"></div>
                            {/* Mouth */}
                            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-3 h-1 bg-gray-600 rounded-full opacity-60"></div>
                        </div>
                        {/* Bear ears */}
                        <div className="absolute -top-2 left-2 w-6 h-6 bg-yellow-200 rounded-full border border-orange-300"></div>
                        <div className="absolute -top-2 right-2 w-6 h-6 bg-yellow-200 rounded-full border border-orange-300"></div>
                        {/* Bear arms */}
                        <div className="absolute -left-3 top-6 w-5 h-8 bg-yellow-200 rounded-full border border-orange-300"></div>
                        <div className="absolute -right-3 top-6 w-5 h-8 bg-yellow-200 rounded-full border border-orange-300"></div>
                        </div>
                        {/* Crown */}
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <div className="w-8 h-4 bg-yellow-400 rounded-t-lg border border-orange-400 flex justify-center items-end">
                            <div className="w-1 h-1 bg-orange-500 rounded-full mb-1"></div>
                        </div>
                        </div>
                    </div>
                    </div>
                    
                    {/* Counter Section */}
                    <div className="bg-white/50 rounded-2xl p-6 mb-6 backdrop-blur-sm border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                        {/* Decrease Button */}
                        <button
                        onClick={decrementCopies}
                        className="w-12 h-12 bg-orange-200 hover:bg-orange-300 rounded-full flex items-center justify-center transition-colors duration-200 shadow-md active:scale-95"
                        disabled={copies <= 1}
                        >
                        <Minus size={20} className={`${copies <= 1 ? 'text-gray-400' : 'text-gray-700'}`} />
                        </button>
                        
                        {/* Counter Display */}
                        <div className="flex-1 mx-6">
                        <div className="text-center">
                            <div className="text-5xl font-bold text-gray-700 mb-2">{copies}</div>
                            <div className="flex items-center justify-center text-gray-600">
                            <User size={16} className="mr-1" />
                            <span className="text-sm">copies{copies > 1 ? 's' : ''}</span>
                            </div>
                        </div>
                        </div>
                        
                        {/* Increase Button */}
                        <button
                        onClick={incrementCopies}
                        className="w-12 h-12 bg-orange-200 hover:bg-orange-300 rounded-full flex items-center justify-center transition-colors duration-200 shadow-md active:scale-95"
                        disabled={copies >= 10}
                        >
                        <Plus size={20} className={`${copies >= 10 ? 'text-gray-400' : 'text-gray-700'}`} />
                        </button>
                    </div>
                    
                    {/* Wavy line separator */}
                    <div className="relative my-4">
                        <svg width="100%" height="8" viewBox="0 0 300 8" className="opacity-30">
                        <path d="M0,4 Q75,0 150,4 T300,4" stroke="#f97316" strokeWidth="2" fill="none" />
                        </svg>
                    </div>
                    
                    {/* Price Display */}
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-700">
                        {formatPrice(totalPrice)}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                        Tambah {formatPrice(pricePerCopy)} per print
                        </div>
                    </div>
                    </div>
                    
                    {/* Next Button */}
                    <button onClick={handleNext} className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center">
                    <span className="text-lg mr-2">Next</span>
                    <ChevronDown size={20} className="rotate-[-90deg]" />
                    </button>
                </div>
                </div>
            </div>
            </div>
        </Background>
        </>
    );
}
