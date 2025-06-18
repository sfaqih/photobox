import { useEffect, useState } from "react";

const Background = ({ children, className = "" }) => {
  const [backgroundImage, setBackgroundImage] = useState("");

  useEffect(() => {
    loadSetting();
  }, []);

  const loadSetting = async() => {
    const setting = await window.electronAPI.getSetting();
    // const landingImage = setting?.landingImage; 
    const landingImage = await window.electronAPI.loadImageBase64({url: setting?.landingImage, name: "Landing"});

    console.debug("landingImage", setting?.landingImage)

    setBackgroundImage(landingImage);

    return landingImage;
  }

  const style = {
    backgroundImage: backgroundImage ? `url(${backgroundImage})` : "url(./images/background.png)",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    minHeight: "100vh",
    width: "100%",
  };

  return (
    <div className={`${className}`} style={style}>
      {children}
    </div>
  );
};

export default Background;
