
import React, { useState } from 'react';
import { User } from '../types';
import { UserPlus, Shield, User as UserIcon, Trash2, Key, Edit3, X, Save, CheckCircle2 } from 'lucide-react';

interface UserManagerProps {
  users: User[];
  onUpdateUsers: (users: User[]) => void;
}

const UserManager: React.FC<UserManagerProps> = ({ users, onUpdateUsers }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User>>({ name: '', role: 'vendedor', pin: '' });
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const handleAddUser = () => {
    if (newUser.name && newUser.pin) {
      const userToAdd: User = {
        id: 'u' + Math.random().toString(36).substr(2, 5),
        name: newUser.name,
        role: newUser.role as 'admin' | 'vendedor',
        pin: newUser.pin
      };
      onUpdateUsers([...users, userToAdd]);
      setIsAdding(false);
      setNewUser({ name: '', role: 'vendedor', pin: '' });
    }
  };

  const handleDeleteUser = (id: string) => {
    if (users.length <= 1) {
      alert("Debe haber al menos un usuario en el sistema.");
      return;
    }
    if (confirm("¿Seguro que quieres eliminar a este vendedor?")) {
      onUpdateUsers(users.filter(u => u.id !== id));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Gestión de Equipo</h2>
          <p className="text-gray-500 font-medium">Administra quién tiene acceso al TPV y sus permisos.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-orange-600 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-orange-100 hover:bg-orange-700 transition-all flex items-center gap-2"
        >
          <UserPlus size={18} /> Nuevo Vendedor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(user => (
          <div key={user.id} className="bg-white p-8 rounded-[2.5rem] border shadow-sm group hover:border-orange-200 transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${user.role === 'admin' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'}`}>
                {user.role === 'admin' ? <Shield size={28} /> : <UserIcon size={28} />}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight truncate">{user.name}</h3>
              <p className={`text-[10px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'text-orange-600' : 'text-gray-400'}`}>
                {user.role}
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-dashed flex justify-between items-center">
              <div className="flex items-center gap-2 text-gray-400">
                <Key size={14} />
                <span className="text-xs font-mono font-bold tracking-widest">****</span>
              </div>
              <span className="text-[10px] font-black text-gray-300 uppercase">ID: {user.id}</span>
            </div>
          </div>
        ))}
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 bg-gray-50 border-b flex justify-between items-center">
              <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">Alta de Personal</h3>
              <button onClick={() => setIsAdding(false)}><X className="text-gray-400" /></button>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="text-xs font-black text-gray-400 uppercase mb-2 block">Nombre Completo</label>
                <input 
                  autoFocus
                  type="text" 
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 outline-none focus:ring-4 focus:ring-orange-100 font-bold"
                  placeholder="Ej. Juan Pérez"
                  value={newUser.name}
                  onChange={e => setNewUser({...newUser, name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-black text-gray-400 uppercase mb-2 block">Rol / Permisos</label>
                <div className="grid grid-cols-2 gap-3">
                   <button 
                    onClick={() => setNewUser({...newUser, role: 'vendedor'})}
                    className={`p-4 border-2 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${newUser.role === 'vendedor' ? 'border-orange-600 bg-orange-50 text-orange-600' : 'border-gray-100 text-gray-400'}`}
                   >
                     Vendedor
                   </button>
                   <button 
                    onClick={() => setNewUser({...newUser, role: 'admin'})}
                    className={`p-4 border-2 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${newUser.role === 'admin' ? 'border-orange-600 bg-orange-50 text-orange-600' : 'border-gray-100 text-gray-400'}`}
                   >
                     Admin
                   </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-black text-gray-400 uppercase mb-2 block">PIN de Acceso (4 dígitos)</label>
                <input 
                  type="password" 
                  maxLength={4}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 outline-none focus:ring-4 focus:ring-orange-100 font-mono font-black text-2xl text-center tracking-[1em]"
                  placeholder="****"
                  value={newUser.pin}
                  onChange={e => setNewUser({...newUser, pin: e.target.value})}
                />
              </div>
            </div>
            <div className="p-8 border-t bg-gray-50 flex gap-3">
              <button onClick={() => setIsAdding(false)} className="flex-1 py-4 bg-white text-gray-400 rounded-2xl font-black uppercase text-xs tracking-widest">Cancelar</button>
              <button onClick={handleAddUser} className="flex-1 py-4 bg-orange-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-orange-100">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManager;
