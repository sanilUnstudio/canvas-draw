import React from 'react'
import { FaPencil, FaEraser } from 'react-icons/fa6';
import * as NextImage from 'next/image';

const Draw = ({
    strokeWidth,
    setStrokeWidth,
    drawing,
    setDrawing,
    setEraserStatus,
    eraserStatus,
    base,
    assets,
    addImage,
    uploadProduct,
    currentCanvas
}) => {
    return (
        <div className='w-full h-screen overflow-auto'>
            <p className='text-center font-bold text-xl mt-8'>Add Image</p>
            <div className='w-full  px-2 pb-5 flex flex-wrap justify-center  content-start gap-3 pt-8  overflow-y-auto'>
                {assets && assets.length > 0 && assets.map((asset, index) => {
                    return (
                        <div key={index} className='group relative'>
                            <NextImage
                                width={130}
                                height={130}
                                src={asset}
                                alt='asset'
                                className='aspect-square p-2 border border-1 rounded-md object-contain cursor-pointer'
                                onClick={() => addImage(asset)}
                            />
                        </div>
                    );
                })}
            </div>

            <input type='file'
                id='input-product'
                onChange={uploadProduct}
                className='hidden' />
            <div className='flex flex-col gap-6 items-center'>
                <button onClick={() => document.getElementById('input-product').click()} className={`py-2 px-4 text-sm bg-[#1DB954] text-black  rounded-lg hover:border-black border-[#1DB954] hover:bg-white border `} > Add Product</button>
                <button onClick={() => currentCanvas.clear()} className={`py-2 px-4 text-sm bg-[#1DB954] text-black  rounded-lg hover:border-black border-[#1DB954] hover:bg-white border `} > Clear Canvas</button>

                <div className='flex xl:flex-row flex-col items-center gap-6 w-[80%] justify-between'>
                    <button onClick={base} className=' py-2 px-4 bg-[#fae27a] text-black  rounded-lg hover:border-black border-[#fae27a] hover:bg-white border'>base64</button>
                </div>
                <div className='w-1/2 flex flex-col gap-4'>
                    <label className='stroke-width text-lg font-bold'>
                        Stroke Width
                    </label>
                    <input
                        type='range'
                        min={1}
                        max={100}
                        value={strokeWidth / 1.25}
                        onChange={(event) =>
                            setStrokeWidth(event.target.valueAsNumber * 1.25)
                        }
                    />
                </div>
                <div className='w-1/2 flex justify-between items-center gap-2'>
                    <button
                        className={`aspect-square p-2 flex justify-center items-center rounded-md border border-white ${drawing && !eraserStatus
                            ? 'bg-white text-black'
                            : 'bg-black text-white'
                            }`}
                        onClick={() => { setDrawing(!drawing); setEraserStatus(false) }}
                    >
                        <FaPencil className='text-xl' />
                    </button>
                    <button
                        className={`aspect-square p-2 flex justify-center items-center rounded-md border border-white ${eraserStatus
                            ? 'bg-white text-black'
                            : 'bg-black text-white'
                            }`}
                        onClick={() => {
                            setEraserStatus(!eraserStatus)
                            if (!eraserStatus) {
                                setDrawing(false)
                            }
                        }}
                    >
                        <FaEraser className='text-xl' />
                    </button>
                </div>
                <div>
                </div>
            </div>
        </div>
    )
}

export default Draw