import { ExternalLink } from 'lucide-react'

const Footer = () => {
    return (
        <div className="w-full text-center py-4 mt-6">
            <a
                href="https://nexoracrew.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-green transition-all duration-300 group"
            >
                <span className="opacity-70 group-hover:opacity-100">
                    Powered by
                </span>

                <span className="bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent font-bold drop-shadow-[0_0_6px_rgba(34,197,94,0.4)] group-hover:drop-shadow-[0_0_10px_rgba(34,197,94,0.7)]">
                    NexoraCrew
                </span>

                <ExternalLink
                    size={16}
                    className="opacity-60 group-hover:translate-x-1 group-hover:opacity-100 transition-all"
                />
            </a>
        </div>
    )
}

export default Footer
