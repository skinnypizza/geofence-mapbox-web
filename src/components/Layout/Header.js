import { useAuth } from "@/context/AuthContext";

export default function Header() {
    const { currentUser, logout } = useAuth();

    return (
        <div className="bg-white border-b border-green-100 px-4 md:px-8 py-4 md:py-6 shadow-sm flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                    <svg className="text-white" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Gestor de Geocercas</h1>
                    <p className="text-sm text-gray-500">Administra tus cercas activas en tiempo real</p>
                </div>
            </div>
            {currentUser && (
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600 hidden md:inline">
                        {currentUser.email}
                    </span>
                    <button
                        onClick={logout}
                        className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            )}
        </div>
    );
}
