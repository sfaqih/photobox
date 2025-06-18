import { useState, useEffect } from "react";
import { Card } from "@material-tailwind/react";
import { useNavigate } from 'react-router-dom';
import Background from "../components/Background";
import { HeaderPage } from "../components/Header";
import { usePhotobox } from "../contexts/studio";

export default function SelectTemplate() {
    const navigate = useNavigate();
    const { photoboxSession, setPhotoboxSession } = usePhotobox();

    const [selectedId, setSelectedId] = useState(null);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [templates, setTemplates] = useState([]);

    const onNextClick = () => {
        if (!selectedId) return false;
        const selectedTemplate = templates.find((template) => {
            return template.id == selectedId
        })
        localStorage.setItem("selectedTemplate", JSON.stringify(selectedTemplate));
        setPhotoboxSession({...photoboxSession, frames: selectedTemplate.frames})

        navigate('/photo-session');
    }

    const onSelectTemplate = async (templateId) => {
        setSelectedId(templateId)

        const base64 = templates.find((template) => {
            return template.id == templateId
        })?.base64
        const template = await window.electronAPI.getTemplate(templateId);
        template.base64 = base64

        if (template) setSelectedTemplate(template)
    }

    const loadTemplates = async () => {
        const tpls = await window.electronAPI.getTemplates();
        const template = tpls.map(async(tpl) => {
            const base64 = await window.electronAPI.loadImageBase64({url: tpl.pathUrl, name: tpl.name})
            console.debug("tpl: ", tpl);
            console.debug("tpl base64: ", base64);
                tpl.base64 = base64;
                return tpl;
        })
        const templates = await Promise.all(template)

        console.debug("templates: ", templates)
        setTemplates(templates);
    };

    const handleBack = () => {
        return navigate('/');
    }

    useEffect(() => {
        loadTemplates();
    }, []);    

    return (
        <Background>
            <HeaderPage onBack={() => {}} title={'Pilih Template'}></HeaderPage>
            <div className="container w-screen max-w-screen flex">
                <div className="w-2/3">  
                    <div className="px-5 justify-center items-center ">
                        {/* <img src={"/choose_frame.png"} className="object-cover w-50 pb-4 max-h-90" /> */}
                        <Card className="cursor-pointer p-1 border-2 bg-gray-100 rounded-xl my-2">
                            <div className="h-[80dvh] overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-mint scrollbar-track-gray-200">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {templates.map((template) => (
                                        <div
                                            key={template.id}
                                            onClick={() => onSelectTemplate(template.id)}
                                            className="relative cursor-pointer p-1 border-0 transition-all duration-200 rounded-xl group"
                                        >
                                            <img
                                                src={template.base64}
                                                alt={template.name}
                                                className="w-full h-full rounded"
                                            />

                                            {/* Overlay */}
                                            <div
                                                className={`
                                                    absolute inset-0 rounded 
                                                    transition duration-200 
                                                    ${selectedId === template.id ? "bg-black/60" : "group-hover:bg-black/20"}
                                                    flex items-center justify-center
                                                    `}
                                            >
                                                {selectedId === template.id && (
                                                    <span className="text-white font-semibold">Selected</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
                <div className="w-1/3 max-w-screen h-[84vh] flex flex-col px-7">
                {/* Spacer or header */}
                <div className="mt-2"></div>

                {/* Body - Gambar Preview */}
                {selectedTemplate && (
                    <div className="flex-1 border-4 bg-gray-100 overflow-hidden flex items-center justify-center">
                    <img
                        src={selectedTemplate.base64}
                        alt={selectedTemplate.name}
                        className="w-full h-full object-contain"
                    />
                    </div>
                )}

                {/* Footer - Tombol Next */}
                {selectedTemplate && (
                    <div className="py-4 flex items-center justify-center">
                    <button
                        className="bg-pink-500 hover:bg-pink-600 transition-colors disabled:opacity-50 text-white text-2xl px-12 py-5 rounded-2xl shadow-lg"
                        onClick={onNextClick}
                    >
                        <span>Next (Pilih Foto)</span>
                    </button>
                    </div>
                )}
                </div>

            </div>
        </Background>
    );
}
