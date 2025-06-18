import React from "react";
import { useEffect, useState } from "react";
import Background from "../components/Background";
import { HeaderPage } from "../components/Header";
import { usePhotobox } from "../contexts/studio";
import Spinner from "../components/Spinner";
import { useQuery } from "../hooks/query";
import Midtrans from "../components/Payment/Midtrans";
import { useNavigate } from "react-router-dom";

export default function Payment() {
    let query = useQuery();
    const navigate = useNavigate();
    const {settings} = usePhotobox();
    const preSessionTimer = settings?.preSession || 1;

    const [snapToken, setSnapToken] = useState(null);

    const channel = query.get("channel");

    const handleBack = () => {
        navigate('/');
    }

    const handleNext = () => {
        navigate('/package');
    }

    return (
        <>
        <Background callbackClick={handleNext}>
        <HeaderPage onBack={handleBack} title={'Pembayaran'} timer={preSessionTimer}></HeaderPage>
            <div className="px-10">
                {channel != "voucher" && <Midtrans/>}
            </div>
        </Background>
        </>
    );
}
  