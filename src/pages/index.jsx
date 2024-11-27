import dynamic from 'next/dynamic';
import { useState, useRef, useCallback, useEffect } from 'react';
const Canvas = dynamic(() => import('../components/canvas'), { ssr: false });
import { fabric } from 'fabric';
import Control from '@/components/Controls';
import { useOutsideClick } from '@/utils';

export default function Home() {
  const canvasRef = useRef([]);
  const canvasDivRef = useRef(null);
  const [data, setData] = useState([]);
  const [currentCanvas, setCurrentCanvas] = useState();
  const [eraserStatus, setEraserStatus] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [strokeWidth, setStrokeWidth] = useState(10);
  const [brush, setBrush] = useState();
  const [screenHeight, setScreenHeight] = useState();
  const [screenWidth, setScreenWidth] = useState();
  const assets = [
    'https://ik.imagekit.io/ei5bqbiry/unstudio_pictures_aseemkhanduja_gmail.com_image-1607_Y0XCEW8gCO.jpg?updatedAt=1698674245770',

    'https://ik.imagekit.io/ei5bqbiry/assets/aseemkhanduja_gmail.com_57.17765310165135_59aF6kbVt.png',

    'https://ik.imagekit.io/ei5bqbiry/assets/tanviagrawal99jln_gmail.com_1698300965_5560483227_SBA-WB8w6.png',

    'https://ik.imagekit.io/ei5bqbiry/assets/aseemkhanduja_gmail.com_487.5038167631852_jwLQ2zKg_.png'
  ];



  function addProduct(canvas, product) {
    if (canvas) {
      fabric.Image.fromURL(product, function (img) {

        // Calculate canvas dimensions based on the product image size and padding
        const newWidth = img.width;
        const newHeight = img.height;
        console.log("product:", { width: newWidth, height: newHeight })
        // Update canvas dimensions
        canvas.setWidth(newWidth);
        canvas.setHeight(newHeight);
        canvasDivRef.current.width = img.width;
        canvasDivRef.current.height = img.height;
        canvas.renderAll();
        // Center the image within the canvas
        img.set({
          left: 0,
          top: 0,
          transparentCorners: false,
          cornerStyle: 'circle',
          cornerSize: 12,
          erasable: false,
          crossOrigin: "anonymous",
          mask: false,
        });

        // Add the image to the canvas
        canvas.add(img);
        canvas.renderAll();
      }, { crossOrigin: 'anonymous' });
    }
  }

  function init(id) {
    const can = new fabric.Canvas('canvas', {
      stopContextMenu: false,
      fireRightClick: true,
      isDrawingMode: false,
      preserveObjectStacking: true,
      width: 500, // Temporary width
      height: 500, // Temporary height
      id: id,

    });
    can.renderAll();

    // Default settings for fabric.js objects
    fabric.Object.prototype.transparentCorners = false;
    fabric.Object.prototype.cornerStyle = 'rect';
    fabric.Object.prototype.cornerSize = 6;
    setCurrentCanvas(can);
    return can;
  }


  useEffect(() => {
    const canvas = init('container1');
    return () => {
      canvas.dispose();
    };
  }, []);

  const addImage = (image) => {
    addProduct(currentCanvas, image)
  }

  const uploadProduct = async (e) => {
    let file = e?.target.files[0];
    if (!file) return;
    const url = await convertToBase64(file)
    addProduct(currentCanvas, url);
    e.target.value = '';
  }

  useEffect(() => {
    if (currentCanvas) {
      currentCanvas.isDrawingMode = drawing || eraserStatus;
      if (brush) {
        currentCanvas.freeDrawingBrush = brush;
      }
      currentCanvas.freeDrawingBrush.color = "#000";
      currentCanvas.freeDrawingBrush.width = strokeWidth;
    }
  }, [currentCanvas, drawing, eraserStatus, brush, strokeWidth]);

  useEffect(() => {

    if (currentCanvas) {
      if (eraserStatus) {
        const eraser = new fabric.EraserBrush(currentCanvas, {
          strokeColor: 'rgba(0, 0, 0, 0.5)',
        });
        setBrush(eraser);
      } else {
        setBrush(new fabric.PencilBrush(currentCanvas));
        if (currentCanvas) {
          const drawnStrokes = currentCanvas.getObjects('path');
          if (drawnStrokes.length > 0) {
            drawnStrokes.forEach((stroke) => {
              stroke.selectable = false;
            });
            currentCanvas.renderAll();
          }
        }
      }
    }

  }, [currentCanvas, eraserStatus, drawing, setBrush]);


  async function cloneObject(object, scaleX, scaleY) {
    return new Promise((resolve) => {
      object.clone((clone) => {
        const width = clone.width * scaleX;
        const height = clone.height * scaleY;
        clone.scaleToHeight(height);
        clone.scaleToWidth(width);
        // Set the 'top' and 'left' of the cloned object to match the original object
        clone.set({
          left: object.left * scaleX,
          top: object.top * scaleY
        });
        resolve(clone);
      });
    });
  }

  const withoutBase64 = async (width, height) => {
    const dummyCanvas = new fabric.Canvas(
      'offscreen-fabric-without-background-canvas',
      {
        height: height,
        width: width,
      }
    );

    dummyCanvas.backgroundColor = '#fff'

    let scaleX = 1;
    let scaleY = 1;
    let allObjects = currentCanvas.getObjects();
    for (let obj of allObjects) {
      if ('mask' in obj && !obj.mask) {
        const objClone = fabric.util.object.clone(obj);
        const width = objClone.getScaledWidth() * scaleX;
        const height = objClone.getScaledHeight() * scaleY;
        objClone.scaleToHeight(height);
        objClone.scaleToWidth(width);
        objClone.set({
          left: objClone.left * scaleX,
          top: objClone.top * scaleY
        })
        dummyCanvas.add(objClone);
      } else if ('mask' in obj && obj.mask) {
        const objClone = fabric.util.object.clone(obj);
        const width = objClone.getScaledWidth() * scaleX;
        const height = objClone.getScaledHeight() * scaleY;
        objClone.scaleToHeight(height);
        objClone.scaleToWidth(width);
        objClone.set({
          left: objClone.left * scaleX,
          top: objClone.top * scaleY
        })
        dummyCanvas.add(objClone);
      } else {
        const objClone = await cloneObject(obj, scaleX, scaleY);
        objClone.stroke = '#fff'
        // dummyCanvas.add(objClone);
      }

    };

    const dataURL = dummyCanvas.toDataURL();
    return dataURL;
  }

  const inverse = async (width, height) => {

    const dummyCanvas = new fabric.Canvas(
      'offscreen-fabric-without-background-canvas',
      {
        height: height,
        width: width,
      }
    );

    dummyCanvas.backgroundColor = '#000'

    let scaleX = 1;
    let scaleY = 1;
    let allObjects = currentCanvas.getObjects();
    for (let obj of allObjects) {
      if ('mask' in obj && !obj.mask) {
        const objClone = fabric.util.object.clone(obj);
        const width = objClone.getScaledWidth() * scaleX;
        const height = objClone.getScaledHeight() * scaleY;
        objClone.scaleToHeight(height);
        objClone.scaleToWidth(width);
        objClone.set({
          left: objClone.left * scaleX,
          top: objClone.top * scaleY
        })
        // dummyCanvas.add(objClone);
      } else if ('mask' in obj && obj.mask) {
        const objClone = fabric.util.object.clone(obj);
        const width = objClone.getScaledWidth() * scaleX;
        const height = objClone.getScaledHeight() * scaleY;
        objClone.scaleToHeight(height);
        objClone.scaleToWidth(width);
        objClone.set({
          left: objClone.left * scaleX,
          top: objClone.top * scaleY
        })
        // dummyCanvas.add(objClone);
      } else {
        const objClone = await cloneObject(obj, scaleX, scaleY);
        objClone.stroke = '#fff'
        dummyCanvas.add(objClone);
      }

    };

    const dataURL = dummyCanvas.toDataURL();
    return dataURL;
  }

  const base = async () => {
    const base1 = await inverse(currentCanvas.width, currentCanvas.height);
    let base2 = await withoutBase64(currentCanvas.width, currentCanvas.height);
    // const link = document.createElement("a");
    // link.target = "_blank"; // Open the link in a new tab
    // link.href = base2;
    // link.click();

    // Ensure base1 is a valid Base64 string and prepend the data URL prefix
    if (!base2.startsWith("data:image")) {
      // Add the proper data URL prefix if not already present
      base2 = `data:image/png;base64,${base2}`;
    }

    // Create a new window with the Base64 image
    const newTab = window.open();
    if (newTab) {
      newTab.document.write(`<img src="${base1}" alt="Generated Image" style="width: 100%; height: 100%;object-fit:contain">`);
      newTab.document.close();
    } else {
      console.error("Failed to open a new tab. Please check browser settings.");
    }

    console.log({ withoutBase64: base2, inverse: base1})
  }

  const handleDeselectPropsClickOutside = () => {
    currentCanvas.discardActiveObject()
    currentCanvas.renderAll();
  }

  useOutsideClick(canvasDivRef, handleDeselectPropsClickOutside)

  return (
    <div className='h-screen w-full flex'>

      <div className='w-[250px] xl:w-[350px] flex flex-col gap-12 h-full overflow-hidden bg-black text-white'>
        <Control
          strokeWidth={strokeWidth}
          setStrokeWidth={setStrokeWidth}
          drawing={drawing}
          setDrawing={setDrawing}
          setEraserStatus={setEraserStatus}
          base={base}
          eraserStatus={eraserStatus}
          canvas={currentCanvas}
          assets={assets}
          addImage={addImage}
          uploadProduct={uploadProduct}
          currentCanvas={currentCanvas}
        />
      </div>


      <div className=' w-[calc(100%-250px)] xl:w-[calc(100%-350px)] h-full'>
        <div className='w-full h-full  p-2 '>
          <div
            ref={canvasDivRef} style={{
              width: currentCanvas?.width ? currentCanvas.width :'500px',
              height: currentCanvas?.height ? currentCanvas.height :'500px',
            transform: "scale(0.5)", // Scale down the canvas (adjust as needed)
            transformOrigin: "top left",
          }}>
            <canvas id='canvas' className='border border-black' />
          </div>
        </div>
      </div>


      <div className='hidden'>
        <canvas id="base64" />
      </div>
    </div>
  )
}


const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.readAsDataURL(file)
    fileReader.onload = () => {
      resolve(fileReader.result)
    }
    fileReader.onerror = (error) => {
      reject(error)
    }
  })
}