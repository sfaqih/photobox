import { useEffect, useState } from "react";
import { usePhotobox } from "../../contexts/studio";
import Spinner from "../../components/Spinner";
import axios from 'axios';

export default function Midtrans() {
    const {photoSession, setPhotoSession} = usePhotobox();
    const [snapToken, setSnapToken] = useState(null);

    useEffect(() => {
        if (!snapToken) return;
        console.debug("photoSession: ", photoSession)

        // Delay to avoid race condition
        const timeout = setTimeout(() => {
            embedPayment(snapToken);
        }, 350);

        return () => clearTimeout(timeout); // clear if re-rendered before timeout
    }, [snapToken]);

    useEffect(() => {
        getSnapToken();

        // CLEANUP: reset DOM & Snap container if component unmounts
        return () => {
            const container = document.getElementById('snap-container');
            if (container) {
                window.snap.hide();
                container.innerHTML = '';
                setSnapToken(null); // reset state
            }
        };
    }, []); // run only once on mount

    const embedPayment = (token) => {
        if (!window.snap || !token) return;

        try {
            window.snap.embed(token, {
                embedId: 'snap-container',
                uiMode: 'qr',
                onSuccess: function (result) {
                    alert("Payment success!");
                    console.log(result);
                },
                onPending: function (result) {
                    alert("Waiting for your payment!");
                    console.log(result);
                },
                onError: function (result) {
                    alert("Payment failed!");
                    console.log(result);
                },
                onClose: function () {
                    alert('You closed the popup without finishing the payment');
                }
            });
        } catch (error) {
            console.error("snap embed error", error);
        }
    };

    const getSnapToken = async () => {
        try {
            const backend = 'https://94f0-182-2-143-168.ngrok-free.app/payment/create';
            const price   = photoSession.amount;
            const orderId = "Test-" + Math.floor(Date.now() / 1000);

            const res = await axios.post(backend, {
                amount: price,
                channel: 'QRIS',
                order_id: orderId
            });

            const token = res.data?.data?.token;
            if (token) {
                setSnapToken(token);
                setPhotoSession({...photoSession, paymentToken: token, orderId: orderId})
            }
        } catch (err) {
            console.error("Error fetching snap token", err);
        }
    };

    return (
        <>
            <div className="flex justify-center">
                <div id="snap-container" className="mt-4 w-lg"></div>
            </div>
        </>
    );
}
