import { BrowserRouter, HashRouter, Routes, Route } from 'react-router-dom';
import SelectTemplate from './pages/SelectTemplate';
import Landing from './pages/Landing';
import Template from './pages/Template';
import SelectPhoto from './pages/SelectPhoto';
import SelectFilter from './pages/SelectFilter';
import { PhotoboxProvider } from './contexts/studio';
import PrintPreview from './pages/PrintPreview';
import PrintSuccess from './pages/PrintSuccess';
import Setting from './pages/Setting';
import { ThemeProvider } from "@material-tailwind/react";
import Instruction from './pages/Instruction';
import Package from './pages/Package';
import Payment from './pages/Payment';
import ChoosePayment from './pages/ChoosePayment';
import PhotoSession from './pages/PhotoSession';

function App() {
  console.log("Rendering App V2...");
  return (
    // <div className="app-background">
    <PhotoboxProvider>
    <HashRouter>
      <Routes>
        <Route path="/select-template" element={<SelectTemplate />} />
        <Route path="/setting" element={<Setting />} />
        <Route path="/" element={<Landing />} />
        <Route path="/instruction" element={<Instruction />} />
        <Route path="/package" element={<Package />} />
        <Route path="/choose-payment" element={<ChoosePayment />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/photo-session" element={<PhotoSession />} />
        <Route path="/select-photos" element={<SelectPhoto />} />
        <Route path="/select-filter" element={<SelectFilter />} />
        <Route path="/print-preview" element={<PrintPreview />} />
        <Route path="/print-success" element={<PrintSuccess />} />
        <Route path="/template" element={<Template />} />
      </Routes>
    </HashRouter>
    </PhotoboxProvider>
    // </div>
  );
}

export default App;
