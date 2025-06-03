// ConfigPage.jsx
import React, { useState, useEffect } from 'react';
import { HeaderPage } from '../components/Header';
import { useNavigate } from 'react-router-dom';
import { Input as TWInput } from "@material-tailwind/react";
import '../index.css';
import Background from '../components/Background';

const Setting = () => {
    const navigate = useNavigate();
    const [config, setConfig] = useState({});

    // Load existing config on mount
    useEffect(() => {
        loadSetting()
    }, [!config]);

    const loadSetting =  async() => {
        const setting = await window.electronAPI.getSetting();
        console.debug("Setting: ", setting)

        setConfig(setting);
    }

    const handleSave = async() => {
        await window.electronAPI.saveSetting(config);
        alert('Configuration saved!');
        location.reload()
    };

    const handleBack = () => {
        navigate('/');
    }

    const onSelectLandingImage = async () => {
        const res = await window.electronAPI.chooseFile();
        setConfig({
            ...config,
            landingImage: res?.filePath
        })
    }

    const onSelectBackgroundImage = async () => {
        const res = await window.electronAPI.chooseFile();
        setConfig({
            ...config,
            backgroundImage: res?.filePath
        })
    }

    return (
        <>
        <Background>
            <HeaderPage onBack={handleBack} title={'Setting Application'}></HeaderPage>
            <div className='flex justify-center'>
                <div className='container p-10 bg-white border-2 border-stone-900 shadow-sm rounded-sm text-black'>
                    <div className='form-group py-3'>
                        <label htmlFor="">Landing Image: <span className='font-bold'>{config.landingImage}</span></label><br />

                        <button className="bg-black text-white px-6 py-1 rounded-full" onClick={onSelectLandingImage}>
                            Pilih Image
                        </button>
                    </div>
                    <div className='form-group py-3'>
                        <label htmlFor="">Background Image: <span className='font-bold'>{config.backgroundImage}</span></label><br />

                        <button className="bg-black text-white px-6 py-1 rounded-full" onClick={onSelectBackgroundImage}>
                            Pilih Image
                        </button>
                    </div>
                    <div className='form-group py-3'>
                        <label htmlFor="">Timer Pre-Session</label><br />
                        <div className="w-72">
                            <TWInput
                                min={1}
                                defaultValue={config.preSession}
                                type='number'
                                size="lg"
                                placeholder="5 minutes"
                                className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                                onChange={(e) => setConfig({...config, preSession: e.target.value})}
                            />
                        </div>                        
                    </div>
                    <div className='form-group py-3'>
                        <label htmlFor="">Timer Session</label><br />
                        <div className="w-72">
                            <TWInput
                                min={1}
                                defaultValue={config.session}
                                type='number'
                                size="lg"
                                placeholder="5 minutes"
                                className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                                onChange={(e) => setConfig({...config, session: e.target.value})}
                            />
                        </div>                        
                    </div>                                        

                    <div className='form-group flex justify-center my-6'>
                        <button className="align-middle select-none font-sans font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 px-6 rounded-lg bg-green-500 text-white shadow-md shadow-green-500/20 hover:shadow-lg hover:shadow-green-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none px-6 py-1 rounded-full" onClick={handleSave}>
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </Background>
        </>
    );
};

export default Setting;
