

const Canvas = ({ canvasDivRef }) => {

    return (
        <div ref={canvasDivRef} style={{
            transform: "scale(0.5)", // Scale down the canvas (adjust as needed)
            transformOrigin: "top left",
        }}>

            <canvas id='canvas' className='border border-black' />
        </div>
    )
}

export default Canvas;