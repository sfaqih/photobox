export const TestCamera = () => {
    const takePict = async() => {
        return await window.electronAPI.takePicture();
    }
    return (
        <div onClick={takePict}>Test12345</div>
    )
}