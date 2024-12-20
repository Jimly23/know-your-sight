import React, { useEffect, useState, useRef } from 'react'
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Client } from "@gradio/client";
import ContentRenderer from '../components/template/ContentRenderer';
import { useAuth } from '../context/AuthContext';
import { FaRegUser } from 'react-icons/fa';
import { ArrowLeft, ArrowRight, History, Printer } from 'lucide-react';
import sample1 from './../assets/images/sample1.png';
import sample2 from './../assets/images/sample2.png';
import sample3 from './../assets/images/sample3.png';
import sample4 from './../assets/images/sample4.png';
import logo from './../assets/images/logo.png';
import { Link, useNavigate } from 'react-router-dom';

interface NavbarDetectionProps {
  username: string|undefined;
  setHistory: () => void;
}

const NavbarDetection:React.FC<NavbarDetectionProps> = ({ username, setHistory }) => {
  return (
    <div className='max-w-[1600px] mx-auto px-10 py-5 flex items-center justify-between'>
      <h5 className='text-xl'><Link to={'/'}><img src={logo} className='h-[35px]' /></Link></h5>
      <div className='flex items-center gap-x-3'>
        <div onClick={() => setHistory()} className='flex items-center gap-x-2 cursor-pointer px-2 py-1 rounded-md hover:bg-slate-100'>
          <p>History</p>
          <History size={23}/>
        </div>
        <div className='flex items-center gap-x-2 cursor-pointer px-2 py-1 rounded-md hover:bg-slate-100'>
          <p>{username}</p>
          <FaRegUser size={20}/>
        </div>
      </div>
    </div>
  )
}

interface PopUpDetectionProps {
  img?: string;
  label: string;
  percent: number;
  setPopup: () => void;
}

const PopUpDetection:React.FC<PopUpDetectionProps> = ({label, img, percent, setPopup}) => {
  const printRef = useRef<HTMLDivElement>(null);

  const generatePdf = async () => {
    if (!printRef.current) return;

    const canvas = await html2canvas(printRef.current);
    const dataUrl = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("document.pdf");
};
  return (
    <div className='fixed z-50 bg-black bg-opacity-5 top-0 left-0 right-0 bottom-0 flex items-center justify-center'>
      <div className='bg-white absolute w-full h-full md:w-[80%] md:top-[80px] lg:max-w-[800px] rounded-lg p-5'>
        <div className='flex items-center justify-between text-slate-500'>
          <ArrowLeft  className='cursor-pointer hover:text-slate-400' onClick={() => setPopup()}/>
          <div onClick={generatePdf} className='flex items-center gap-x-2 cursor-pointer px-2 py-1 rounded-md border hover:bg-slate-100'>
            <p>Print</p>
            <Printer />
          </div>
        </div>

        <div ref={printRef} className='p-2'>
          <div className='mt-5 py-5 flex gap-5 items-center'>
            <div className='w-[200px] h-[200px] rounded-lg bg-slate-200'>
              <img src={img} alt="" />
            </div>
            <div className='p-3 rounded-lg bg-white w-[400px]'>
              <h5 className='border-b'>Prediction</h5>
              <div className='h-[90px]'>
                <h6 className='font-medium py-5 text-xl'>{label?label:<p className='opacity-50'>Diagnosis</p>}</h6>
                <div>
                  <div className="w-full bg-gray-200 rounded-full dark:bg-gray-700">
                    <div className="bg-orange-600 text-xs font-medium text-orange-100 text-center p-0.5 leading-none rounded-full" style={{ width: percent+'%' }}>{percent&&`${percent}%`}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className='p-3 border rounded-lg bg-white overflow-y-scroll max-h-[500px] output'>
            {/* <ContentRenderer content={result} /> */}
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Temporibus 
          </div>
        </div>
      </div>
    </div>
  )
}

interface DetectionResult {
  label: string
  confidences: {
    label: string;
    confidence: number;
  }[];
}

const detection = async (image:Blob) => {
  const client = await Client.connect("dielz/eye-disease-classification");
  const result = await client.predict("/predict", { 
    image: image, 
  });

  return result.data
}

