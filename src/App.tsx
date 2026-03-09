/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FlaskConical, 
  TrendingUp, 
  Layers, 
  ClipboardList, 
  RotateCcw, 
  Calculator,
  AlertTriangle,
  DollarSign,
  Droplets,
  Package,
  Save,
  Trash2,
  ChevronDown
} from 'lucide-react';

interface Formula {
  id: number;
  name: string;
  size: number;
  concentration: number;
}

export default function App() {
  // 1. Formula Architect State
  const [formulaSize, setFormulaSize] = useState<string>('');
  const [formulaConc, setFormulaConc] = useState<string>('30');
  const [formulaResult, setFormulaResult] = useState<{ oil: number; carrier: number } | null>(null);
  const [formulaName, setFormulaName] = useState<string>('');
  const [savedFormulas, setSavedFormulas] = useState<Formula[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  // Fetch formulas on mount
  useEffect(() => {
    fetch('/api/formulas')
      .then(res => res.json())
      .then(data => setSavedFormulas(data))
      .catch(err => console.error('Failed to fetch formulas:', err));
  }, []);

  const saveFormula = async () => {
    if (!formulaName || !formulaSize || !formulaConc) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/formulas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formulaName,
          size: parseFloat(formulaSize),
          concentration: parseFloat(formulaConc)
        })
      });
      const newFormula = await res.json();
      setSavedFormulas([newFormula, ...savedFormulas]);
      setFormulaName('');
    } catch (err) {
      console.error('Failed to save formula:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteFormula = async (id: number) => {
    try {
      await fetch(`/api/formulas/${id}`, { method: 'DELETE' });
      setSavedFormulas(savedFormulas.filter(f => f.id !== id));
    } catch (err) {
      console.error('Failed to delete formula:', err);
    }
  };

  const loadFormula = (formula: Formula) => {
    setFormulaSize(formula.size.toString());
    setFormulaConc(formula.concentration.toString());
    setBatchSize(formula.size.toString());
    setBatchConc(formula.concentration.toString());
    setShowSaved(false);
  };

  // 2. Profit Clarity State
  const [costs, setCosts] = useState({
    oil: '',
    base: '',
    bottle: '',
    pack: '',
    ship: '',
    sell: ''
  });
  const [profitResult, setProfitResult] = useState<{ totalCost: number; profit: number; margin: number } | null>(null);

  // 3. Batch Execution State
  const [batchQty, setBatchQty] = useState<string>('');
  const [batchSize, setBatchSize] = useState<string>('');
  const [batchConc, setBatchConc] = useState<string>('30');
  const [batchResult, setBatchResult] = useState<{ oil: number; carrier: number; total: number } | null>(null);

  // 4. Inventory Control State
  const [inventory, setInventory] = useState({
    oil: '',
    base: '',
    bottles: '',
    labels: '',
    conc: '30',
    size: '200'
  });
  const [inventoryResult, setInventoryResult] = useState<{ maxUnits: number; isLow: boolean } | null>(null);

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
  };

  const formatVolume = (num: number) => {
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ml';
  };

  // Calculations
  const calcFormula = () => {
    const size = parseFloat(formulaSize);
    const conc = parseFloat(formulaConc) / 100;
    if (size && conc) {
      const oil = size * conc;
      const carrier = size - oil;
      setFormulaResult({ oil, carrier });
    }
  };

  const calcProfit = () => {
    const totalCost = 
      (parseFloat(costs.oil) || 0) + 
      (parseFloat(costs.base) || 0) + 
      (parseFloat(costs.bottle) || 0) + 
      (parseFloat(costs.pack) || 0) + 
      (parseFloat(costs.ship) || 0);
    const sellingPrice = parseFloat(costs.sell);
    if (sellingPrice) {
      const profit = sellingPrice - totalCost;
      const margin = (profit / sellingPrice) * 100;
      setProfitResult({ totalCost, profit, margin });
    }
  };

  const calcBatch = () => {
    const qty = parseFloat(batchQty);
    const size = parseFloat(batchSize);
    const conc = parseFloat(batchConc) / 100;
    if (qty && size && conc) {
      const oilPer = size * conc;
      const basePer = size - oilPer;
      setBatchResult({
        oil: oilPer * qty,
        carrier: basePer * qty,
        total: size * qty
      });
    }
  };

  const calcInventory = () => {
    const stockOil = parseFloat(inventory.oil) || 0;
    const stockBase = parseFloat(inventory.base) || 0;
    const stockBot = parseFloat(inventory.bottles) || 0;
    const stockLab = parseFloat(inventory.labels) || 0;
    const targetSize = parseFloat(inventory.size);
    const targetConc = parseFloat(inventory.conc) / 100;

    if (targetSize && targetConc) {
      const oilReq = targetSize * targetConc;
      const baseReq = targetSize * (1 - targetConc);

      const capOil = Math.floor(stockOil / oilReq);
      const capBase = Math.floor(stockBase / baseReq);
      
      const maxUnits = Math.min(capOil, capBase, stockBot, stockLab);
      const limits = [capOil, capBase, stockBot, stockLab];
      const isLow = Math.max(...limits) > maxUnits * 1.5;

      setInventoryResult({ maxUnits, isLow });
    }
  };

  const resetAll = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto">
      {/* Header */}
      <header className="text-center mb-16 border-b border-dark-gold pb-12">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-5xl md:text-7xl text-gold tracking-[12px] uppercase mb-4 drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]"
        >
          Oud & Co.
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="font-serif italic text-xl text-soft-gold opacity-90 tracking-[3px]"
        >
          Where Every Scent Tells a Story
        </motion.p>
        <div className="mt-8 text-gold text-xs tracking-[5px] font-semibold uppercase">
          Production Calculator
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-24">
        
        {/* 1. Formula Architect */}
        <motion.section 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="luxury-card"
        >
          <div className="flex items-center justify-between mb-8 border-b border-bronze pb-3">
            <div className="flex items-center gap-3">
              <FlaskConical className="text-gold w-6 h-6" />
              <h2 className="font-display text-xl text-gold tracking-[2px] uppercase">1. Formula Architect</h2>
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowSaved(!showSaved)}
                className="text-gold text-[10px] uppercase tracking-[2px] flex items-center gap-1 hover:text-soft-gold transition-colors"
              >
                Saved Formulas
                <ChevronDown className={`w-3 h-3 transition-transform ${showSaved ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {showSaved && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-64 bg-deep-grey border border-dark-gold z-50 shadow-2xl max-h-64 overflow-y-auto"
                  >
                    {savedFormulas.length === 0 ? (
                      <div className="p-4 text-[10px] text-soft-gold/50 uppercase text-center">No saved formulas</div>
                    ) : (
                      savedFormulas.map(f => (
                        <div key={f.id} className="flex items-center justify-between p-3 border-b border-white/5 hover:bg-white/5 group">
                          <button 
                            onClick={() => loadFormula(f)}
                            className="flex-1 text-left"
                          >
                            <div className="text-[10px] text-gold uppercase font-bold truncate">{f.name}</div>
                            <div className="text-[8px] text-soft-gold/70 uppercase">{f.size}ml @ {f.concentration}%</div>
                          </button>
                          <button 
                            onClick={() => deleteFormula(f.id)}
                            className="opacity-0 group-hover:opacity-100 text-bronze hover:text-red-500 transition-all"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="input-group">
              <label className="luxury-label">Formula Name (to save)</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  className="luxury-input flex-1" 
                  placeholder="e.g. Midnight Oud"
                  value={formulaName}
                  onChange={(e) => setFormulaName(e.target.value)}
                />
                <button 
                  onClick={saveFormula}
                  disabled={!formulaName || isSaving}
                  className="p-2 border border-dark-gold text-gold hover:bg-gold hover:text-black transition-all disabled:opacity-30"
                >
                  <Save className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="input-group">
              <label className="luxury-label">Bottle Size (ml)</label>
              <input 
                type="number" 
                className="luxury-input" 
                placeholder="e.g. 200"
                value={formulaSize}
                onChange={(e) => setFormulaSize(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label className="luxury-label">Concentration (%)</label>
              <input 
                type="number" 
                className="luxury-input"
                value={formulaConc}
                onChange={(e) => setFormulaConc(e.target.value)}
              />
            </div>
            <button onClick={calcFormula} className="luxury-button w-full mt-4 flex items-center justify-center gap-2">
              <Calculator className="w-4 h-4" />
              Calculate
            </button>
          </div>

          <AnimatePresence>
            {formulaResult && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-8 bg-white/5 p-6 border-l-2 border-gold overflow-hidden"
              >
                <div className="flex justify-between mb-3">
                  <span className="text-soft-gold text-sm uppercase tracking-wider">Fragrance Oil:</span>
                  <span className="text-gold font-bold">{formatVolume(formulaResult.oil)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-soft-gold text-sm uppercase tracking-wider">Carrier Base:</span>
                  <span className="text-gold font-bold">{formatVolume(formulaResult.carrier)}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* 2. Profit Clarity */}
        <motion.section 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="luxury-card"
        >
          <div className="flex items-center gap-3 mb-8 border-b border-bronze pb-3">
            <TrendingUp className="text-gold w-6 h-6" />
            <h2 className="font-display text-xl text-gold tracking-[2px] uppercase">2. Profit Clarity</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="input-group">
              <label className="luxury-label">Oil Cost / Unit</label>
              <input 
                type="number" 
                className="luxury-input" 
                placeholder="0.00"
                value={costs.oil}
                onChange={(e) => setCosts({...costs, oil: e.target.value})}
              />
            </div>
            <div className="input-group">
              <label className="luxury-label">Carrier Cost / Unit</label>
              <input 
                type="number" 
                className="luxury-input" 
                placeholder="0.00"
                value={costs.base}
                onChange={(e) => setCosts({...costs, base: e.target.value})}
              />
            </div>
            <div className="input-group">
              <label className="luxury-label">Bottle + Cap</label>
              <input 
                type="number" 
                className="luxury-input" 
                placeholder="0.00"
                value={costs.bottle}
                onChange={(e) => setCosts({...costs, bottle: e.target.value})}
              />
            </div>
            <div className="input-group">
              <label className="luxury-label">Packaging</label>
              <input 
                type="number" 
                className="luxury-input" 
                placeholder="0.00"
                value={costs.pack}
                onChange={(e) => setCosts({...costs, pack: e.target.value})}
              />
            </div>
            <div className="input-group">
              <label className="luxury-label">Shipping / Unit</label>
              <input 
                type="number" 
                className="luxury-input" 
                placeholder="0.00"
                value={costs.ship}
                onChange={(e) => setCosts({...costs, ship: e.target.value})}
              />
            </div>
            <div className="input-group">
              <label className="luxury-label">Selling Price</label>
              <input 
                type="number" 
                className="luxury-input" 
                placeholder="0.00"
                value={costs.sell}
                onChange={(e) => setCosts({...costs, sell: e.target.value})}
              />
            </div>
          </div>
          
          <button onClick={calcProfit} className="luxury-button w-full mt-8 flex items-center justify-center gap-2">
            <DollarSign className="w-4 h-4" />
            Analyze ROI
          </button>

          <AnimatePresence>
            {profitResult && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-8 bg-white/5 p-6 border-l-2 border-gold overflow-hidden"
              >
                <div className="flex justify-between mb-3">
                  <span className="text-soft-gold text-sm uppercase tracking-wider">Total Unit Cost:</span>
                  <span className="text-gold font-bold">{formatCurrency(profitResult.totalCost)}</span>
                </div>
                <div className="flex justify-between mb-3">
                  <span className="text-soft-gold text-sm uppercase tracking-wider">Profit per Unit:</span>
                  <span className="text-gold font-bold">{formatCurrency(profitResult.profit)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-soft-gold text-sm uppercase tracking-wider">Gross Margin:</span>
                  <span className="text-gold font-bold">{profitResult.margin.toFixed(1)}%</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* 3. Batch Execution */}
        <motion.section 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="luxury-card"
        >
          <div className="flex items-center gap-3 mb-8 border-b border-bronze pb-3">
            <Layers className="text-gold w-6 h-6" />
            <h2 className="font-display text-xl text-gold tracking-[2px] uppercase">3. Batch Execution</h2>
          </div>
          
          <div className="space-y-6">
            <div className="input-group">
              <label className="luxury-label">Batch Quantity (Bottles)</label>
              <input 
                type="number" 
                className="luxury-input" 
                placeholder="e.g. 95"
                value={batchQty}
                onChange={(e) => setBatchQty(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label className="luxury-label">Bottle Size (ml)</label>
              <input 
                type="number" 
                className="luxury-input" 
                placeholder="e.g. 200"
                value={batchSize}
                onChange={(e) => setBatchSize(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label className="luxury-label">Concentration (%)</label>
              <input 
                type="number" 
                className="luxury-input"
                value={batchConc}
                onChange={(e) => setBatchConc(e.target.value)}
              />
            </div>
            <button onClick={calcBatch} className="luxury-button w-full mt-4 flex items-center justify-center gap-2">
              <Droplets className="w-4 h-4" />
              Calculate Batch
            </button>
          </div>

          <AnimatePresence>
            {batchResult && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-8 bg-white/5 p-6 border-l-2 border-gold overflow-hidden"
              >
                <div className="flex justify-between mb-3">
                  <span className="text-soft-gold text-sm uppercase tracking-wider">Total Oil Needed:</span>
                  <span className="text-gold font-bold">{formatVolume(batchResult.oil)}</span>
                </div>
                <div className="flex justify-between mb-3">
                  <span className="text-soft-gold text-sm uppercase tracking-wider">Total Carrier Needed:</span>
                  <span className="text-gold font-bold">{formatVolume(batchResult.carrier)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-white/10">
                  <span className="text-soft-gold text-sm uppercase tracking-wider">Total Bulk Volume:</span>
                  <span className="text-gold font-bold">{formatVolume(batchResult.total)}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* 4. Inventory Control */}
        <motion.section 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="luxury-card"
        >
          <div className="flex items-center gap-3 mb-8 border-b border-bronze pb-3">
            <ClipboardList className="text-gold w-6 h-6" />
            <h2 className="font-display text-xl text-gold tracking-[2px] uppercase">4. Inventory Control</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="input-group">
              <label className="luxury-label">Oil Stock (ml)</label>
              <input 
                type="number" 
                className="luxury-input" 
                placeholder="ml"
                value={inventory.oil}
                onChange={(e) => setInventory({...inventory, oil: e.target.value})}
              />
            </div>
            <div className="input-group">
              <label className="luxury-label">Carrier Stock (ml)</label>
              <input 
                type="number" 
                className="luxury-input" 
                placeholder="ml"
                value={inventory.base}
                onChange={(e) => setInventory({...inventory, base: e.target.value})}
              />
            </div>
            <div className="input-group">
              <label className="luxury-label">Bottles</label>
              <input 
                type="number" 
                className="luxury-input" 
                placeholder="qty"
                value={inventory.bottles}
                onChange={(e) => setInventory({...inventory, bottles: e.target.value})}
              />
            </div>
            <div className="input-group">
              <label className="luxury-label">Labels</label>
              <input 
                type="number" 
                className="luxury-input" 
                placeholder="qty"
                value={inventory.labels}
                onChange={(e) => setInventory({...inventory, labels: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-6 mb-8">
            <div className="input-group">
              <label className="luxury-label">Target Concentration (%)</label>
              <input 
                type="number" 
                className="luxury-input"
                value={inventory.conc}
                onChange={(e) => setInventory({...inventory, conc: e.target.value})}
              />
            </div>
            <div className="input-group">
              <label className="luxury-label">Standard Bottle Size (ml)</label>
              <input 
                type="number" 
                className="luxury-input"
                value={inventory.size}
                onChange={(e) => setInventory({...inventory, size: e.target.value})}
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <button onClick={calcInventory} className="luxury-button flex items-center justify-center gap-2">
              <Package className="w-4 h-4" />
              Verify Capacity
            </button>
            <button onClick={resetAll} className="luxury-button luxury-button-reset flex items-center justify-center gap-2">
              <RotateCcw className="w-4 h-4" />
              Reset All
            </button>
          </div>

          <AnimatePresence>
            {inventoryResult && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-8 bg-white/5 p-6 border-l-2 border-gold overflow-hidden"
              >
                <div className="flex justify-between items-center">
                  <span className="text-soft-gold text-sm uppercase tracking-wider">Max Production Capacity:</span>
                  <span className="text-gold font-bold text-2xl">{inventoryResult.maxUnits} Units</span>
                </div>
                {inventoryResult.isLow && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 flex items-center gap-2 text-yellow-500 text-xs italic"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Low stock detected in essential components.
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

      </div>

      {/* Footer */}
      <footer className="text-center py-12 border-t border-white/5 text-dark-gold text-[10px] tracking-[3px] uppercase">
        &copy; {new Date().getFullYear()} Oud & Co. Internal Systems | Confidential Luxury Asset
      </footer>
    </div>
  );
}
