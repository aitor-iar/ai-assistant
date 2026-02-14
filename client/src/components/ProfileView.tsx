import { useAuth } from "../context/AuthProvider";
import { LogOut, Mail, Calendar } from "lucide-react";

interface ProfileViewProps {
  onBack: () => void;
}

export function ProfileView({ }: ProfileViewProps) {
  const { user, signOut } = useAuth();

  const createdAt = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="mx-auto w-full max-w-2xl p-4 sm:p-6">

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Perfil</h2>

        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
            <Mail size={18} className="text-gray-500 dark:text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.email}</p>
            </div>
          </div>

          {createdAt && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <Calendar size={18} className="text-gray-500 dark:text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Cuenta creada</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{createdAt}</p>
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => void signOut()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg dark:text-primary-400 font-medium transition-colors"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
