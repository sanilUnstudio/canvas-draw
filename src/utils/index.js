import { useEffect } from "react";
export const useOutsideClick = (
    ref1,
    callback
) => {
    const handleClick = (e) => {
        if (ref1.current && !ref1.current.contains(e.target)) {
            callback?.();
        }
    }

    useEffect(() => {
        document.addEventListener('click', handleClick)
        return () => {
            document.removeEventListener('click', handleClick)
        }
    }, [ref1, callback]) // Add dependencies to avoid adding/removing the event listener unnecessarily
}