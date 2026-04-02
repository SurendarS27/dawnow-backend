import { createContext, useContext, useState, useEffect } from 'react'
import API from '../api/axios'

const AuthContext = createContext(null)

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(localStorage.getItem('dawnow_token'))
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem('dawnow_token')
            const storedUser = localStorage.getItem('dawnow_user')

            if (storedToken && storedUser) {
                try {
                    setUser(JSON.parse(storedUser))
                    // Verify token is still valid
                    const response = await API.get('/auth/me')
                    setUser(response.data)
                    localStorage.setItem('dawnow_user', JSON.stringify(response.data))
                } catch (error) {
                    console.error('Token validation failed:', error)
                    localStorage.removeItem('dawnow_token')
                    localStorage.removeItem('dawnow_user')
                    setToken(null)
                    setUser(null)
                }
            }
            setLoading(false)
        }

        initAuth()
    }, [])

    const login = async (username, password) => {
        try {
            const response = await API.post('/auth/login', { username, password })
            const { token: newToken, user: userData } = response.data

            localStorage.setItem('dawnow_token', newToken)
            localStorage.setItem('dawnow_user', JSON.stringify(userData))

            setToken(newToken)
            setUser(userData)

            return { success: true }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            }
        }
    }

    const logout = () => {
        localStorage.removeItem('dawnow_token')
        localStorage.removeItem('dawnow_user')
        setToken(null)
        setUser(null)
        window.location.href = '/login'
    }

    const updateProfile = async (formData) => {
        try {
            const response = await API.put('/auth/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            const updatedUser = response.data
            setUser(updatedUser)
            localStorage.setItem('dawnow_user', JSON.stringify(updatedUser))
            return { success: true, user: updatedUser }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Profile update failed'
            }
        }
    }

    const isAuthenticated = !!token && !!user

    const value = {
        user,
        token,
        login,
        logout,
        updateProfile,
        isAuthenticated,
        loading
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
