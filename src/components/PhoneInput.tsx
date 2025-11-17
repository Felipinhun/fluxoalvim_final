import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export const PhoneInput = ({ value, onChange, required }: PhoneInputProps) => {
  // Extrair código do país e número
  const countryCode = value.startsWith('+') ? value.substring(0, 3) : '+55';
  const phoneNumber = value.startsWith('+') ? value.substring(3) : value;

  const handleCountryCodeChange = (newCode: string) => {
    const cleanCode = newCode.replace(/[^0-9+]/g, '');
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
        <div className="flex items-center gap-2 w-24">
          <span className="text-2xl">🇧🇷</span>
          <Input
            id="country-code"
            value={countryCode}
            onChange={(e) => handleCountryCodeChange(e.target.value)}
            className="h-11 text-center"
            maxLength={3}
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