interface HistoryDetectionType {
  img?: string;
  label: string;
  percent: number;
  recommendation: string;
}

const Detection:React.FC = () => {
  const navigate = useNavigate();
  const { user, getCookie } = useAuth();
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [label, setLabel] = useState<string|null>(null);
  const [result, setResult] = useState<string|null>(null);
  const [confidience, setConfidience] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [popUp, setPopUp] = useState<boolean>(false);
  const [isHistory, setIsHistory] = useState<boolean>(false);
  const [historyDetection, setHistoryDetection] = useState<HistoryDetectionType[]>([]);

  const handleNavigate = (img:string, label:string, percent:number, result:string) => {
    navigate('/history', {
      state: {img: img, label: label, percent: percent, result: result }, // Data yang dikirim
    });
  };

  useEffect(()=>{
    getCookie()
  }, [])

  // Disable body scroll when popup is open
  useEffect(() => {
    if (popUp) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    // Cleanup when component unmounts
    return () => {
      document.body.style.overflow = "";
    };
  }, [popUp]);

  // Fungsi untuk menangani unggah gambar
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      setImageUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Mencegah perilaku default membuka file
  };
  
  const handleDropOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Mencegah perilaku default membuka file
    const file = e.dataTransfer.files[0];
    setImage(file);
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageUrl(reader.result as string); // Menampilkan gambar di halaman
      };
      reader.readAsDataURL(file);
    }
  };

  // Fungsi untuk mengirim gambar ke API Gradio
  const handleSubmit = async () => {
    if (!image) {
      alert("Harap unggah gambar terlebih dahulu!");
      return;
    }

    setIsLoading(true);

    try {
      // Convert gambar menjadi Blob
      const imageBlob = await new Promise<Blob>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(new Blob([reader.result as ArrayBuffer], { type: image.type })); // Tambahkan tipe MIME dari file asli
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(image);
      });
      const result= await detection(imageBlob) as string[]

      let labelHistory = "";
      let percentHistory = 0;
      if (typeof result[0] == 'object' && result[0] !== null) {
        const data: DetectionResult = result[0]
        const labelObject = result[0] as { label: string };
        const confidence = data.confidences[0].confidence
        const confidencePercent = Math.round(confidence * 100)
        setLabel(labelObject.label)
        setConfidience(confidencePercent)
        labelHistory = labelObject.label;
        percentHistory = confidencePercent;
      }

      const cleanedResult = result[1]
        .replace(/Action:/g, '')
        .replace(/\(if applicable\):/gi, '')
        .replace(/style="[^"]*"/gi, "")
        .replace(/\(If Necessary\):/gi, '');

      setResult(cleanedResult)
      // Set History
      setHistoryDetection([
        ...historyDetection,
        { img: imageUrl || undefined, label: labelHistory || "No Label", percent: percentHistory, recommendation: cleanedResult }
      ]);
    } catch (error) {
      console.error("Terjadi kesalahan:", error);
      setResult("Terjadi kesalahan saat mengirim data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setImage(null);
    setImageUrl(null);
    setLabel(null);
    setResult(null);
    setConfidience(0);
  }

  return (
    <div className='bg-secondary relative pt-16'>
      <div className='bg-white fixed z-20 top-0 right-0 left-0'>
        <NavbarDetection username={user?.name} setHistory={()=>setIsHistory(!isHistory)}/>
      </div>
      <div className='max-w-[1600px] mx-auto md:p-10 min-h-screen'>
        <div className='grid md:grid-cols-2 gap-5'>
          <div>
            <div className='border p-3 rounded-lg bg-white min-h-[330px]'>
              {image ? (
                <div className='relative max-w-[300px] max-h-[300px] mx-auto'>
                  <div className={`${isLoading && 'loader1'} absolute rounded-lg`}></div>
                  <img src={imageUrl ?? ''} alt="Preview" className='mx-auto rounded-lg' style={{ maxWidth: "300px" }} />
                </div>
              ):(
                <div onDragOver={handleDragOver} onDrop={handleDropOver} className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                            </svg>
                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                        </div>
                        <input id="dropzone-file" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                </div> 
              )}
            </div>
            <div className='flex items-center gap-3'>
              <button onClick={handleClear} className={`mt-3 w-full border border-aksen hover:bg-orange-50 text-aksen font-medium py-2 px-4 rounded`}>
                Clear
              </button>
              <button onClick={handleSubmit} disabled={isLoading} className={`mt-3 w-full bg-aksen hover:bg-blue-900 text-white font-medium py-2 px-4 rounded`}>
                {isLoading? 'Detection...': 'Submit'}
              </button>
            </div>
            <div className=' mt-10 '>
              <p className='text-sm mb-2'>Examples</p>
              <div className='border rounded-lg flex items-center gap-x-2 bg-white p-2'>
                <div className='w-[100px] h-[100px] rounded-md bg-slate-200 overflow-hidden'><img src={sample1} className='w-full h-full object-cover'/></div>
                <div className='w-[100px] h-[100px] rounded-md bg-slate-200 overflow-hidden'><img src={sample2} className='w-full h-full object-cover'/></div>
                <div className='w-[100px] h-[100px] rounded-md bg-slate-200 overflow-hidden'><img src={sample3} className='w-full h-full object-cover'/></div>
                <div className='w-[100px] h-[100px] rounded-md bg-slate-200 overflow-hidden'><img src={sample4} className='w-full h-full object-cover'/></div>
              </div>
            </div>
            <div className='mt-10'>
              <h5 className='border-b pb-2 mb-5 text-sm'>Recent detection</h5>
              <div className='grid lg:grid-cols-2 items-center gap-3'>
                {historyDetection.slice(-2).map((item, index) => (
                  <div key={index} onClick={()=>handleNavigate(item.img !== undefined ? item.img : '', item.label, item.percent, item.recommendation)} className='flex items-center justify-between p-2 border rounded-md cursor-pointer mb-2 bg-white'>
                    <div className='flex items-center gap-x-3'>
                      <div className='w-[50px] h-[50px] rounded bg-slate-200 overflow-hidden'><img src={item.img} alt="" /></div>
                      <p>{item.label}</p>
                    </div>
                    {/* <p>{item.percent}%</p> */}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div>
            <div className='p-3 border rounded-lg bg-white'>
              <h5>Prediction</h5>
              <div className='h-[90px]'>
                <h6 className='font-medium text-center py-5 text-xl'>{label?label:<p className='opacity-50'>Diagnosis</p>}</h6>
                <div className='hidden'>
                  <div className="w-full bg-gray-200 rounded-full dark:bg-gray-700">
                    <div className="bg-aksen text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full" style={{ width: confidience+'%' }}>{confidience&&`${confidience}%`}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className='p-3 border rounded-lg mt-3 bg-white min-h-[600px] max-h-[700px] overflow-y-scroll output'>
              <ContentRenderer content={result} />
            </div>
          </div>
        </div>
      </div>

      {/* Popup */}
      {popUp && <PopUpDetection label='Catarac' percent={98} setPopup={() => setPopUp(false)}/>}
      

      {/* Sidebar history */}
      <div className={`fixed top-[90px] ${isHistory? 'right-5' : 'right-[-400px]'} overflow-hidden transition-all w-[400px] bottom-16 bg-white border rounded-lg shadow-sm`}>
          <div className='flex items-center justify-between p-3 border-b bg-slate-50'>
            <h5>History</h5>
            <ArrowRight onClick={()=>setIsHistory(false)} className=' text-slate-700 hover:text-slate-400 cursor-pointer'/>
          </div>
          <div className='p-3 mt-3'>
            {historyDetection.map((item, index) => (
              <div key={index} onClick={()=>handleNavigate(item.img !== undefined ? item.img : '', item.label, item.percent, item.recommendation)} className='flex items-center justify-between p-2 border rounded-md cursor-pointer mb-2'>
                <div className='flex items-center gap-x-3'>
                  <div className='w-[50px] h-[50px] rounded bg-slate-200 overflow-hidden'><img src={item.img} alt="" /></div>
                  <p>{item.label}</p>
                </div>
                {/* <p>{item.percent}%</p> */}
              </div>
            ))}
          </div>
      </div>
    </div>
  )
}

export default Detection