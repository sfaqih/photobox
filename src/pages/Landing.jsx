import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePhotobox } from "../contexts/studio";
import Buttons from "../components/Landing/Buttons";
import Background from "../components/Landing/Background";

export default function Landing() {
    console.log("Landing Page");
    const navigate = useNavigate();
    const { loginSession, settings, setSettings } = usePhotobox();

    const [isUnlocked, setIsUnlocked] = useState(false);

    const handleNext = () => {
        // navigate('/instruction');
        navigate('/test-camera');
    }

    useEffect(() => {
        if (!loginSession?.isLogin) {
            window.electronAPI.maximizeWindow().then(() => {
                setIsUnlocked(false);
            });
        }
    }, [loginSession]);

    useEffect(() => {
        loadFirst()
    }, []);

    const loadFirst = async() => {
        const setting = await window.electronAPI.getSetting();

        setSettings(setting);
    }

    return (
        <>
        <Background>
            <div className="min-h-screen min-w-screen flex flex-col items-center justify-center p-4" onClick={handleNext}>
            </div>
            <Buttons></Buttons>
        </Background>
        </>
    );
}
