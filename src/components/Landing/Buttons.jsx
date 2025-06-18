import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePhotobox } from "../../contexts/studio";
import { LayoutPanelTop, Lock, Unlock, Cog } from "lucide-react";
import PinLogin from "../../components/PinLogin";

export default function Buttons() {
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const navigate = useNavigate();
    const { loginSession } = usePhotobox();

    const handleOnLock = async () => {
        console.debug("isUnlocked: ", isUnlocked);
        console.debug("isUnlocking: ", isUnlocking);

        if (!isUnlocked) return setIsUnlocking(true);

        if (isUnlocked) {
            await window.electronAPI.maximizeWindow();
            return setIsUnlocked(false);
        }
    }

    const handleOnTemplate = () => {
        return navigate('/template');
    }

    const handleLogin = async (unlocked) => {
        setIsUnlocking(false);
        setIsUnlocked(unlocked);
        if(unlocked) await window.electronAPI.unmaximizeWindow();
    }

    const handleOnConfig = () => {
        navigate('/setting');
    }

    const navigateCamera = () => {
        navigate('/select-template');
    }

    useEffect(() => {
        if (!loginSession?.isLogin) {
            window.electronAPI.maximizeWindow().then(() => {
                setIsUnlocked(false);
            });
        }
    }, [loginSession]);

    return (
        <>
            <div className="relative">
                <div className="z-20 text-white flex flex-col shrink-0 grow-0 justify-around 
                    fixed bottom-0 right-0 right-5 rounded-lg
                    mr-1 mb-5 lg:mr-5 lg:mb-5 xl:mr-10 xl:mb-10 cursor-pointer">

                    {/* Button Camera */}
                    {isUnlocked && loginSession?.isLogin && <div className="p-3 my-1 rounded-full border-4 border-white bg-pink-500" onClick={navigateCamera}>
                        <Cog size={30} />
                    </div>}

                    {/* Button Configuration */}
                    {isUnlocked && loginSession?.isLogin && <div className="p-3 my-1 rounded-full border-4 border-white bg-pink-500" onClick={handleOnConfig}>
                        <Cog size={30} />
                    </div>}
                                        
                    {/* Button Trigger Setup Template */}
                    {isUnlocked && loginSession?.isLogin && <div className="p-3 my-1 rounded-full border-4 border-white bg-pink-500" onClick={handleOnTemplate}>
                        <LayoutPanelTop size={30} />
                    </div>}

                    {/* Button Lock or Unlock Session Admin */}
                    <div className="p-3 my-1 rounded-full border-4 border-white bg-pink-500" onClick={handleOnLock}>
                        {!isUnlocked && <Lock size={30} />}
                        {isUnlocked && <Unlock size={30} />}
                    </div>                    
                </div>
            </div>
            {isUnlocking && <PinLogin onDone={handleLogin} ></PinLogin>}
        </>
    );
}
