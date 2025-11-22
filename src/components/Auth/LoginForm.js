"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            setError("");
            setLoading(true);
            await login(email, password);
            router.push("/");
        } catch (err) {
            setError("Error al iniciar sesión: " + err.message);
        }
        setLoading(false);
    }

    return (
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg border border-green-100">
            <h2 className="text-2xl font-bold text-center text-gray-800">Iniciar Sesión</h2>
            {error && <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        required
                        className="w-full px-4 py-2 mt-1 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                    <input
                        type="password"
                        required
                        className="w-full px-4 py-2 mt-1 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button
                    disabled={loading}
                    type="submit"
                    className="w-full py-2 font-semibold text-white bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg hover:shadow-lg disabled:opacity-50"
                >
                    {loading ? "Cargando..." : "Entrar"}
                </button>
            </form>
            <div className="text-sm text-center text-gray-600">
                ¿No tienes cuenta?{" "}
                <Link href="/register" className="font-medium text-green-600 hover:underline">
                    Regístrate
                </Link>
            </div>
        </div>
    );
}
