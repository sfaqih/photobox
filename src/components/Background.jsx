import { useEffect, useState } from "react";

const Background = ({ children, className = "" }) => {
  const [backgroundImage, setBackgroundImage] = useState("");

  useEffect(() => {
    loadSetting();
  }, []);

  const loadSetting = async() => {
    const setting = await window.electronAPI.getSetting();
    const bgImage = await window.electronAPI.loadImageBase64({url: setting?.backgroundImage, name: "Background"});

    console.debug("bgImage", setting?.backgroundImage)

    setBackgroundImage(bgImage);

    return bgImage;
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
