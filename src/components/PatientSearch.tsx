import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';

interface Paciente {
  id: string;
  nome: string;
  sobrenome: string;
  telefone: string;
  email: string | null;
  observacao: string | null;
}

interface PatientSearchProps {
  onSelect: (paciente: Paciente) => void;
  onClear?: () => void;
}

export function PatientSearch({ onSelect, onClear }: PatientSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Paciente[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Paciente | null>(null);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 2 || selected) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      const { data } = await supabase
        .from('pacientes')
        .select('*')
        .or(`nome.ilike.%${query}%,sobrenome.ilike.%${query}%,telefone.ilike.%${query}%`)
        .limit(8);

      setResults(data || []);
      setIsOpen(true);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, selected]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (paciente: Paciente) => {
    setSelected(paciente);
    setQuery(`${paciente.nome} ${paciente.sobrenome}`);
    setIsOpen(false);
    onSelect(paciente);
  };

  const handleClear = () => {
    setSelected(null);
    setQuery('');
    setResults([]);
    onClear?.();
  };

  return (
    <div ref={containerRef} className="relative space-y-2">
      <Label>Buscar Paciente</Label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (selected) setSelected(null);
          }}
          placeholder="Buscar por nome ou telefone..."
          className="h-11 pl-9 pr-9"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {selected && (
        <p className="text-xs text-primary flex items-center gap-1">
          ✓ Paciente selecionado — campos preenchidos automaticamente
        </p>
      )}

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 top-full mt-1 w-full rounded-md border bg-popover shadow-lg max-h-60 overflow-auto">
          {results.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelect(p)}
              className="w-full text-left px-3 py-2.5 hover:bg-accent/50 transition-colors border-b last:border-b-0 border-border/50"
            >
              <div className="font-medium text-sm text-foreground">
                {p.nome} {p.sobrenome}
              </div>
              <div className="text-xs text-muted-foreground">{p.telefone}</div>
            </button>
          ))}
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute z-50 top-full mt-1 w-full rounded-md border bg-popover shadow-lg p-3">
          <p className="text-sm text-muted-foreground text-center">Nenhum paciente encontrado</p>
        </div>
      )}
    </div>
  );
}
