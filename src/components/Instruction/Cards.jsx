import React from 'react';
import { Package, CreditCard, Image, Users } from 'lucide-react';

const Cards = () => {
  const instructions = [
    {
      id: 1,
      title: "Pilih Paket",
      description: "Pilih paket yang sesuai dengan kebutuhan Anda",
      icon: Package,
      bgColor: "bg-gradient-to-br from-purple-400 to-purple-600",
      illustration: (
        <div className="relative">
          <div className="bg-white/20 rounded-lg p-3 mb-2">
            <div className="w-8 h-8 bg-purple-300 rounded mb-2"></div>
            <div className="space-y-1">
              <div className="w-12 h-1 bg-white/60 rounded"></div>
              <div className="w-8 h-1 bg-white/60 rounded"></div>
            </div>
          </div>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-white/40 rounded-full"></div>
            <div className="w-2 h-2 bg-white/60 rounded-full"></div>
            <div className="w-2 h-2 bg-white/40 rounded-full"></div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "Pembayaran",
      description: "Lakukan pembayaran dengan metode yang tersedia",
      icon: CreditCard,
      bgColor: "bg-gradient-to-br from-cyan-400 to-teal-500",
      illustration: (
        <div className="relative">
          <div className="bg-white/20 rounded-lg p-2 mb-2 w-16 h-10 flex items-center justify-center">
            <div className="w-8 h-6 bg-white/60 rounded border-2 border-white/40 flex items-center justify-center">
              <div className="w-1 h-1 bg-black/40 rounded-full"></div>
            </div>
          </div>
          <div className="flex space-x-1 justify-center">
            <div className="w-6 h-6 bg-yellow-300 rounded-full flex items-center justify-center">
              <span className="text-xs">$</span>
            </div>
            <div className="w-6 h-6 bg-yellow-300 rounded-full flex items-center justify-center">
              <span className="text-xs">$</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: "Pilih Frame",
      description: "Pilih frame atau template yang Anda inginkan",
      icon: Image,
      bgColor: "bg-gradient-to-br from-orange-400 to-amber-500",
      illustration: (
        <div className="relative">
          <div className="bg-white/20 rounded-lg p-2 mb-2">
            <div className="grid grid-cols-2 gap-1">
              <div className="w-6 h-6 bg-green-300/60 rounded"></div>
              <div className="w-6 h-6 bg-blue-300/60 rounded"></div>
              <div className="w-6 h-6 bg-pink-300/60 rounded"></div>
              <div className="w-6 h-6 bg-purple-300/60 rounded"></div>
            </div>
          </div>
          <div className="w-4 h-8 bg-white/40 rounded-b-full mx-auto"></div>
        </div>
      )
    },
    {
      id: 4,
      title: "Cetak & Ambil",
      description: "Cetak foto Anda dan ambil hasilnya",
      icon: Users,
      bgColor: "bg-gradient-to-br from-pink-400 to-rose-500",
      illustration: (
        <div className="relative">
          <div className="bg-white/20 rounded-full w-12 h-12 mb-2 flex items-center justify-center mx-auto">
            <div className="w-8 h-8 bg-white/60 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-pink-300 rounded-full"></div>
            </div>
          </div>
          <div className="bg-white/20 rounded-lg w-8 h-6 mx-auto"></div>
        </div>
      )
    }
  ];

  return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {instructions.map((instruction) => {
            const IconComponent = instruction.icon;
            return (
              <div
                key={instruction.id}
                className="relative group cursor-pointer transform hover:scale-105 transition-all duration-300"
              >
                {/* Card */}
                <div className={`${instruction.bgColor} rounded-2xl p-6 text-white relative overflow-hidden h-64 shadow-lg`}>
                  {/* Background decoration */}
                  <div className="absolute top-4 right-4 w-3 h-3 bg-white/20 rounded-full"></div>
                  <div className="absolute top-8 right-8 w-2 h-2 bg-white/30 rounded-full"></div>
                  <div className="absolute bottom-8 left-4 w-1 h-1 bg-white/40 rounded-full"></div>
                  <div className="absolute bottom-12 left-8 w-1.5 h-1.5 bg-white/30 rounded-full"></div>
                  
                  {/* Step number */}
                  <div className="absolute top-4 left-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg">
                    {instruction.id}
                  </div>
                  
                  {/* Illustration */}
                  <div className="flex justify-center items-center mt-8 mb-4">
                    {instruction.illustration}
                  </div>
                  
                  {/* Content */}
                  <div className="text-center mt-auto">
                    <h3 className="font-bold text-lg mb-1">{instruction.title}</h3>
                  </div>
                  
                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                </div>
                
                {/* Description card that appears on hover */}
                <div className="absolute -bottom-16 left-0 right-0 bg-white rounded-xl p-4 shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 z-10">
                  <div className="flex items-center space-x-2 mb-2">
                    <IconComponent size={16} className="text-gray-600" />
                    <span className="font-semibold text-gray-800">{instruction.title}</span>
                  </div>
                  <p className="text-sm text-gray-600">{instruction.description}</p>
                </div>
              </div>
            );
          })}
        </div>
  );
};

export default Cards;