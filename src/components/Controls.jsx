import { useState, useEffect } from "react";
import Draw from "./controls/draw";
import Arrange from "./controls/arrange";
const Control = ({
    strokeWidth,
    setStrokeWidth,
    drawing,
    setDrawing,
    setEraserStatus,
    eraserStatus,
    base,
    print,
    assets,
    addImage,
    uploadProduct,
    currentCanvas
}) => {

    return (
        <div>
                <Draw
                    strokeWidth={strokeWidth}
                    setStrokeWidth={setStrokeWidth}
                    drawing={drawing}
                    setDrawing={setDrawing}
                    setEraserStatus={setEraserStatus}
                    eraserStatus={eraserStatus}
                    base={base}
                    print={print}
                    assets={assets}
                    addImage={addImage}
                    uploadProduct={uploadProduct}
                    currentCanvas={currentCanvas}
                />
        </div>
    )
}

export default Control