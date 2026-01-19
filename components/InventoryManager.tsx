
import React, { useState, useRef } from 'react';
import { Ingredient, Product, ProductRecipe } from '../types';
import { Package, Scale, Edit3, Plus, X, Trash2, Save, ShoppingCart, Utensils, Image as ImageIcon, UploadCloud, AlertCircle } from 'lucide-react';

interface InventoryManagerProps {
  ingredients: Ingredient[];
  products: Product[];
  onUpdateRecipe: (productId: string, newRecipe: ProductRecipe[]) => void;
  onUpdateIngredient: (ing: Ingredient) => void;
  onAddIngredient: (ing: Ingredient) => void;
  onAddProduct: (prod: Product) => void;
}

const DEFAULT_CATEGORIES = ['Cafés', 'Bebidas', 'Vinos', 'Cervezas', 'Comida Rápida', 'Tapas', 'Postres', 'General'];

const InventoryManager: React.FC<InventoryManagerProps> = ({ 
  ingredients, 
  products, 
  onUpdateRecipe,
  onUpdateIngredient,
  onAddIngredient,
  onAddProduct
}) => {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [tempRecipe, setTempRecipe] = useState<ProductRecipe[]>([]);
  const [newProdData, setNewProdData] = useState({ 
    name: '', 
    price: 0, 
    category: 'General',
    imageUrl: '',
    customCategory: ''
  });

  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);

  // Ingredient Modal Logic
  const openEditIngredient = (ing: Ingredient) => {
    setEditingIngredient({ ...ing });
  };

  const handleSaveIngredient = () => {
    if (editingIngredient) {
      onUpdateIngredient(editingIngredient);
      setEditingIngredient(null);
    }
  };

  // Recipe Modal Logic
  const openEditRecipe = (product: Product) => {
    setEditingProduct(product);
    setTempRecipe([...product.recipe]);
    setErrorMessage(null);
  };

  const handleUpdateRecipeItem = (index: number, quantity: number) => {
    if (isNaN(quantity) || quantity < 0) return;
    const newRecipe = [...tempRecipe];
    newRecipe[index] = { ...newRecipe[index], quantity };
    setTempRecipe(newRecipe);
  };

  const handleAddRecipeItem = () => {
    const availableIngredient = ingredients.find(ing => !tempRecipe.some(r => r.ingredientId === ing.id));
    setTempRecipe([...tempRecipe, { ingredientId: availableIngredient?.id || ingredients[0].id, quantity: 0 }]);
    setErrorMessage(null);
  };

  const handleSaveRecipe = () => {
    if (tempRecipe.length === 0) {
      setErrorMessage("La receta no puede estar vacía. Añade al menos un ingrediente.");
      return;
    }
    if (editingProduct) {
      onUpdateRecipe(editingProduct.id, tempRecipe);
      setEditingProduct(null);
    }
  };

  // Image Upload Logic
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProdData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // New Product Logic
  const handleCreateProduct = () => {
    if (!newProdData.name || newProdData.price <= 0) {
      setErrorMessage("Por favor, introduce un nombre y un precio válido.");
      return;
    }
    if (tempRecipe.length === 0) {
      setErrorMessage("Error: La receta está vacía. Debes añadir ingredientes para controlar el stock.");
      return;
    }

    const finalCategory = newProdData.category === 'OTRA' ? newProdData.customCategory : newProdData.category;
    
    if (newProdData.category === 'OTRA' && !newProdData.customCategory) {
      setErrorMessage("Por favor, especifica la nueva categoría.");
      return;
    }

    const newProd: Product = {
      id: 'p' + Math.random().toString(36).substr(2, 5),
      name: newProdData.name,
      price: newProdData.price,
      category: finalCategory || 'General',
      recipe: tempRecipe,
      imageUrl: newProdData.imageUrl || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=200&auto=format&fit=crop'
    };

    if (newProdData.category === 'OTRA' && !categories.includes(newProdData.customCategory)) {
      setCategories(prev => [...prev, newProdData.customCategory]);
    }

    onAddProduct(newProd);
    setIsCreatingProduct(false);
    setTempRecipe([]);
    setNewProdData({ name: '', price: 0, category: 'General', imageUrl: '', customCategory: '' });
    setErrorMessage(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Materias Primas e Inventario</h2>
        <div className="flex gap-4">
          <button 
            onClick={() => { 
              setIsCreatingProduct(true); 
              setTempRecipe([]); 
              setNewProdData({ name: '', price: 0, category: 'General', imageUrl: '', customCategory: '' });
              setErrorMessage(null);
            }}
            className="flex items-center gap-2 bg-gray-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-gray-200"
          >
            <Utensils size={18} /> Nuevo Producto
          </button>
          <button className="flex items-center gap-2 bg-orange-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-100">
            <Plus size={18} /> Nuevo Ingrediente
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ingredients.map(ing => {
          const isLow = ing.stock <= ing.minStock;
          const isCritical = ing.stock <= (ing.minStock * 0.5);
          
          return (
            <div key={ing.id} className={`bg-white p-6 rounded-3xl border shadow-sm relative group overflow-hidden transition-all ${isLow ? 'border-orange-200 ring-2 ring-orange-50' : ''}`}>
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => openEditIngredient(ing)}
                  className="p-2 bg-gray-50 text-gray-400 hover:text-orange-600 rounded-lg shadow-sm"
                >
                  <Edit3 size={18} />
                </button>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isLow ? 'bg-orange-100 text-orange-600' : 'bg-orange-50 text-orange-600'}`}>
                  <Package size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{ing.name}</h3>
                  <p className="text-xs text-gray-400 uppercase font-black tracking-widest">{ing.id}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Stock Actual</p>
                    <p className={`text-2xl font-black ${isLow ? 'text-orange-600' : 'text-gray-800'}`}>
                      {ing.stock.toFixed(2)} <span className="text-sm font-normal text-gray-400">{ing.unit}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Límite Mínimo</p>
                    <p className="text-sm font-bold text-red-500 underline decoration-dotted">{ing.minStock} {ing.unit}</p>
                  </div>
                </div>

                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      isCritical ? 'bg-red-500 animate-pulse' : 
                      isLow ? 'bg-orange-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(100, (ing.stock / (ing.minStock * 2)) * 100)}%` }}
                  />
                </div>
                {isLow && (
                  <div className="flex items-center gap-1 text-[10px] font-black text-orange-600 uppercase">
                    <AlertCircle size={12} className="animate-bounce" />
                    <span>⚠️ Stock bajo el mínimo</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Scale className="text-orange-600" /> Definición de Recetas y Márgenes
        </h2>
        <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-sm">
              <tr>
                <th className="px-6 py-4 font-semibold">Producto de Venta</th>
                <th className="px-6 py-4 font-semibold">Composición / Receta</th>
                <th className="px-6 py-4 font-semibold">Coste MP</th>
                <th className="px-6 py-4 font-semibold">Margen Bruto</th>
                <th className="px-6 py-4 font-semibold text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map(p => {
                const totalCost = p.recipe.reduce((sum, item) => {
                  const ing = ingredients.find(i => i.id === item.ingredientId);
                  return sum + (item.quantity * (ing?.costPerUnit || 0));
                }, 0);
                const margin = p.price > 0 ? ((p.price - totalCost) / p.price) * 100 : 0;

                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                        <div>
                          <p className="font-bold text-gray-800">{p.name}</p>
                          <p className="text-[10px] text-gray-400 uppercase font-bold">{p.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {p.recipe.map((r, i) => {
                          const ing = ingredients.find(ing => ing.id === r.ingredientId);
                          return (
                            <span key={i} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-[10px] font-bold">
                              {r.quantity} {ing?.unit} {ing?.name}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-700">{totalCost.toFixed(2)}€</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-black ${margin > 60 ? 'bg-green-100 text-green-700' : margin > 30 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                        {margin.toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => openEditRecipe(p)}
                        className="text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1 ml-auto"
                      >
                        <Edit3 size={16} /> Editar Receta
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Editar Ingrediente (Min Stock & Cost) */}
      {editingIngredient && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">Gestionar Materia Prima</h3>
              <button onClick={() => setEditingIngredient(null)}><X className="text-gray-400" /></button>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="text-xs font-black text-gray-400 uppercase mb-2 block">Nombre del Ingrediente</label>
                <input 
                  type="text" 
                  className="w-full bg-gray-50 border rounded-2xl p-4 outline-none focus:ring-2 focus:ring-orange-100 font-bold"
                  value={editingIngredient.name}
                  onChange={e => setEditingIngredient({...editingIngredient, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase mb-2 block">Stock Actual ({editingIngredient.unit})</label>
                  <input 
                    type="number" 
                    className="w-full bg-gray-50 border rounded-2xl p-4 outline-none focus:ring-2 focus:ring-orange-100 font-bold"
                    value={editingIngredient.stock}
                    onChange={e => setEditingIngredient({...editingIngredient, stock: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-orange-600 uppercase mb-2 block">Stock Mínimo ({editingIngredient.unit})</label>
                  <input 
                    type="number" 
                    className="w-full bg-orange-50 border-orange-200 border rounded-2xl p-4 outline-none focus:ring-2 focus:ring-orange-200 font-bold text-orange-700"
                    value={editingIngredient.minStock}
                    onChange={e => setEditingIngredient({...editingIngredient, minStock: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-black text-gray-400 uppercase mb-2 block">Coste por Unidad (€ / {editingIngredient.unit})</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="w-full bg-gray-50 border rounded-2xl p-4 outline-none focus:ring-2 focus:ring-orange-100 font-bold"
                  value={editingIngredient.costPerUnit}
                  onChange={e => setEditingIngredient({...editingIngredient, costPerUnit: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>
            <div className="p-8 border-t bg-gray-50">
              <button onClick={handleSaveIngredient} className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black shadow-xl shadow-orange-100 hover:bg-orange-700 transition-all flex items-center justify-center gap-2">
                <Save size={20} /> Guardar Cambios de Almacén
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Crear / Editar Receta de Producto */}
      {(editingProduct || isCreatingProduct) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b bg-gray-50 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">
                  {isCreatingProduct ? 'Nuevo Producto y Receta' : `Receta: ${editingProduct?.name}`}
                </h3>
                <p className="text-sm text-gray-500 font-medium">Define los ingredientes y proporciones exactas.</p>
              </div>
              <button onClick={() => { setEditingProduct(null); setIsCreatingProduct(false); }}><X className="text-gray-400" /></button>
            </div>
            
            <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar space-y-8">
              {errorMessage && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-center gap-3 animate-pulse">
                  <AlertCircle className="text-red-500" size={20} />
                  <p className="text-sm font-bold text-red-700">{errorMessage}</p>
                </div>
              )}

              {isCreatingProduct && (
                <div className="space-y-6">
                  <div className="flex gap-6 items-start">
                    {/* Image Upload Area */}
                    <div className="w-32 h-32 flex-shrink-0">
                      <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">Imagen</label>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-orange-300 transition-all overflow-hidden relative group"
                      >
                        {newProdData.imageUrl ? (
                          <>
                            <img src={newProdData.imageUrl} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                              <UploadCloud size={24} />
                            </div>
                          </>
                        ) : (
                          <>
                            <ImageIcon size={24} className="text-gray-300" />
                            <span className="text-[10px] font-bold text-gray-400">Subir</span>
                          </>
                        )}
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleImageChange}
                      />
                    </div>

                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="text-xs font-black text-gray-400 uppercase mb-2 block">Nombre del Producto</label>
                        <input 
                          type="text" 
                          placeholder="Ej. Hamburguesa BBQ, Té Matcha..."
                          className="w-full bg-gray-50 border rounded-2xl p-3 outline-none focus:ring-2 focus:ring-orange-100 font-bold"
                          value={newProdData.name}
                          onChange={e => { setNewProdData({...newProdData, name: e.target.value}); setErrorMessage(null); }}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-black text-gray-400 uppercase mb-2 block">Precio Venta (€)</label>
                        <input 
                          type="number" 
                          step="0.10"
                          className="w-full bg-gray-50 border rounded-2xl p-3 outline-none focus:ring-2 focus:ring-orange-100 font-bold"
                          value={newProdData.price}
                          onChange={e => { setNewProdData({...newProdData, price: parseFloat(e.target.value) || 0}); setErrorMessage(null); }}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-black text-gray-400 uppercase mb-2 block">Categoría</label>
                        <select 
                          className="w-full bg-gray-50 border rounded-2xl p-3 outline-none focus:ring-2 focus:ring-orange-100 font-bold"
                          value={newProdData.category}
                          onChange={e => { setNewProdData({...newProdData, category: e.target.value}); setErrorMessage(null); }}
                        >
                          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                          <option value="OTRA">+ Nueva categoría...</option>
                        </select>
                      </div>
                      {newProdData.category === 'OTRA' && (
                        <div className="col-span-2 animate-in slide-in-from-top-2">
                          <label className="text-xs font-black text-orange-600 uppercase mb-2 block">Nombre de la Nueva Categoría</label>
                          <input 
                            type="text" 
                            className="w-full bg-orange-50 border-orange-200 border rounded-2xl p-3 outline-none focus:ring-2 focus:ring-orange-200 font-bold"
                            placeholder="Escribe el nombre de la categoría..."
                            value={newProdData.customCategory}
                            onChange={e => setNewProdData({...newProdData, customCategory: e.target.value})}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h4 className="text-xs font-black text-orange-600 uppercase tracking-widest">Composición de la Receta</h4>
                  <span className="text-[10px] text-gray-400 font-bold italic">Imprescindible para el control de inventario automático.</span>
                </div>
                
                {tempRecipe.length === 0 && (
                  <div className="p-8 text-center text-gray-400 border-2 border-dashed rounded-3xl bg-gray-50 flex flex-col items-center gap-2">
                    <ShoppingCart size={32} className="opacity-20" />
                    <p className="font-bold">Añade al menos un ingrediente para completar el producto.</p>
                  </div>
                )}

                {tempRecipe.map((item, index) => (
                  <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 items-end group animate-in fade-in slide-in-from-right-2">
                    <div className="flex-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Materia Prima</label>
                      <select 
                        className="w-full bg-white border rounded-xl py-2 px-3 outline-none font-bold text-gray-700"
                        value={item.ingredientId}
                        onChange={e => {
                          const n = [...tempRecipe];
                          n[index].ingredientId = e.target.value;
                          setTempRecipe(n);
                        }}
                      >
                        {ingredients.map(i => <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}
                      </select>
                    </div>
                    <div className="w-24">
                      <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Cantidad</label>
                      <input 
                        type="number" 
                        step="0.001"
                        className="w-full bg-white border rounded-xl py-2 px-3 outline-none font-bold"
                        value={item.quantity}
                        onChange={e => handleUpdateRecipeItem(index, parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <button 
                      onClick={() => { setTempRecipe(tempRecipe.filter((_, i) => i !== index)); setErrorMessage(null); }}
                      className="p-2 text-gray-300 hover:text-red-500 transition-colors mb-1"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
                
                <button 
                  onClick={handleAddRecipeItem}
                  className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-bold flex items-center justify-center gap-2 hover:border-orange-200 hover:text-orange-600 transition-all"
                >
                  <Plus size={20} /> Añadir Ingrediente a Receta
                </button>
              </div>
            </div>

            <div className="p-8 border-t bg-gray-50 flex gap-4">
               <button 
                onClick={() => { setEditingProduct(null); setIsCreatingProduct(false); setErrorMessage(null); }}
                className="flex-1 py-4 bg-white border rounded-2xl font-black text-gray-400 hover:bg-gray-100 transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={isCreatingProduct ? handleCreateProduct : handleSaveRecipe}
                className="flex-[2] py-4 bg-gray-900 text-white rounded-2xl font-black shadow-xl shadow-gray-200 hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
              >
                <Save size={20} /> {isCreatingProduct ? 'Crear Producto Maestro' : 'Guardar Receta Actualizada'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManager;
