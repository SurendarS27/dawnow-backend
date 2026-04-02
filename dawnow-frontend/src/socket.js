import { io } from 'socket.io-client'

const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

export const socket = io(SOCKET_URL, {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
})

export const connectSocket = (userRole) => {
    if (!socket.connected) {
        socket.connect()
        socket.emit('join', userRole)
    }
}

export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect()
    }
}

export default socket
