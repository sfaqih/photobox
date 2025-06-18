import { useEffect, useState } from "react";
import Background from "../components/Background";
import { HeaderPage } from "../components/Header";
import { useNavigate } from "react-router-dom";
import { usePhotobox } from "../contexts/studio";
import Spinner from "../components/Spinner";
import { PaymentCard } from "../components/Payment/Card";
import axios from 'axios';

export default function ChoosePayment() {
    const navigate = useNavigate();
    const {settings, photoSession, setPhotoSession} = usePhotobox();
    const preSessionTimer = settings?.preSession || 1;


    const handleBack = () => {
        navigate('/');
    }

    const handlePayment = (channel) => {
        setPhotoSession({...photoSession, paymentChannel: channel})
        return navigate(`/payment?channel=${channel}`);
    }

    return (
        <>
        <Background>
        <HeaderPage onBack={handleBack} title={'Metode Pembayaran'} timer={preSessionTimer}></HeaderPage>
            <div className="px-10">
                <div className="flex justify-center grid-cols-2 gap-20">
                    <PaymentCard
                        title="QRIS"
                        description="Mendukung berbagai macam metode pembayaran digital yang dapat anda gunakan."
                        // icons={QRIS_ICONS}
                        onPay={() => handlePayment('qris')}
                        buttonText="Bayar Sekarang"
                    />
                    <PaymentCard
                        title="Voucher"
                        description="Kode Voucher yang anda miliki sangat mendukung untuk klaim sesi maupun potongan harga."
                        buttonText="Klaim Sekarang"
                    />                    
                </div>
            </div>
        </Background>
        </>
    );
}
  