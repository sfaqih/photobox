import { useEffect, useState } from "react";
import Background from "../components/Background";
import { HeaderPage } from "../components/Header";
import Cards from "../components/Instruction/Cards";
import { useNavigate } from "react-router-dom";
import { usePhotobox } from "../contexts/studio";
import { useTimerStore } from "../utils/useTimerStore";

export default function Instruction() {
    const navigate = useNavigate();
    const {settings} = usePhotobox();
    const { startTimer, isRunning } = useTimerStore();
    const preSessionTimer = settings?.preSession || 1;

    useEffect(() => {
        startTimer(preSessionTimer * 60, handleTimeout);
    }, [])

    const handleTimeout = () => {
        alert("⏰ Time is up! Redirecting..");
        return handleBack()
    };    

    const handleBack = () => {
        return navigate('/');
    }

    const handleNext = () => {
        navigate('/package');
    }

    
    return (
        <>
        <Background>
        <HeaderPage onBack={handleBack} title={'Langkah Berfoto di PixiBox'}></HeaderPage>
            <div className="px-10 h-[75dvh]" onClick={handleNext}>
                <Cards></Cards>
            </div>
        </Background>
        </>
    );
}
