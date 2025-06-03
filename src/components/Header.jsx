import { useState, useEffect } from "react";
import { ArrowLeftCircle } from "lucide-react"
import useIdle from "../utils/IdleTimer"

export const HeaderPage = ({ onBack, title, timer }) => {

    const [remaining, setRemaining] = useState(null);
    if(timer && timer > 0) {
      const { getRemainingTime, remainingFormatted } = useIdle({onIdle: onBack, idleTime: timer})


      useEffect(() => {
        const interval = setInterval(() => {
          setRemaining(remainingFormatted(getRemainingTime()))
        }, 500)

        return () => {
          clearInterval(interval)
        }
      })      
    }

    return (
    <>
      <div className='flex min-w-screen justify-between px-10 py-10' style={{zIndex: 15}}>
        <div className="back">
            <button
            className="back-button flex items-center text-pink-500 hover:text-pink-600"
            onClick={onBack}
            >
            <ArrowLeftCircle size={32} className="mr-2" />
            {/* <span>Kembali</span> */}
            </button>            
        </div>
        <div className="text-2xl">{title}</div>
        <div className="">{timer && remaining && (<div className="bg-white border-2 border-stone-900 shadow-sm rounded-sm px-10 py-2 text-black">{remaining}</div>)}
        </div>
      </div>

    </>        
    )
}