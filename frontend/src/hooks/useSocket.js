import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

export default function useSocket(shopId) {
    const ref = useRef();
    useEffect(() => {
        const url = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
        const s = io(`${url}/realtime`, {
            withCredentials: true,
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
        });
        s.emit("join-shop", { shopId });
        ref.current = s;
        return () => s.close();
    }, [shopId]);
    return ref;
}
