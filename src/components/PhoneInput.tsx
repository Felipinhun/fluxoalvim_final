import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

const countryFlags: Record<string, string> = {
  '+1': '🇺🇸',
  '+55': '🇧🇷',
  '+351': '🇵🇹',
  '+34': '🇪🇸',
  '+33': '🇫🇷',
  '+49': '🇩🇪',
  '+44': '🇬🇧',
  '+39': '🇮🇹',
  '+81': '🇯🇵',
  '+86': '🇨🇳',
  '+91': '🇮🇳',
  '+52': '🇲🇽',
  '+54': '🇦🇷',
  '+56': '🇨🇱',
  '+57': '🇨🇴',
  '+598': '🇺🇾',
  '+595': '🇵🇾',
};

// Extrai código do país de forma inteligente
const extractCountryCode = (fullValue: string): { code: string; number: string } => {
  if (!fullValue.startsWith('+')) {
    return { code: '+55', number: fullValue };
  }
  
  // Tenta encontrar o código do país mais longo que corresponde
  const knownCodes = Object.keys(countryFlags).sort((a, b) => b.length - a.length);
  for (const code of knownCodes) {
    if (fullValue.startsWith(code)) {
      return { code, number: fullValue.substring(code.length) };
    }
  }
  
  // Se não encontrar, assume que o código tem entre 1-4 dígitos após o +
  const match = fullValue.match(/^(\+\d{1,4})/);
  if (match) {
    return { code: match[1], number: fullValue.substring(match[1].length) };
  }
  
  return { code: '+55', number: fullValue.replace('+', '') };
};

export const PhoneInput = ({ value, onChange, required }: PhoneInputProps) => {
  const { code: countryCode, number: phoneNumber } = extractCountryCode(value);
  
  const flag = countryFlags[countryCode] || '🌍';

  const handleCountryCodeChange = (newCode: string) => {
    // Garante que começa com + e só permite números depois
    let cleanCode = newCode;
    if (!cleanCode.startsWith('+')) {
      cleanCode = '+' + cleanCode.replace(/[^0-9]/g, '');
    } else {
      cleanCode = '+' + cleanCode.substring(1).replace(/[^0-9]/g, '');
    }
    onChange(cleanCode + phoneNumber);
  };

  const handlePhoneChange = (newPhone: string) => {
    const cleanPhone = newPhone.replace(/[^0-9]/g, '');
    onChange(countryCode + cleanPhone);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="telefone">Telefone com DDD</Label>
      <div className="flex gap-2">
        <div className="flex items-center gap-1 w-28">
          <span className="text-xl">{flag}</span>
          <Input
            id="country-code"
            value={countryCode}
            onChange={(e) => handleCountryCodeChange(e.target.value)}
            className="h-11 text-center px-1"
            maxLength={5}
          />
        </div>
        <Input
          id="telefone"
          required={required}
          type="tel"
          value={phoneNumber}
          onChange={(e) => handlePhoneChange(e.target.value)}
          placeholder="11999999999"
          className="h-11 flex-1"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Insira DDD + número (apenas números)
      </p>
    </div>
  );
};
