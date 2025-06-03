import { useEffect, useState } from "react";
import Background from "../components/Background";
import { HeaderPage } from "../components/Header";
import Cards from "../components/Instruction/Cards";
import { useNavigate } from "react-router-dom";
import { usePhotobox } from "../contexts/studio";

export default function Instruction() {
    const navigate = useNavigate();
    const {settings} = usePhotobox();
    const preSessionTimer = settings?.preSession || 1;

    const handleBack = () => {
        navigate('/');
    }

    const handleNext = () => {
        navigate('/package');
    }
    return (
        <>
        <Background>
        <HeaderPage onBack={handleBack} title={'Langkah Berfoto di PixiBox'} timer={preSessionTimer}></HeaderPage>
            <div className="px-10" onClick={handleNext}>
                <Cards></Cards>
            </div>
        </Background>
        </>
    );
}
