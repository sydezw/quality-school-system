
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { parse, isValid, format } from "date-fns";
import { cn } from "@/lib/utils";
import { formatBirthDate, isValidBirthDate } from "@/utils/dateFormatters";

type BirthDateInputProps = {
  value: Date | null;
  onChange: (date: Date | null) => void;
  error?: string | undefined;
};

const BirthDateInput = ({ value, onChange, error }: BirthDateInputProps) => {
  const [birthText, setBirthText] = useState<string>("");

  useEffect(() => {
    if (value instanceof Date && isValid(value)) {
      setBirthText(format(value, "dd/MM/yyyy"));
    } else if (!value) {
      setBirthText("");
    }
  }, [value]);

  const handleBirthTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formattedValue = formatBirthDate(inputValue);
    
    setBirthText(formattedValue);

    // Valida e converte para Date quando a data estiver completa
    if (formattedValue.length === 10) {
      if (isValidBirthDate(formattedValue)) {
        const parsed = parse(formattedValue, "dd/MM/yyyy", new Date());
        if (isValid(parsed)) {
          onChange(parsed);
        } else {
          onChange(null);
        }
      } else {
        onChange(null);
      }
    } else if (formattedValue === "") {
      onChange(null);
    }
  };

  return (
    <Input
      type="text"
      placeholder="dd/mm/aaaa"
      value={birthText}
      onChange={handleBirthTextChange}
      maxLength={10}
      className={cn("max-w-[200px]", error && "border-destructive")}
      inputMode="numeric"
    />
  );
};

export default BirthDateInput;
